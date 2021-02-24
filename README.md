# chronos-multi-cam-control

## Multi-Camera Control via Webpage

By inputting IP addresses, users can start/stop video recording, set resolution, frame rate and exposure, establish network storage (SMB/NFS) and save videos in different save locations or formats.

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/whole_screen.png)

## Server-Side Update

There is one place that needs to be updated in the server-side (camera-side) to allow cross-origin resource sharing (CORS). In the */cgi-bin/netShare*, *Access-COntrol-Allow-Origin* is added and allows accesses from all domains:

(This update can be made directly in the camera */usr/share/chronos-http/cgi-bin/netShare* for temporary tests.)

## IP Addresses Input

Input cameras' IP adresses in the text area in *Camera IP Address* section, separated by comma or dash. 

Clicking *Confirm* button will check IP addresses' validity and cameras' connection. Invalid and disconnected IP addresses will be removed to continue. A pop-up window will show up to warn users that which IP address is removed by what reason. 

All valid and connected cameras will be listed below the text area in *IP Address - Chronos Version, Color Pattern, Memory Size, Serial Number* format. A *delete* button will show behind each IP address for users to delete this IP address. 

IP addresses in the text area and display list will stay after page refresh, but users need to click *Confirm* button again to control or set these cameras.

To clear all IP addresses, use *Clear* button.

![image](https://github.com/krontech/chronos-multi-cam-control/blob/master/screenshots/cmarea_ip_addresses.png)

## Set Parameters

Setting exposure in time/percentage/shutter angle/slider, resolution and frame rate is the same as controlling single Chronos camera via webpage. If users control Chronos 1.4 and 2.1 at the same time, some resolutions will NOT be valid (i.e. 1920x1080), and exposure and frame rate limits will follow the minimum value between 1.4 and 2.1.

## Save Video

Only external storage devices that all cameras have will be showed in the *Location* dropdown.

Videos will be saved as *vid_YYYY-MM-DD_HH-MM-SS_SerialNumber* if users choose to save with automatic name. If users input a customer-defined name, videos will save as *filename_SerialNumber*.

## Screenshot and Parameter Display

After clicking *Confirm* button, preview and parameters will show if there is at least one valid camera. The preview and parameters are from the first camera in the list. As mentioned above, resolution, exposure and frame rate are limited if connected camreas are mixed (have both 1.4 and 2.1), so the preview and parameters will change under this condition. 
