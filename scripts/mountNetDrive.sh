#!/bin/bash

## This program sits and waits for the file /tmp/mountRequest.nf to change, and when it does,
## this program attempts to mount a network drive

## Nicholas Faliszewski
## May 2020


if [ ! -f /tmp/mountRequest.nf ]
then
	echo "file does not exist already... creating"
	install -m 666 /dev/null /tmp/mountRequest.nf ## create the file if it does not already exist (with write permissions)
fi

backupIFS=$IFS
IFS=" "
while inotifywait -e close_write /tmp/mountRequest.nf ## watch this file for changes
do
	dateTime=$(date)
	echo "Actions now triggered at $dateTime"

	contents=$(cat /tmp/mountRequest.nf)

	echo "contents are: $contents"
	params=($contents) ## copy and split using IFS

	echo "parameters are: 0: ${params[0]}, 1: ${params[1]}, 2: ${params[2]}, 3 ${params[3]}, 4: ${params[4]}, 5: ${params[5]}"

	## check if I'm getting a nfs or smb mount request
	if [[ "${params[1]}" == "mount:" ]] && ([[ ${params[5]} == "/media/nfs" ]] || [[ "${params[5]}" == "/media/smb" ]])
	then
		## verify that the request is valid (format is: IP.Add.re.ss:/folder/location)
		if [[ "${params[2]}" == *"."*"."*"."* ]] ## if it's a valid-seeming IP address
		then
			echo "valid-seeming IP address"

			pingResult=$(ping -c1 ${params[2]}) ## do a test ping to see if there is something at this address

			if [[ "$pingResult" == *"Unreachable"* ]] || [[ "$pingResult" == *"100% packet loss"* ]] ## without this out, the mount command hangs for a very long time
			then
				echo "could not find server address; exiting"
				echo "Could not reach server address; failed" > /tmp/mountRequest.nf
				continue ## don't run the rest of this
			fi

		else
			echo "invalid IP address: ${params[2]}"
			echo "Invalid IP address; failed" > /tmp/mountRequest.nf
			continue ## don't run the rest of this
		fi

		if [[ "${params[3]}" == *"/"* ]] ## if it's a valid-seeming folder location
		then
			echo "valid-seeming folder location"
		else
			echo "invalid share folder: ${params[3]}"
			echo "Invalide share folder; failed" > /tmp/mountRequest.nf
			continue ## don't run the rest of this
		fi

		if [[ "${params[5]}" == "/media/nfs" ]] ## NFS mount
		then
			if [ -d /media/nfs ] ## check if the folder already exists
			then
				echo "folder already exists"

				## check if the remote folder is already mounted
				if [[ $(df -h) == *"nfs"* ]] ## check if an nfs share was already mounted
				then
					echo "something already mounted"
					echo "removing previous mount"
					umount /media/nfs ## unmount the nfs share 
				fi

			else ## folder did not already exist
				echo "making new directory"
				mkdir /media/nfs
			fi
			
		elif [[ "${params[5]}" == "/media/smb" ]] ## SMB mount
		then
			if [ -d /media/smb ] ## check if the folder already exists
			then
				echo "folder already exists"

				## check if the remote folder is already mounted
				if [[ $(df -h) == *"smb"* ]] ## check if an smb share was already mounted
				then
					echo "something already mounted"
					echo "removing previous mount"
					umount /media/smb ## unmount the smb share 
				fi

			else ## folder did not already exist
				echo "making new directory"
				mkdir /media/smb
			fi
		fi
			

		echo "now trying to mount the folder"
		
		if [[ "${params[5]}" == "/media/nfs" ]] ## NFS mount
		then
			## try to mount the network folder to the local mount point
			mount -t "nfs4" ${params[2]}:${params[3]} /media/nfs

			if [[ $(df -h) == *"nfs"* ]] ## check if the folder was mounted successfully
			then
				echo "successfully mounted"
				## notify of the success (probably write to a file)
				echo "successfully mounted nfs" > /tmp/mountRequest.nf
			else
				echo "mounting failed"
				## notify of the failure (probably write to a file)
				echo "failed to mount nfs" > /tmp/mountRequest.nf
			fi
		elif [[ "${params[5]}" == "/media/smb" ]] ## SMB mount
		then
			if [[ "${params[2]}" = "//"* ]]
			then
				## try to mount the network folder to the local mount point
				mount -t "cifs" -o username="${params[6]}",password="${params[7]}",noserverino ${params[2]}${params[3]} /media/smb
			else
				mount -t "cifs" -o username="${params[6]}",password="${params[7]}",noserverino //${params[2]}${params[3]} /media/smb
			fi

			if [[ $(df -h) == *"smb"* ]] ## check if the folder was mounted successfully
			then
				echo "successfully mounted"
				## notify of the success (probably write to a file)
				echo "successfully mounted smb" > /tmp/mountRequest.nf
			else
				echo "mounting failed"
				## notify of the failure (probably write to a file)
				echo "failed to mount smb" > /tmp/mountRequest.nf
			fi
		fi
	elif [[ "${params[1]}" == "unmount:" ]]
	then
		if [[ "${params[2]}" == *"nfs"* ]] && [ -d /media/nfs ] ## asking to unmount nfs and it's been mounted
		then
			umount /media/nfs
			echo "nfs unmounted"
			rmdir /media/nfs
			echo "Unmounted /media/nfs successfully" > /tmp/mountRequest.nf
		elif [[ "${params[2]}" == *"smb"* ]] && [ -d /media/smb ] ## asking to unmount smb and it's been mounted
		then
			umount /media/smb
			echo "smb unmounted"
			rmdir /media/smb
			echo "Unmounted /media/smb successfully" > /tmp/mountRequest.nf
		else
			echo "Already unmounted; failed" > /tmp/mountRequest.nf
		fi
	elif [[ "${params[1]}" == "test:" ]]
	then
		if [[ "${params[2]}" == *"nfs"* ]] && [ -d /media/nfs ] ## check if nfs was mounted already
		then
			touch /media/nfs/ChronosTestFile.txt ## make a test file
			echo "Testing 1-2-3" > /media/nfs/ChronosTestFile.txt ## try writing to the file

			readBack=$(cat /media/nfs/ChronosTestFile.txt) ## read the contents of the file

			rm /media/nfs/ChronosTestFile.txt ## delete the file

			if [[ "$readBack" == "Testing 1-2-3"* ]] ## verify that the contents were written successfully
			then
				echo "Tested successfully" > /tmp/mountRequest.nf
			else
				echo "Test failed; could not write to drive" > /tmp/mountRequest.nf
			fi
			
		elif [[ "${params[2]}" == *"smb"* ]] && [ -d /media/smb ] ## check if nfs was mounted already
		then
			touch /media/smb/ChronosTestFile.txt ## make a test file
			echo "Testing 1-2-3" > /media/smb/ChronosTestFile.txt ## try writing to the file

			readBack=$(cat /media/smb/ChronosTestFile.txt) ## read the contents of the file

			rm /media/smb/ChronosTestFile.txt ## delete the file

			if [[ "$readBack" == "Testing 1-2-3"* ]] ## verify that the contents were written successfully
			then
				echo "Tested successfully" > /tmp/mountRequest.nf
			else
				echo "Test failed; could not write to drive" > /tmp/mountRequest.nf
			fi

		else
			echo "Test failed; drive not mounted" > /tmp/mountRequest.nf
		fi
	else
		echo "Invalid network share type: ${params[5]}"
	fi
done ## go back to waiting for the file to change
IFS=$backupIFS


echo ":::: End of program ::::"

exit
exit

#echo "you gave me this: nfs/smb: $1  IPAddress: $2  folderLocation: $3"




