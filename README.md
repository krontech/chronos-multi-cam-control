# Chronos-Multi-Cam-Control Webpage
The multiple camera control web interface gives Chronos users the freedom to control multiple cameras over ethernet network at the same time. Users can start/stop video recording, set resolution, frame rate, exposure, establish network storage (SMB/NFS) and save videos to different locations or formats (H.264, CinemaDNG, TIFF, and TIFF RAW). To install this interface, users can clone or download this Github repository and access the web interface through opening the main.html file in the directory on their web browser. 

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/whole_screen.png)

## Setup Guides
For information on "How to setup a Chronos camera to the Network", refer to the Network Setup guide https://www.krontech.ca/wp-content/uploads/2020/03/Network-Control-v0.6.5.pdf
<b> Note: Chronos cameras connected through USB will have a fixed IP address of "192.168.12.1". </b> Therefore, only one camera can be connected through USB. In order to have multiple cameras connected, users would require to connect through ethernet network. Please consult with your IT Department, if you experience network connectivity issue as most organizations have firewalls set in place.

For more information on "How to Setup Chronos camera with SMB Network", refer to the SMB Share Setup Guide. https://www.krontech.ca/wp-content/uploads/2020/07/Chronos-SMB-Share-Setup-Guide.pdf 

Perform Black Calibration, when the record settings are changed. For more info refer to the user manual. https://www.krontech.ca/wp-content/uploads/2021/02/Chronos-1.4-and-2.1-User-Manual-Software-Version-0.6.0.pdf#page=15


## IP Addresses Input

Input all Chronos cameras IP addresses in the text box under *Camera IP Address* section, separated by comma or dash. 

Press *Confirm* button to verify the IP addresses and establish connection. Invalid and disconnected IP addresses will be removed to continue. A pop-up window will appear to warn users if any IP addresses need to be removed before proceeding. 

All valid and connected cameras will be listed below the text area in *IP Address - Chronos Version, Color Pattern, Memory Size, Serial Number* format. A *delete* button will show behind each IP address for users to remove a camera from the webpage. 

IP addresses input in the text box will remain after page refresh, but users need to click *Confirm* button again to establish connection again.

To clear all IP addresses, use *Clear* button.

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/cmarea_ip_addresses.png)

## Set Parameters

Setting exposure in time/percentage/shutter angle/slider, resolution and frame rate is the similar to controlling single Chronos cameras via webpage. If users control Chronos 1.4 and 2.1 at the same time, some resolutions will NOT be valid (i.e. 1920x1080), exposure and frame rate will also be limited to record settings that are achievable with both 1.4 and 2.1. For more information on resolutions and record settings refer to the datasheets.

Chronos 1.4: https://www.krontech.ca/wp-content/uploads/2019/03/FM-ENGR-50001-Chronos-1.4-Datasheet-Rv4-1.pdf

Chronos 2.1: https://www.krontech.ca/wp-content/uploads/2020/02/FM-ENGR-50002-Chronos-2.1-HD-Datasheet-Rev4.pdf

## Save Video

All Chronos cameras connected via webpage must have the same type of external storage device to save efficiently such as SD, SSD, or USB.

Videos will be saved as *vid_YYYY-MM-DD_HH-MM-SS_SerialNumber* if users choose to save with automatic name. If users input a customer-defined name, videos will save as *filename_SerialNumber*. The recorded footage can be differentiated by the camera serial numbers. <b> Note: Saving to SMB or NFS network storage is recommended for better success saving multiple videos and verifying all videos from Chronos cameras are saved to the directory before proceeding. </b>


## Screenshot and Parameter Display

After clicking *Confirm* button, video preview and settings will appear on the webpage if there is at least one valid IP address. The video preview and settings will default to first camera input in the list. By clicking on the any Chronos IP address hyperlink, users can switch to that camera's sceen and settings. As mentioned above, resolution, exposure and frame rate will be limited if webpage has both Chronos 1.4 and 2.1 models connected. 

## Notes
- Chronos cameras connected through USB will have a fixed IP address of "192.168.12.1".
- Due to network delays, recorded frame length from each camera will slightly differ.
- Controlling both Chronos 1.4 and 2.1 to the webpage, will limit the record setting to compliment both models. For more info, review the datasheets.
- Saving to SMB or NFS network storage is recommended for better success saving multiple videos and verifying all videos from Chronos cameras are saved to the directory before proceeding.
