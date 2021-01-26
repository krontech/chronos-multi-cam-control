$(function() {

    var i; // index for loop among all cameras
    var ipArray = []; // array to store all ip addresses (with http://)
    var camInfo = [];
    var ipDisplay = []; // array to store all ip addresses (without http://) to display
    var first_camera_addr = ""; // first address in the ip list for display
    var camVersion = [];
    var camSerial = []; 

    // Check IP addresses
    function checkIp() {
        var ipSplit = [];
        for (i = 0; i < ipArray.length; i++) {
            ipArray[i] = ipArray[i].split(" ").join(""); // remove any space
            ipSplit = ipArray[i].split(".");

            if (ipSplit.length != 4) {
                return false;
            }

            for (var j = 0; j < ipSplit.length; j++) {
                if ( isNaN(ipSplit[j]) ) {
                    return false;
                }
            }  
        }

        return true;
    }

    // Input IP addresses
    function getIpAddress(){
        // Remove all former ip and information
        ipArray = [];
        ipDisplay = [];
        camInfo = [];

        var ipList = document.getElementById("ip_address_area").value;
        ipArray = ipList.split(",");

        var checkResult = checkIp();
        if (!checkResult) {
            alert("IP address(es) Invalid!");
        }

        for (i = 0; i < ipArray.length; i++) {
            ipDisplay[i] = ipArray[i];
            ipArray[i] = "http://" + ipArray[i];
        }
        first_camera_addr = ipArray[0];
    }
    // Get Information (Model, Color/Mono, Memory Size & Serial Number)
    function getCamInfo() {
        var ipDisplay = [];
        var list = document.getElementById("ipList");
        list.innerHTML = ""

        list.innerHTML += "The list of IP addresses:<br>";
        for (i = 0; i < ipArray.length; i++) {
            $.ajax({
                url: ipArray[i]+"/control/get",
                data: {"cameraModel":"",
                       "cameraMemoryGB":"",
                       "cameraSerial":"",
                       "sensorColorPattern":"",},
                async: false,
                method: "GET",
                timeout: 10000,
            })
            .done(function(data) {
                if (data.cameraModel.startsWith("CR14")) {
                    camInfo[i] = " - Chronos 1.4, ";
                    camVersion[i] = "1.4";
                }
                else {
                    camInfo[i] = " - Chronos 2.1, ";
                    camVersion[i] = "2.1";
                }

                if (data.sensorColorPattern == "GRBG") {
                    camInfo[i] += "Color, ";
                }
                else {
                    camInfo[i] += "Monochrome, ";
                }

                camInfo[i] += data.cameraMemoryGB + "GB, Serial " + data.cameraSerial;
                camSerial[i] = data.cameraSerial;
            });
        }
        return camInfo, camVersion;
    }
    // Display IP, Camera Information and Parameters (from the first valid camera in the ip list)
    function displayCam() {
        getCamInfo();
        var list = document.getElementById("ipList");
        list.innerHTML = "";

        list.innerHTML += "The list of IP addresses:<br>";
        for (i = 0; i < ipDisplay.length; i++) {
            if ( typeof(camInfo[i]) == "undefined" ) {
                alert("Camera(s) Disconnected!");
            }
            list.innerHTML += '<li id="ipAddress'+ i +'">' + '<span>' + ipDisplay[i] + camInfo[i] + '</span>' + 
                              '<button type="button" id= "button'+ i +'" onclick="deleteIp(this)">delete</button></li>';
        }

        // Get & display parameters from the first camera on the list
        getResolution();
        getExposure();
        presetResolutions(); 
        externalStorage();
    }

    

    // Clear textarea
    function clearIpAddress(){
        document.getElementById("ip_address_area").value='';
        document.getElementById("ip_list").innerHTML="";
    }

    // Start record
    function startRecording(type){
        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url:ipArray[i]+"/control/startRecording ",
                data:{},
                method:"GET",
                success: function(data){
                    if(type == "toggle"){
                        $("#btn_toggle_record").removeClass("start");
                        $("#btn_toggle_record").addClass("stop");
                        $("#btn_toggle_record").val("Recording");
                    }
                },
                error: function(error){
                    alert("Error: Can't start recording.");
                },
                complete: function(data){
                    console.log("Complete starting recording.");
                },
                timeout: 10000});   
        }
    }

    // Stop record
    function stopRecording(type){
        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url:ipArray[i]+"/control/stopRecording",
                data:{},
                method:"GET",
                success: function(data){
                    if(type == "toggle"){
                        $("#btn_toggle_record").removeClass("stop");
                        $("#btn_toggle_record").addClass("start");
                        $("#btn_toggle_record").val("Record");
                    }
                },
                error: function(error){
                    alert("Error: Can't stop recording.");
                },
                complete: function(data){
                    console.log("Complete stopping recording.");
                },
                timeout: 10000});
        }
    }

    /* Get settings from the first camera in the IP list */
    // Resolution Box
    function getResolution(){
        $.ajax({
            url:first_camera_addr+"/control/get",
            data:{"resolution":"",},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                $("#hRes").val(data.resolution.hRes);
                $("#vRes").val(data.resolution.vRes);
                $("#fps").val(parseFloat(1 / parseFloat(data.resolution.minFrameTime)).toFixed(2));
                //$("#hOff").val(data.resolution.hOffset);
                //$("#vOff").val(data.resolution.vOffset);
            });    
    }
    // Exposure Box
    function getExposure(){
        $.ajax({
            url:first_camera_addr+"/control/get",
            data:{"exposurePeriod":"",
                  "exposurePercent":"",
                  "shutterAngle":"",
                  "exposureMin":"",
                  "exposureMax":"",
                  "framePeriod":"",},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                // Exposure Inputs Display
                $("#exposureTime").val(parseFloat(data.exposurePeriod / 1000).toFixed(1));
                $("#exposurePercent").val(data.exposurePercent.toFixed(1));
                $("#exposureDegrees").val(data.shutterAngle.toFixed(1));
                // Shutter Display
                document.getElementById("shutter").min = data.exposureMin;
                document.getElementById("shutter").max = data.exposureMax;
                var value = Math.sqrt(data.exposurePeriod / data.exposureMax) * data.exposureMax;
                $("#shutter").val(value);
            });
    }

    /* Set parameters from webpage to all cameras on the IP list */
    // initial resolution parameters
    var init_resolution = {
        "framePeriod": 100000,
        "resolution": {
            bitDepth: 12,
            hRes: 640,
            minFrameTime: 0.000444622,
            vDarkRows: 0,
            vRes: 480,
        }
    }
    // Resolution Presets
    var resolutionPresets21 = [	
                                [1920, 1080, 1000.11],
                                [1280, 1024, 1512.01],
                                [1280, 720, 2142.19],
                                [1280, 512, 2996.77],
                                [1280, 360, 4229.89],
                                [1280, 240, 6265.15],
                                [1280, 120, 12075.40],
                                [1280, 96, 14825.14],
                                [1024, 768, 2531.65],
                                [1024, 576, 3358.86],
                                [800, 600, 4352.63],
                                [800, 480, 5406.98],
                                [640, 480, 5406.98],
                                [640, 360, 7135.42],
                                [640, 240, 10488.12],
                                [640, 120, 19783.96],
                                [640, 96, 24046.55],
                            ];
    var resolutionPresets14 = [	
                                [1280, 1024, 1069.61],
                                [1280, 720, 1519.89],
                                [1280, 512, 2134.78],
                                [1280, 360, 3030.82],
                                [1280, 240, 4532.87],
                                [1280, 120, 8986.58],
                                [1280, 96, 11184.31],
                                [1024, 768, 1770.05],
                                [1024, 576, 2357.63],
                                [800, 600, 2871.91],
                                [800, 480, 3585.95],
                                [640, 480, 4434.59],
                                [640, 360, 5899.71],
                                [640, 240, 8810.57],
                                [640, 120, 17391.30],
                                [640, 96, 21598.27],
                                [336, 240, 15968.83],
                                [336, 120, 31294.01],
                                [336, 96, 38726.67],
                                [320, 240, 16682.24],
                                [320, 120, 32668.00],
                                [320, 96, 40413.84],
                            ];

    function checkVersion() {
        var sameVer = !camVersion.some(function(value) {
                            return value !== camVersion[0];
                      });
        if (sameVer) {
            return camVersion[0];
        }
        else {
            return "Mix";
        }
    }

    function presetResolutions() {
        var version = checkVersion();
        console.log(version);
        var list = document.getElementById("resolution");
        list.innerHTML = "";

        if (version == "1.4") {
            for (i = 0; i < resolutionPresets14.length; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets14[i][0] + "x" + resolutionPresets14[i][1] + " @ " + resolutionPresets14[i][2] + "fps </a>"
            }
        }
        else if (version == "2.1") {
            for (i = 0; i < resolutionPresets21.length; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets21[i][0] + "x" + resolutionPresets21[i][1] + " @ " + resolutionPresets21[i][2] + "fps </a>"
            }
        }
        else {
            alert("Different Version. Some Resolutions invalid!");
            for (i = 0; i < resolutionPresets21.length-1; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets14[i][0] + "x" + resolutionPresets14[i][1] + " @ " + resolutionPresets14[i][2] + "fps </a>"
            }
        }
    }
    
    // Resolution & Frame Rate
    function setResFrameRate(){
        if($("#hRes").val()){
            init_resolution.resolution.hRes = parseInt($("#hRes").val());
        }else{
            alert("Please select a resolution.");
            return;
        }

        if($("#vRes").val()){
            init_resolution.resolution.vRes = parseInt($("#vRes").val());
        }else{
            alert("Please select a resolution.");
            return;
        }

        if($("#fps").val()){
            init_resolution.framePeriod = parseInt(1000000000/parseInt($("#fps").val()));
        }else{
            alert("Please input a frame rate value.");
            return;
        }

        init_resolution.resolution.minFrameTime = parseFloat($("#fps").attr("data-minFramePeriod"));
        
        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url:ipArray[i]+"/control/set",
                data:JSON.stringify(init_resolution),
                method:"POST",
                contentType: "application/json",
                timeout: 10000
            });
        }
    }
    // Set Frame Rate to its max value
    function getMaxFrameRate() {
        $.ajax({
            url:first_camera_addr+"/control/get",
            data:{"minFramePeriod":""},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                var fpsBox = document.getElementById("fps") ;
                fpsBox.value = parseFloat(1000000000 / parseFloat(data.minFramePeriod)).toFixed(2) ;;
                fpsBox.max = fpsBox.value ;
            });
    }
    // Set Exposure
    function setExposure(obj){
        // Fix values with their limits
        boundInput(obj);       

        var sendParams = "";

        switch (obj.id){
            case "exposureTime":
                sendParams = '{"exposurePeriod":' + parseInt(obj.value * 1000) + '}';
                break;
            case "exposurePercent":
                sendParams = '{"exposurePercent":' + parseFloat(obj.value) + '}';
                break;
            case "exposureDegrees":
                sendParams = '{"shutterAngle":' + parseFloat(obj.value) + '}';
                break;
        }

        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: sendParams,
                method: "POST",
                contentType: "application/json",
                timeout: 10000
            });
        }
    }
    // Slider
    function holdWhileSliding(obj){
        var exposureValue = Math.pow( (obj.value - obj.min) / (obj.max - obj.min), 2 ) * obj.max;
        var sendParams = '{"exposurePeriod":' + parseInt(exposureValue) + '}';
        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: sendParams,
                method: "POST",
                contentType: "application/json",
                timeout: 10000
            });
        }
    }
    // Set Exposure to its max value
    function maxShutter(){
        var sendParams = '{"exposurePercent":' + parseFloat(100) + '}';
        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: sendParams,
                method: "POST",
                contentType: "application/json",
                timeout: 10000
            });
        }
    }

    /* SMB Network Storage */
    // Password Show/Hide
    function PassShowHide() { // toggle the class (active/inactive), change the name, and run a function for a toggle button/switch
        let smbPass = document.getElementById("smbPass");
        if (smbPass.type == "password")
        {
            smbPass.placeholder = "s3cr3t";
            smbPass.type = "text";
        }
        else if (smbPass.type == "text")
        {
            smbPass.placeholder = "******";
            smbPass.type = "password";
        }
    }
    // Network Storage
    // Keep SMB & NFS (in case)
    function netStorageRequest(command, type) {

        if (type == "nfs") {
            var address = document.getElementById("nfsAddress").value ;
            var mount = document.getElementById("nfsMount").value ;
        }
        else {
            var address = document.getElementById("smbAddress").value ;
            var mount = document.getElementById("smbMount").value ;
        }
    
        //var requestSender = new XMLHttpRequest() ;
        var parameters = "" ;
    
        if (command == "unmount") { // unmount the network drive
            if (type == "nfs")
                parameters = "nfs=unmount" ;
            else if (type == "smb")
                parameters = "smb=unmount" ;
    
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("netShareResultBox").firstChild.textContent = "Requesting that the shared drive be disconncted..." ;
            document.getElementById("netShareResultBox").classList.remove("hidden") ;
        }
        else if (command == "test") { // run the test input
            if (type == "nfs")
                parameters = "nfs=test" ;
            else if (type == "smb")
                parameters = "smb=test" ;
    
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("netShareResultBox").firstChild.textContent = "Testing the share drive (trying to write a file and read it back)..." ;
            document.getElementById("netShareResultBox").classList.remove("hidden") ;
        }
        else if ( (address == "") || (mount == "") ) {
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("netShareResultBox").firstChild.textContent = "Please enter an IP address and a mount location" ;
            document.getElementById("netShareResultBox").classList.remove("hidden") ;
            return (0) ;
        }
        else {
            if (mount[0] != "/")
            mount = "/" + mount ; // add leading "/" if it wasn't already there
            
            if (type == "nfs") {
                parameters = "nfs=" + address + "&mount=" + mount ;
                document.getElementById("netShareResultBox").firstChild.textContent = "Attempting to connect to NFS share..." ;
            }
            else if (type == "smb") {
                parameters = "smb=" + address + "&mount=" + mount + "&" + document.getElementById("smbUName").value + "=" + document.getElementById("smbPass").value ;
                document.getElementById("netShareResultBox").firstChild.textContent = "Attempting to connect to SMB share..." ;
            }
    
            // show the status
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("netShareResultBox").classList.remove("hidden") ;
        }

        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/cgi-bin/netShare?",
                data: parameters,
                method: "GET",
                contentType: "application/json",
                timeout: 10000
            });
        } 
    }

    // Different buttons invoke different functions
    var inputFunctions = { 
                            "nfsTestBtn":		function() { if (!document.getElementById("nfsTestBtn").classList.contains("disabled")) { netStorageRequest("test", "nfs"); } },
                            "nfsApplyBtn":		function() { netStorageRequest("mount", "nfs") ; },
                            "nfsUnmountBtn":	function() { if (!document.getElementById("nfsUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "nfs"); } },
                            
                            "smbTestBtn":		function() { if (!document.getElementById("smbTestBtn").classList.contains("disabled")) { netStorageRequest("test", "smb"); } },
                            "smbApplyBtn":		function() { netStorageRequest("mount", "smb") ; },
                            "smbUnmountBtn":	function() { if (!document.getElementById("smbUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "smb"); } },
                        }

    function networkSaving(obj) {
        if (obj.id in inputFunctions) // if the key-value exists
            inputFunctions[obj.id](obj.value) ; // run the function (with the value given)
    }

    /* Save As Box */
    // Video Save Location & Formats
    var dropDownFunctions = {
                            "H.264 (mp4)":		function(){ document.getElementById("saveFormat").firstChild.textContent = "H.264 (mp4)"; setCookie("ff", 0) ; },
                            "CinemaDNG (raw)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "CinemaDNG (raw)"; setCookie("ff", 1) ; },
                            "TIFF (images)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF (images)"; setCookie("ff", 2) ; },
                            "TIFF RAW (images)": function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF RAW (images)"; setCookie("ff", 3) ; },

                            "Update":			function() { dataGetter("p", "", pageUpdate) ; },
                            "Yes (overwrite)":	function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("overwrittenBox").classList.add("hidden") ; dataRequester("startRecording", "{}", pageUpdate) ; },
                            "No (don't record)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("overwrittenBox").classList.add("hidden") ; stateSelecter(document.getElementById("record"), 0) ; },

                            "Yes (apply the changed settings)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("resNotAppliedBox").classList.add("hidden") ; applyResolution() ; },
                            "No (revert to previous settings)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("resNotAppliedBox").classList.add("hidden") ; dataGetter("get", "resolution&frameRate", pageUpdate) ; },

                            "Ok":				function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("errorWhileSavingBox").classList.add("hidden") ; document.getElementById("noRecordSegmentModeBox").classList.add("hidden") ; document.getElementById("cantApplyResBox").classList.add("hidden") ; },
                            }

    function dropDownSelect (obj) {
        if (obj.innerText in dropDownFunctions) // if the key-value exists
            dropDownFunctions[obj.innerText]() ; // run the function
    }
    // Save Button
    function saveWholeVideo() { 
        var fileName = document.getElementById("fileName").value ;
    
        if ( (StorageLocation != "") && (lastKnownFrameEnd > 1) ) { // storage location set and some frames recorded
            var request = '{"device": "' + StorageLocation + '", "format": '
            switch (document.getElementById("saveFormat").firstChild.textContent) {
                case "CinemaDNG (raw)":
                    request += '"dng"' ; // use cinemaDNG files
                    break ;
    
                case "TIFF (images)":
                    request += '"tiff"' ; // use tiff images
                    break ;
    
                case "TIFF RAW (images)":
                    request += '"tiffRaw"' ; // use tiff RAW images
                    break ;
    
                case "H.264 (mp4)":
                default:
                    request += '"h264"' ; // use h.264 format (mp4)
                    break ;
            
            }
    
            if (fileName != "") // a file name was given
                request += ', "filename": "' + fileName + '"' ;
    
            request += '}' ; // finish off the request
    
            if (DebugOnOff)
                document.getElementById("debugger2").innerHTML = " ----- Here is the request: " + request ;
    
            dataSender ("startFilesave", request) ; // actually save the file
        }
        else {
            if (StorageLocation == "")
                document.getElementById("errorWhileSavingBox").firstChild.textContent = "Cannot save video. Please select a storage device." ;
            else
                document.getElementById("errorWhileSavingBox").firstChild.textContent = "Nothing to save. Please record something first." ;
    
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("errorWhileSavingBox").classList.remove("hidden") ; // show the reason why you're unable to save
        }
    }

    /* Help Functions */
    // Reboot all cameras to make all of them return to main screen -> ?
    function rebootCamera(){
        for (i = 0; i < ipArray.length; i++){
            $.ajax({
                url: ipArray[i]+"/control/reboot",
                data:{"power":1},
                method:"GET",
                contentType: "application/json",
                timeout: 10000
            });
        }
    }
    // Check value (< max)
    function boundInput(element){
        if (parseInt(element.value) > parseInt(element.max)){
            element.value = element.max;
        }
        else if (parseInt(element.value) < parseInt(element.min)){
            element.value = element.min;
        }
    }
    // Get and build a list of external storage
    var StorageInfo;
    var StorageNames = {"sda1": "USB / SATA",
                        "mmcblk1p1": "SD Card",
                        "nfs": "Network Drive",
                        "smb": "Network Drive"
                    };
    var StorageLocation = "";
    var lastKnownVideoState = "live";
    var lastKnownFrameEnd = 1;
    var lastKnownCurrentFrame = 0;

    // Choose Save Location
    function useStorageLocation(key) {
        console.log("use Storage Location");
        if (key in StorageInfo) {
            var temp = "" ;		 
            if (key in StorageNames)
                temp += StorageNames[key] ; // write a more readable name
            temp += "   (" + key + ")" ; // write the system name/location
    
            document.getElementById("storageLocation").firstChild.textContent = temp ; // write the selected storage location to the 'storage location' drop-down
    
            var saveStorageVal = parseInt(getCookie("as")) ;
    
            var i = 0 ;
            for (i = 0 ; i < Object.keys(StorageNames).length ; i++) {
                if (Object.keys(StorageNames)[i] == key) {
                    if ( (saveStorageVal < 1) || isNaN(saveStorageVal) )
                        setCookie("as", parseInt((i + 1) * -1)) ; // save this as the auto-select device
                    else
                        setCookie("as", parseInt(i + 1)) ; // save this as the auto-save device
                }
            }
    
            StorageLocation = key ; // save the storage location
    
            document.getElementById("saveVideoButton").classList.remove("disabled") ; // enable the save button
        }
        else 
        {
            StorageLocation = "" ; // save the storage location  
            document.getElementById("saveVideoButton").classList.add("disabled") ; // disable the save button
        }
    }

    function externalStorage() {
        $.ajax({
            url: first_camera_addr+"/control/get",
            data: {"externalStorage":""},
            method: "GET",
            contentType: "application/json",
            timeout: 1000000
        })
        .done(function(data){
            StorageInfo = data.externalStorage;
            StorageInfo.size = -1;

            for (key in StorageInfo)
            {
                StorageInfo.size++;
            }

            var list = document.getElementById("storageLocationInner");

            if (StorageInfo.size > 0)
            {
                list.innerHTML = "";
                for (key in StorageInfo)
                {
                    if (key != "size")
                    {
                        var temp = '<a id=' + key +'>';
                        if (key in StorageNames)
                            temp += StorageNames[key];
                            
                        temp += '&ensp;(' + key + ')</a>';

                        list.innerHTML += temp;
                    }
                }

                var saveStorageVal = parseInt(getCookie("as"));

                if ( (saveStorageVal != 0) && isNaN(saveStorageVal) )
                {
                    if (saveStorageVal < 0)
                    {
                        saveStorageVal *= -1;
                    }
                    key = Object.keys(StorageNames)[saveStorageVal - 1];

                    if (key in StorageInfo)
                    {
                        useStorageLocation(key);
                    }
                }
            }
            else
            {
                document.getElementById(StorageLocation).firstChild.textContent = "Location";
                list.innerHTML = '<a>No Storage Connected</a>';

                document.getElementById("saveVideoButton").classList.add("disabled");
            }
            list.innerHTML += '<a id="refreshdropdown">Refresh</a>';
        })
    }

    var StorageNames = {"sda1": "USB / SATA",
                        "mmcblk1p1": "SD Card",
                        "nfs": "Network Drive",
                        "smb": "Network Drive"
                    };
                    
    $("#sda1").on("click", function() {
        console.log(this.id);
        useStorageLocation(this.id);
    });
    

    // Update webpage for video display & parameters
    function updateScreen(){
        $("#imageDisplay").attr("src", first_camera_addr+"/cgi-bin/screenCap?" + Math.random());
        getResolution();
        getExposure();
        //externalStorage();
    }

    function setCookie (name, value) 
    {
        var expiryDate = new Date() ;
        expiryDate.setTime(expiryDate.getTime() + 1000*60*60*24*90) ; // add 90 days (time is in ms)
        document.cookie = name + "=" + value + "; expires=" + expiryDate.toUTCString() + "; path=/" ;
    }

    function getCookie(cname) 
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (i = 0; i < ca.length; i++)
        {
            var c = ca[i];
            while (c.charAt(0) == " ")
            {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0)
            {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /* Connect functions with components */
    // Record/Stop Button
    $("#btn_toggle_record").on("click", function(){
        var obj_btn = $(this);

        if(obj_btn.hasClass("start")){
            startRecording("toggle");
        }else if(obj_btn.hasClass("stop")){
            stopRecording("toggle");
        }
    });

    // Apply Resolution, Frame Rate
    //// Change Resolution
    $("#hRes").on("input", function(){
        //centerWindow();
    });
    $("#vRes").on("input", function(){
        //centerWindow();
    });
    $("#centerWindow").on("click", function(){
        centerWindow();
    });
    //// Max (Frame Rate) Button
    $("#maxFRButton").on("click", function(){
        getMaxFrameRate();
    });
    //// Apply Changes
    $("#applyButton").on("click", function(){
        setResFrameRate();
    });

    // Set Exposure Time, Percent, Degrees
    //// Shutter
    $("#shutter").on("input", function(){
        holdWhileSliding(this);
    });
    //// Time
    $("#exposureTime").on("input", function(){
        setExposure(this);
    });
    //// Percent
    $("#exposurePercent").on("input", function(){
        setExposure(this);
    });
    //// Degrees
    $("#exposureDegrees").on("input", function(){
        setExposure(this);
    });
    //// Max (Exposure) Button
    $("#maxShutterButton").on("click", function(){
        maxShutter();
    });

    // Network Storage Settings
    //// Unmount
    $("#smbUnmountBtn").on("click", function(){
        networkSaving(this);
    });
    //// Test
    $("#smbTestBtn").on("click", function(){
        networkSaving(this);
    });
    //// Test
    $("#smbApplyBtn").on("click", function(){
        networkSaving(this);
    })

    // Save Videos
    //// Location Refresh
    $("#refreshdropdown").on("click", function(){
        externalStorage();
        updateScreen();
    });
    //// Video Formats
    $("#h264").on("click", function(){
        dropDownSelect(this);
    });
    $("#cinemaDNG").on("click", function(){
        dropDownSelect(this);
    });
    $("#tiff").on("click", function(){
        dropDownSelect(this);
    });
    $("#tiffRaw").on("click", function(){
        dropDownSelect(this);
    });
    //// OK
    $("#ok").on("click", function(){
        dropDownSelect(this);
    });
    //// 
    
    //// Save Button
    $("#saveVideoButton").on("click", function(){
        saveWholeVideo();
    });

    // Reboot Button
    $("#rebootBtn").on("click", function(){
        rebootCamera();
    });

    // SMB Storage
    //// Passwaord Show/Hide
    $("#smbPassShowHide").on("click", function(){
        PassShowHide();
    });

    /*
    $("#selectBox_res").on("change", function(){

        var obj_selected = $("#selectBox_res option:selected");

        var hRes_val = obj_selected.attr("data-hRes");
        var vRes_val = obj_selected.attr("data-vRes");
        var frame_val = obj_selected.attr("data-frame");
        var minFramePeriod_val = obj_selected.attr("data-minFramePeriod");

        var hRes_max_val = $("#hRes").attr("data-max");
        var vRes_max_val = $("#vRes").attr("data-max");

        var hOff_val = {};
        var vOff_val = {}; 

        $("#hRes").val(hRes_val);
        $("#vRes").val(vRes_val);
        $("#fps").val(frame_val);
        
        hOff_val.value = parseInt(hRes_max_val) - parseInt(hRes_val) ; // set the maximum horizontal offset
	    vOff_val.value = parseInt(vRes_max_val) - parseInt(vRes_val) ; // set the maximum vertical offset

        $("#hRes").attr("data-hOff_max", parseInt(hOff_val.value/2));
        $("#vRes").attr("data-vOff_max", parseInt(vOff_val.value/2));

        $("#fps").attr("data-minFramePeriod", minFramePeriod_val);

    });
    */

    // Get IP Addresses List
    $("#ipConfirmButton").on("click", function(){
        getIpAddress();
        displayCam();
    });
    // Clear Textarea
    $("#ipClearButton").on("click", function(){
        clearIpAddress();
    });

    var intervalID = setInterval(updateScreen, 500);
        
});