# Chronos-Multi-Cam-Control Webpage
The multiple camera control web interface gives Chronos users the freedom to control multiple cameras over ethernet network at the same time. Users can start/stop video recording, set resolution, frame rate, exposure, establish network storage (SMB/NFS) and save videos to different locations or formats (H.264, CinemaDNG, TIFF, TIFF RAW). You can simply clone or download this Github repository and access the web interface through opening the main.html file in the directory on your favorite web browser. 

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/whole_screen.png)

## Network Setup Guide
For information on "How to setup Chronos camera to the Network", refer to the Network Setup guide https://www.krontech.ca/wp-content/uploads/2020/03/Network-Control-v0.6.5.pdf
<b> Note: Chronos cameras connected through USB will have a fixed IP address of "192.168.12.1". </b> Therefore, only one camera can be connected through USB. In order to have multiple cameras connected, you would require connection to Ethernet. Please consult with your IT Department, if you experience network connectivity issue as most organizations have firewalls set in place.

For more information on "How to Setup Chronos camera with SMB Network", refer to this guide. https://www.krontech.ca/wp-content/uploads/2020/07/Chronos-SMB-Share-Setup-Guide.pdf 


## Server-Side Update

There is one place that needs to be updated in the server-side (camera-side) to allow cross-origin resource sharing (CORS). In the */cgi-bin/netShare*, *Access-Control-Allow-Origin* is added and allows accesses from all domains:

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/netShare_update.png)

(This update can be made directly in the camera */usr/share/chronos-http/cgi-bin/netShare* for temporary tests.)

## IP Addresses Input

Input cameras' IP adresses in the text area in *Camera IP Address* section, separated by comma or dash. 

Clicking *Confirm* button will check IP addresses' validity and cameras' connection. Invalid and disconnected IP addresses will be removed to continue. A pop-up window will appear to warn users which IP addresses need to be removed and their reason. 

All valid and connected cameras will be listed below the text area in *IP Address - Chronos Version, Color Pattern, Memory Size, Serial Number* format. A *delete* button will show behind each IP address for users to delete this IP address. 

IP addresses in the text area and display list will stay after page refresh, but users need to click *Confirm* button again to control or set these cameras.

To clear all IP addresses, use *Clear* button.

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/cmarea_ip_addresses.png)

## Set Parameters

Setting exposure in time/percentage/shutter angle/slider, resolution and frame rate is the similar to controlling single Chronos cameras via webpage. If users control Chronos 1.4 and 2.1 at the same time, some resolutions will NOT be valid (i.e. 1920x1080), exposure and frame rate will also be limited to record settings that are achievable with both 1.4 and 2.1. For more information on resolutions and record setting refer to the Datasheets.

Chronos 1.4: https://www.krontech.ca/wp-content/uploads/2019/03/FM-ENGR-50001-Chronos-1.4-Datasheet-Rv4-1.pdf

Chronos 2.1: https://www.krontech.ca/wp-content/uploads/2020/02/FM-ENGR-50002-Chronos-2.1-HD-Datasheet-Rev4.pdf

## Save Video

All Chronos cameras connected via webpage must have the same type of external storage device to save efficiently such as SD, SSD, or USB.

Videos will be saved as *vid_YYYY-MM-DD_HH-MM-SS_SerialNumber* if users choose to save with automatic name. If users input a customer-defined name, videos will save as *filename_SerialNumber*. The recorded footage can be differentiated by their Serial Numbers. <b> Note: Saving to SMB or NFS network storage is recommended for better success saving multiple videos and verifying all videos from Chronos cameras are saved to the directory before proceeding. </b>


## Screenshot and Parameter Display

After clicking *Confirm* button, video preview and settings will appear on the webpage if there is at least one valid IP address. The video preview and settings will default to first camera in the list. By clicking on the selected Chronos IP address hyperlink, users can switch to the camera sceen and settings they wish to view. As mentioned above, resolution, exposure and frame rate will be limited if webpage has both Chronos 1.4 and 2.1 models connected. 

## Notes
- Chronos cameras connected through USB will have a fixed IP address of "192.168.12.1".
- Due to network delays, recorded frame length from each camera will slightly differ.
- Controlling both Chronos 1.4 and 2.1 to the webpage, will limit the record setting to compliment both models. For more info, review the datasheets.
- Saving to SMB or NFS network storage is recommended for better success saving multiple videos and verifying all videos from Chronos cameras are saved to the directory before proceeding.
