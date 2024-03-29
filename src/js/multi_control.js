$(function() {

    /* Global Variables */
    var i;                           // index for loop among all cameras
    var ipArray = [];                // array to store all ip addresses (with http://)
    var ipDisplay = [];              // array to store all ip addresses (without http://) & cameras' information to display
    var camInfo = [];                // array to store cameras' information
    var example_camera_addr = "";    // first address in the ip list for display
    var example_camera_addr_14 = ""; // first 1.4 camera's address in the ip list
    var example_camera_addr_21 = ""; // first 2.1 camera's address in the ip list
    var exampleVersion = ""          // camera version for the example (display) camera
    var camVersion = [];             // array to store versions -> resolution, frame rate & exposure
    var camSerial = [];              // array to store serial numbers -> filenames
    var resFRSettingsOnCam = [];     // array to store orignal resolution
    var camStorage = [];             // array to store external save devices for each camera
    var saveDevices = [];            // array to store external save devices that all camera have
    var invalidIp = [];              // array to store IPs that are invalid
    var disconIp = [];               // array to atore IPs that are disconnected with cameras
    var indexSelect = 0;             // index for the display camera IP

    /* Get & Display Cameras' IP & Information */
    // Check IP Format
    checkIp = function() {
        const len = ipArray.length;
        for (i = 0; i < len; i++) {
            var ipSplit = [];
            ipArray[i] = ipArray[i].split(" ").join(""); // remove any space
            ipSplit = ipArray[i].split(".");

            if (ipSplit.length != 4) { // 123.45.67.89
                invalidIp.push(ipArray[i]);
            }

            for (var j = 0; j < ipSplit.length; j++) {
                if ( isNaN(ipSplit[j]) ) { // contain only numbers
                    invalidIp.push(ipArray[i]);
                    break;
                }
            }  
        }
        // remove invalid IPs from ipArray
        for (i = 0; i < invalidIp.length; i++) {
            const index = ipArray.indexOf(invalidIp[i]);
            if (index > -1) {
                ipArray.splice(index, 1);
            }   
        }
    }

    // Handle IP
    getIpAddress = function(){
        // Remove all former IP and information
        ipArray = [];
        invalidIp = [];
        disconIp = [];
        ipDisplay = [];
        camInfo = [];

        // No IP
        if (document.getElementById("ipAddressArea").value == "") {
            // Show pop-up warning window
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("ipNotInputBox").firstChild.textContent = "Please input IP addresses.";
            document.getElementById("ipNotInputBox").classList.remove("hidden");
        }
        // Get IP
        else {
            var ipList = document.getElementById("ipAddressArea").value;
            ipArray = ipList.split(/, | -/); //split IP adresses with comma & dash

            checkIp();

            for (i = 0; i < ipArray.length; i++) {
                ipDisplay[i] = ipArray[i];
                ipArray[i] = "http://" + ipArray[i];
            }

            getCamInfo();
            displayCam();
            saveToStorage();
        }
    }

    // Get Information (Model, Color/Mono, Memory Size & Serial Number)
    getCamInfo = function() {
        var list = document.getElementById("ipList");
        list.innerHTML = "";

        // Get Camera Information from Each IP
        for (i = 0; i < ipArray.length; i++) {
            $.ajax({
                url: ipArray[i]+"/control/get",
                data: {"cameraModel":"",
                       "cameraMemoryGB":"",
                       "cameraSerial":"",
                       "sensorColorPattern":"",},
                async: false,
                method: "GET",
                timeout: 500,
                success: function(data) {
                    // Version
                    if (data.cameraModel.startsWith("CR14")) {
                        camInfo[i] = " - Chronos 1.4, ";
                        // Store Version for Further Use
                        camVersion[i] = "1.4";
                    }
                    else {
                        camInfo[i] = " - Chronos 2.1, ";
                        camVersion[i] = "2.1";
                    }
                    // Color Pattern
                    if (data.sensorColorPattern == "GRBG") {
                        camInfo[i] += "Color, ";
                    }
                    else {
                        camInfo[i] += "Monochrome, ";
                    }
                    // Memory Size & Serial Number
                    camInfo[i] += data.cameraMemoryGB + "GB, Serial " + data.cameraSerial;
                    // Store Serial Number for Further Use
                    camSerial[i] = data.cameraSerial;

                },
                error: function(data) {
                    disconIp.push(ipDisplay[i]);
                }
            });
        }
        // Return to Global Variables
        return disconIp, camInfo, camVersion, camSerial;
    }

    // Display IP, Camera Information & Parameters (from the first valid camera in the ip list)
    displayCam = function() {
        var list = document.getElementById("ipList");
        list.innerHTML = "";

        // remove disconnected IPs from ipArray & ipDisplay
        for (i = 0; i < disconIp.length; i++) {
            const index = ipDisplay.indexOf(disconIp[i]);
            if (index > -1) {
                ipArray.splice(index, 1);
                ipDisplay.splice(index, 1);
                camInfo.splice(index, 1);
                camVersion.splice(index, 1);
                camSerial.splice(index, 1);
            }   
        }

        // Display IPs that are valid and connected successfully
        if (ipDisplay.length > 0) {
            list.innerHTML += "IP addresses connected successfully:<br>";
            for (i = 0; i < ipDisplay.length; i++) {
                list.innerHTML += '<li id="ipAddress'+ i +'" style="list-style-type:none;">' + '<span>' + ipDisplay[i] + camInfo[i] + '</span>' + 
                                  '<button type="button" class="delButton" id= "button'+ i +'" onclick="deleteIp(this)">Delete</button>' +
                                  '<button type="button" class="delButton" id= "selector'+ i +'" onclick="SelectIp(this)">Select</button></li>';
            }
        }
        // Display IPs that are invalid or disconnected
        if (invalidIp.length > 0 || disconIp.length > 0) {
            list.innerHTML += "IP addresses invalid or disconnected:<br>";
            for (i = 0; i < invalidIp.length; i++) {
                list.innerHTML += '<li id="ipAddress'+ i +'" style="list-style-type:none;">' + '<span>' + invalidIp[i] + ' - Invalid IP</span>';
            }
            for (i = 0; i < disconIp.length; i++) {
                list.innerHTML += '<li id="ipAddress'+ i +'" style="list-style-type:none;">' + '<span>' + disconIp[i] + ' - Disconnected</span>';
            }
        }

        // IP address for parameters display
        example_camera_addr = ipArray[0];
        document.getElementById("selector0").classList.add("disabled");

        exampleVersion = checkVersion();
        if (exampleVersion == "Mix") {
            var index14 = camVersion.indexOf("1.4");
            var index21 = camVersion.indexOf("2.1");
            example_camera_addr_14 = ipArray[index14];
            example_camera_addr_21 = ipArray[index21];
        }
        
        // Get & display parameters from the first camera on the list
        getResolution();
        checkResValidity();
        getExposure();
        presetResolutions(); 
        externalStorage();
    }

    // Delete Single IP
    deleteIp = function(element) {
        var parent = document.getElementById("ipList");
        var index = element.id.replace("button", "");
        var childId = "ipAddress" + index;
        var child = document.getElementById(childId);
        parent.removeChild(child);

        ipArray.splice(index, 1);
        ipDisplay.splice(index, 1);
        camInfo.splice(index, 1);
        camVersion.splice(index, 1);
        camSerial.splice(index, 1);
    }

    // Select IP for display
    SelectIp = function(element) {
        var index = element.id.replace("selector", "");
        example_camera_addr = ipArray[index];

        document.getElementById("selector"+indexSelect).classList.remove("disabled");
        
        indexSelect = index;
        document.getElementById("selector"+indexSelect).classList.add("disabled");

        updateScreen();
        getResolution();
        checkResValidity();
        getExposure();

    }

    // Clear IP
    clearIpAddress = function(){
        // Clear textarea
        document.getElementById("ipAddressArea").value = '';
        // Clear IP addresses display
        document.getElementById("ipList").innerHTML = "";
        // Clear all IP
        ipArray = ipDisplay = camInfo = camVersion = camSerial = [];
        // Store new clear textarea & list
        saveToStorage();
    }

    /* Screenshot Display */
    var img = document.getElementById("imageDisplay");
    var videoWindow = document.getElementById("videoDisplay");

    // Scale Size
    img.onload = function scaleToFit() {
        videoWindow.style.height = "650px";

        var scale = Math.min(videoWindow.clientWidth / img.width, videoWindow.clientHeight / img.height);
        var x = (videoWindow.clientWidth / 2) - (img.width / 2) * scale;
        var y = (videoWindow.clientHeight / 2) - (img.height / 2) * scale;
        img.height = img.height * scale;
        if (img.height < videoWindow.clientHeight) {
            videoWindow.style.height = (img.height + 6).toString() + "px";
        }
    }

    /* Start/Stop Recording */
    // Start Recording
    tryToStartRecording = function() {
        if ( checkFRChanged() ) {
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("resNotAppliedBox").classList.remove("hidden");
            stateSelecter(document.getElementById("record"), 0);
        }
       // No Recorded Video?
        else if ( (getCookie("sr") != 1) && (getCookie("wo") != "a") || (getCookie("wo") == "n") ) {
            for (i = 0; i < ipArray.length; i++) {
                $.ajax({
                    url: ipArray[i] + "/control/startRecording",
                    data: {},
                    method: "GET",
                    timeout: 500
                });
            }
        }
        // Show Video Overwritten Box
        else {
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("overwrittenBox").classList.remove("hidden");
            stateSelecter(document.getElementById("record"), 0);
        }
    }

    // Change Record Button State
    var stateChange = { "record": ["<div class='recordCircle'></div>Record", "<div class='recordSquare'></div>Recording"] };
    recordControl = function(element) {
        var recordState = 0;

        // active -> recording; inactive -> record(stop)
        if (element.classList.contains("active")) {
            element.classList.remove("active");
            element.classList.add("inactive");
            recordState = 0;
        }
        else {
            element.classList.remove("inactive");
            element.classList.add("active");
            recordState = 1;
        }

        // Change Icon & Text
        if (element.id in stateChange) {
            element.innerHTML = stateChange[element.id][recordState];
        }

        // Start Recording
        if (recordState == 1) {
            tryToStartRecording();
        }
        // Stop Recording
        else {
            for (i = 0; i < ipArray.length; i++) {
                $.ajax({
                    url: ipArray[i] + "/control/stopRecording",
                    data: {},
                    method: "GET",
                    timeout: 500
                });
            }
        }
    }

    /* Get Parameters from First Camera in IP List */
    // Resolution Box
    getResolution = function() {
        $.ajax({
            url: example_camera_addr+"/control/get",
            data: {"resolution":"",
                   "frameRate":""},
            method: "GET",
            async: false,
            timeout: 500
        })
        .done(function(data){
            document.getElementById("hRes").value = data.resolution.hRes;
            document.getElementById("vRes").value = data.resolution.vRes;
            document.getElementById("fps").value = parseFloat(data.frameRate).toFixed(2);

            resFRSettingsOnCam[0] = document.getElementById("hRes").value;
            resFRSettingsOnCam[1] = document.getElementById("vRes").value;
            resFRSettingsOnCam[2] = document.getElementById("fps").value;
        });
        return resFRSettingsOnCam;   
    }
    // Exposure Box
    getExposure = function() {
        // Exposure follows 2.1 when "Mix"
        var temp_camera_addr = "";
        if (exampleVersion == "Mix") {
            temp_camera_addr = example_camera_addr_21;
        }
        if (temp_camera_addr == "") {
            temp_camera_addr = example_camera_addr;
        }

        $.ajax({
            url: temp_camera_addr+"/control/get",
            data: {"exposurePeriod":"",
                   "exposurePercent":"",
                   "shutterAngle":"",
                   "exposureMin":"",
                   "exposureMax":"",
                   "framePeriod":"",
                   "minFrameReriod":""},
            method: "GET",
            timeout: 500
        })
        .done(function(data) {
            // Exposure Inputs Display
            document.getElementById("exposureTime").value = parseFloat(data.exposurePeriod / 1000).toFixed(1);
            document.getElementById("exposurePercent").value = parseFloat(data.exposurePeriod / data.exposureMax * 100).toFixed(1);
            document.getElementById("exposureDegrees").value = parseFloat(data.exposurePeriod / data.framePeriod * 360).toFixed(1);

            document.getElementById("exposureTime").max = (data.exposureMax / 1000).toFixed(1);
            // Shutter Display
            document.getElementById("shutter").min = data.exposureMin;
            document.getElementById("shutter").max = data.exposureMax;
            document.getElementById("shutter").value = Math.sqrt(data.exposurePeriod / data.exposureMax) * data.exposureMax;
            

            fpsBox = document.getElementById("fps");
            fpsBox.max = parseFloat(1000000000 / parseFloat(data.minFramePeriod)).toFixed(2);
        });
    }

    /* Set Parameters from Webpage to All Cameras */
    // Set Exposure
    setExposure = function(element){
        // Fix values with their limits
        boundInput(element);       

        var parameters = "";

        // Three Ways to Set Exposure
        switch (element.id){
            case "exposureTime":
                parameters = '{"exposurePeriod":' + parseInt(element.value * 1000) + '}';
                break;
            case "exposurePercent":
                parameters = '{"exposurePercent":' + parseFloat(element.value) + '}';
                break;
            case "exposureDegrees":
                parameters = '{"shutterAngle":' + parseFloat(element.value) + '}';
                break;
        }

        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: parameters,
                method: "POST",
                contentType: "application/json",
                timeout: 500
            });
        }
    }

    // Slider Controller
    holdWhileSliding = function(element){
        var exposureValue = Math.pow( (element.value - element.min) / (element.max - element.min), 2 ) * element.max;
        var parameters = '{"exposurePeriod":' + parseInt(exposureValue) + '}';

        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: parameters,
                method: "POST",
                contentType: "application/json",
                timeout: 500
            });
        }
        getExposure();
    }

    // Set Exposure to its max value
    maxShutter = function(){
        var parameters = '{"exposurePercent":' + parseFloat(100) + '}';

        for (i = 0; i < ipArray.length; i++)
        {
            $.ajax({
                url: ipArray[i]+"/control/set",
                data: parameters,
                method: "POST",
                contentType: "application/json",
                timeout: 500
            });
        }
        getExposure();
    }

    // Resolution Presets
    // Depends on Version of Cameras
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

    // Set Preset Resolution Based on Versions
    presetResolutions = function() {
        var list = document.getElementById("resolution");
        list.innerHTML = "";

        if (exampleVersion == "1.4") {
            for (i = 0; i < resolutionPresets14.length; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets14[i][0] + "x" + resolutionPresets14[i][1] + " @ " + resolutionPresets14[i][2] + "fps </a>";
            }
        }
        else if (exampleVersion == "2.1") {
            for (i = 0; i < resolutionPresets21.length; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets21[i][0] + "x" + resolutionPresets21[i][1] + " @ " + resolutionPresets21[i][2] + "fps </a>";
            }
        }
        else {
            for (i = 0; i < resolutionPresets21.length-1; i++) {
                list.innerHTML += '<a onclick="usePresetResolution(this)">' + resolutionPresets14[i][0] + "x" + resolutionPresets14[i][1] + " @ " + resolutionPresets14[i][2] + "fps </a>";
            }
        }

    }

    // Use Selected Preset Resolution & Frame Rate
    usePresetResolution = function(element) {
        var temp = element.innerText.replace(/[^\d.]/gi, ' '); // strip out anything other than digits
        var pieces = temp.split(/(\s+)/); // split up the contents

        document.getElementById("hRes").value = pieces[0]; // set the preset horizontal resolution
        document.getElementById("vRes").value = pieces[2]; // set the preset vertical resolution
        document.getElementById("fps").value = pieces[4]; // set the preset framerate
        document.getElementById("fps").max = pieces[4];
        checkResValidity();
    }

    // Set Frame Rate to its max value
    getMaxFrameRate = function() {
        // Frame rate max follows 1.4 when "Mix"
        var temp_camera_addr = "";
        if (exampleVersion == "Mix") {
            temp_camera_addr = example_camera_addr_14;
        }

        if (temp_camera_addr == "") {
            temp_camera_addr = example_camera_addr;
        }

        $.ajax({
            url: example_camera_addr+"/control/get",
            data: {"minFramePeriod":""},
            method: "GET",
            timeout: 500
        })
        .done(function(data){
            var fpsBox = document.getElementById("fps");
            fpsBox.value = parseFloat(1000000000 / parseFloat(data.minFramePeriod)).toFixed(2);
            fpsBox.max = fpsBox.value;

            if (!fpsBox.validity.valid) {
                document.getElementById("applyButton").classList.add("disabled");
            }
            else if ( (document.getElementById("hRes").validity.valid) && (document.getElementById("vRes").validity.valid) ) {
                document.getElementById("applyButton").classList.remove("disabled");
            }
            
            /*
            $.ajax({
                url: example_camera_addr+"/control/getResolutionTimingLimits",
                data: {"hRes": document.getElementById("hRes").value,
                       "vRes": document.getElementById("vRes").value},
                method: "POST",
                contentType: "application/json",
                timeout: 500,
                success: function(data) {
                    console.log(data);
                }
            })
            */
        });
    }

    checkResValidity = function() {
        // Resolution limitations follow 1.4 when "Mix"
        var temp_camera_addr = "";
        if (exampleVersion == "Mix") {
            temp_camera_addr = example_camera_addr_14;
        }

        if (temp_camera_addr == "") {
            temp_camera_addr = example_camera_addr;
        }
        
        $.ajax({
            url: example_camera_addr+"/control/get",
            data: {"sensorHIncrement":"",
                   "sensorVIncrement":"",
                   "sensorHMin":"",
                   "sensorVMin":"",
                   "sensorHMax":"",
                   "sensorVMax":""},
            method: "GET",
            async: false,
            timeout: 500
        })
        .done(function(data){
            // Set step, min and max
            document.getElementById("hRes").step = data.sensorHIncrement;
            document.getElementById("vRes").step = data.sensorVIncrement;
            document.getElementById("hRes").min = data.sensorHMin;
            document.getElementById("vRes").min = data.sensorVMin;
            document.getElementById("hRes").max = data.sensorHMax;
            document.getElementById("vRes").max = data.sensorVMax;
        });
        if ( (hRes.validity.valid) && (vRes.validity.valid) ) {
            if (document.getElementById("fps").validity.valid) {
                document.getElementById("applyButton").classList.remove("disabled");
            }
        }
        else {
            document.getElementById("applyButton").classList.add("disabled");
        }
    }
    
    // Apply Resolution & Frame Rate
    applyResolution = function() {
        var hRes = document.getElementById("hRes");
        var vRes = document.getElementById("vRes");

        if ( (hRes.validity.valid) && (vRes.validity.valid) && (document.getElementById("fps").validity.valid) && (!document.getElementById("applyButton").classList.contains("disabled")) ) {
            var parameters = '{"resolution": {"hRes": ' + document.getElementById("hRes").value;
            parameters += ', "vRes": ' + document.getElementById("vRes").value;
            parameters += '}, "framePeriod": ' + Math.round(parseFloat( 1 / document.getElementById("fps").value * 1000000000 ));
            parameters += '}';

            resFRSettingsOnCam = [hRes.value, vRes.value, document.getElementById("fps").value];

            for (i = 0; i < ipArray.length; i++) {
                $.ajax({
                    url: ipArray[i]+"/control/set",
                    data: parameters,
                    method: "POST",
                    contentType: "application/json",
                    timeout: 500
                });
            }
            // Set exposure shutter to its new max
            maxShutter();
        }
        else if (document.getElementById("applyButton").classList.contains("disabled")) {
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("cantApplyResBox").classList.remove("hidden");
        }
    }

    /* Network Storage (SMB & NFS) */
    // Set SMB & NFS Parameters
    netStorageRequest = function(command, type) {

        if (type == "nfs") {
            var address = document.getElementById("nfsAddress").value;
            var mount = document.getElementById("nfsMount").value;
        }
        else {
            var address = document.getElementById("smbAddress").value;
            var mount = document.getElementById("smbMount").value;
        }
    
        var parameters = "";
    
        if (command == "unmount") { // unmount the network drive
            if (type == "nfs")
                parameters = "nfs=unmount";
            else if (type == "smb")
                parameters = "smb=unmount";
    
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("netShareResultBox").firstChild.textContent = "Requesting that the shared drive be disconncted...";
            document.getElementById("netShareResultBox").classList.remove("hidden");
        }
        else if (command == "test") { // run the test input
            if (type == "nfs")
                parameters = "nfs=test";
            else if (type == "smb")
                parameters = "smb=test";
    
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("netShareResultBox").firstChild.textContent = "Testing the share drive (trying to write a file and read it back)...";
            document.getElementById("netShareResultBox").classList.remove("hidden");
        }
        else if ( (address == "") || (mount == "") ) {
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("netShareResultBox").firstChild.textContent = "Please enter an IP address and a mount location";
            document.getElementById("netShareResultBox").classList.remove("hidden");
            return 0;
        }
        else {
            if (mount[0] != "/")
            mount = "/" + mount; // add leading "/" if it wasn't already there
            
            if (type == "nfs") {
                parameters = "nfs=" + address + "&mount=" + mount;
                document.getElementById("netShareResultBox").firstChild.textContent = "Attempting to connect to NFS share...";
            }
            else if (type == "smb") {
                parameters = "smb=" + address + "&mount=" + mount + "&" + document.getElementById("smbUName").value + "=" + document.getElementById("smbPass").value;
                document.getElementById("netShareResultBox").firstChild.textContent = "Attempting to connect to SMB share...";
            }
    
            // show the status
            document.getElementById("popUpBackground").classList.remove("hidden") ;
            document.getElementById("netShareResultBox").classList.remove("hidden") ;
        }

        $(document).ready(function(){
            test();
        });
        
        function test() {
            var response = [];
            for (i = 0; i < ipArray.length; i++) {
                $.ajax({
                    url: ipArray[i] + "/cgi-bin/netShare?" + parameters,
                    type: "GET",
                    dataType: "json",
                    crossDomain: true,
                    async: false,
                    success: (function(data, textStatus, scr) {
                        if (scr.readyState == 4 && scr.status == 200) {
                            // store the response for pop-up window
                            response[i] = data;
                        }
                    }),
                    error: (function(scr, textStatus, errorMessage) {
                        document.getElementById("netShareResultBox").firstChild.textContent = "Something wrong happens. Please check network share settings.";
                    })
                })
                .done(function() {
                    return response;
                })
            }
            
            for (i = 0; i < ipArray.length; i++) {
                if ("error" in response[i]) {
                    document.getElementById("netShareResultBox").firstChild.textContent = "Camera" + "(" + ipArray[i] + ")\n" + response[i].error;
                    
                    break;
                }
                else if (response[i] == "") {
                    document.getElementById("netShareResultBox").firstChild.textContent = "Camera" + "(" + ipArray[i] + ")\n" + "Camera could not connect";
                    break;
                }
                else {
                    document.getElementById("netShareResultBox").firstChild.textContent = "Success!";
                }
            }
            
            document.getElementById("popUpBackground").classList.remove("hidden");
            document.getElementById("netShareResultBox").classList.remove("hidden");
            externalStorage();
        }
    }

    // Unmount, Test & Apply Button
    // Different buttons invoke different functions
    var inputFunctions = { 
                            "nfsTestBtn":		function() { if (!document.getElementById("nfsTestBtn").classList.contains("disabled")) { netStorageRequest("test", "nfs"); } },
                            "nfsApplyBtn":		function() { netStorageRequest("mount", "nfs") ; },
                            "nfsUnmountBtn":	function() { if (!document.getElementById("nfsUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "nfs"); } },
                            
                            "smbTestBtn":		function() { if (!document.getElementById("smbTestBtn").classList.contains("disabled")) { netStorageRequest("test", "smb"); } },
                            "smbApplyBtn":		function() { netStorageRequest("mount", "smb") ; },
                            "smbUnmountBtn":	function() { if (!document.getElementById("smbUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "smb"); } },
                        }
    networkSaving = function(element) {
        if (element.id in inputFunctions) // if the key-value exists
            inputFunctions[element.id](element.value); // run the function (with the value given)
    }

    /* Save Video */
    // External Storage Location
    var StorageInfo;
    var StorageNames = {"sda1": "USB / SATA",
                        "mmcblk1p1": "SD Card",
                        "nfs": "Network Drive",
                        "smb": "Network Drive"
                       };
    var StorageLocation = "";

    // Choose Save Location
    useStorageLocation = function(key) {
        if (key in StorageInfo) {
            var temp = "";		 
            if (key in StorageNames)
                temp += StorageNames[key]; // write a more readable name
            temp += "   (" + key + ")"; // write the system name/location
    
            document.getElementById("storageLocation").firstChild.textContent = temp; // write the selected storage location to the 'storage location' drop-down
    
            var saveStorageVal = parseInt(getCookie("as"));
    
            for (i = 0 ; i < Object.keys(StorageNames).length; i++) {
                if (Object.keys(StorageNames)[i] == key) {
                    if ( (saveStorageVal < 1) || isNaN(saveStorageVal) )
                        setCookie("as", parseInt((i + 1) * -1)); // save this as the auto-select device
                    else
                        setCookie("as", parseInt(i + 1)); // save this as the auto-save device
                }
            }
    
            StorageLocation = key; // save the storage location
    
            document.getElementById("saveVideoButton").classList.remove("disabled"); // enable the save button
        }
        else {        
            StorageLocation = "" ; // save the storage location  
            document.getElementById("saveVideoButton").classList.add("disabled"); // disable the save button
        }
    }
            
    // Add External Storage Device in Location Container
    findexternalStorage = function() {
        camStorage = [];
        for (i = 0; i < ipArray.length; i++) {
            $.ajax({
                url: ipArray[i]+"/control/get",
                data: {"externalStorage":""},
                method: "GET",
                async: false,
                contentType: "application/json",
                timeout: 500
            })
            .done(function(data) {
                var temp = [];
                for (key in data.externalStorage) {
                    if (key != "size") {
                        temp.push(key);
                    }
                }
                camStorage[i] = temp;
            })
        }
        return camStorage;
    }

    externalStorage = function() {
        findexternalStorage();

        var sdaNumber = 0;
        var sdNumber = 0;
        var smbNumber = 0;
        var nfsNumber = 0;
        saveDevices = [];

        // Check Devices
        for (i = 0; i < camStorage.length; i++) {
            var temp = camStorage[i];

            if (temp.indexOf("smb") > -1) {
                smbNumber++;
            }
            if (temp.indexOf("nfs") > -1) {
                nfsNumber++;
            }
            if (temp.indexOf("sda1") > -1) {
                sdaNumber++;
            }
            if (temp.indexOf("mmcblk1p1") > -1) {
                sdNumber++;
            }
        }

        if (smbNumber == camStorage.length) {
            // All Valid Cameras are connected to SMB
            saveDevices.push("smb");
        }
        if (nfsNumber == camStorage.length) {
            // All Valid Cameras are connected to NFS
            saveDevices.push("nfs");
        }
        if (sdaNumber == camStorage.length) {
            saveDevices.push("sda1");
        }
        if (sdNumber == camStorage.length) {
            saveDevices.push("mmcblk1p1");
        }

        $.ajax({
            url: example_camera_addr+"/control/get",
            data: {"externalStorage":""},
            method: "GET",
            async: false,
            contentType: "application/json",
            timeout: 500
        })
        .done(function(data){
            // NFS External Storage
            if ("nfs" in data.externalStorage && (saveDevices.indexOf("nfs") > -1)) {
                var nfsStorage = data.externalStorage.nfs.device.split(":/");
                if (document.getElementById("nfsAddress") != document.activeElement) {
                    document.getElementById("nfsAddress").value = nfsStorage[0];
                }
                if (document.getElementById("nfsMount") != document.activeElement) {
                    document.getElementById("nfsMount").value = nfsStorage[1];
                }
                document.getElementById("nfsUnmountBtn").classList.remove("disabled");
                document.getElementById("nfsTestBtn").classList.remove("disabled");
            }
            else {
                document.getElementById("nfsUnmountBtn").classList.add("disabled");
                document.getElementById("nfsTestBtn").classList.add("disabled");
            }
            
            // SMB External Storage
            if ("smb" in data.externalStorage && (saveDevices.indexOf("smb") > -1)) {
                var smbStorage = data.externalStorage.smb.device.split("/");
                if (document.getElementById("smbAddress") != document.activeElement) {
                    document.getElementById("smbAddress").value = smbStorage[2];
                }
                if (document.getElementById("smbMount") != document.activeElement) {
                    document.getElementById("smbMount").value = smbStorage[3];
                }
                document.getElementById("smbUnmountBtn").classList.remove("disabled");
                document.getElementById("smbTestBtn").classList.remove("disabled");
            }
            else {
                document.getElementById("smbUnmountBtn").classList.add("disabled");
                document.getElementById("smbTestBtn").classList.add("disabled");
            }

            // Add External Storage Devices into Location Drop Down Container
            StorageInfo = data.externalStorage;
            StorageInfo.size = -1;

            for (key in StorageInfo)
            {
                StorageInfo.size++;
            }

            var list = document.getElementById("storageLocationInner");

            if (StorageInfo.size > 0 && saveDevices.length > 0)
            {
                console.log("Has save devices")
                list.innerHTML = "";
                for (key in StorageInfo)
                {
                    if (key != "size" && saveDevices.indexOf(key) > -1)
                    {
                        var temp = '<a onclick=\'useStorageLocation("' + key + '")\'>';
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
                document.getElementById("storageLocation").firstChild.textContent = "Location";
                list.innerHTML = '<a>No Storage Connected</a>';

                document.getElementById("saveVideoButton").classList.add("disabled");
            }
            list.innerHTML += '<a onclick="externalStorage()">Refresh</a>';
        })
    }
        
    // Save Button
    //var lastKnownVideoState = "live";
    var lastKnownVideoState = [];
    var lastKnownFrameEnd = 1;

    // Get the number of frames that is processed for saving
    getVideoState = function() {
        for (i = 0; i < ipArray.length; i++) {
            $.ajax({
                url: ipArray[i]+"/control/get",
                data: {"videoState": ""},
                method: "GET",
                async: false,
                contentType: "application/json",
                timeout: 500
            })
            .done(function(data) {
                lastKnownVideoState[i] = data.videoState;
            })
        }
        
        for (i = 0; i < lastKnownVideoState.length; i++) {
            
            if (lastKnownVideoState[i] == "filesave") {
                document.getElementById("button"+i).innerHTML = "Saving";
                document.getElementById("button"+i).classList.add("disabled");
            }
            else if (lastKnownVideoState[i] == "paused") {
                document.getElementById("button"+i).innerHTML = "Waiting";
            }
            else {
                document.getElementById("button"+i).innerHTML = "Delete";
                document.getElementById("button"+i).classList.remove("disabled");
            }
        }
        
    }

    saveWholeVideo = function() { 
        $.ajax({
            url: example_camera_addr+"/control/get",
            data: {"videoState":"",
                   "totalFrames":"",},
            method: "GET",
            contentType: "application/json",
            timeout: 500
        })
        .done(function(data) {
            lastKnownFrameEnd = data.totalFrames;

            // Handle Location, Filename & Format
            var fileName = document.getElementById("fileName").value;
    
            if ( (StorageLocation != "") && (lastKnownFrameEnd > 1) ) { // storage location set and some frames recorded
                var request = '{"device": "' + StorageLocation + '", "format": '
                switch (document.getElementById("saveFormat").firstChild.textContent) {
                    case "CinemaDNG (raw)":
                        request += '"dng"'; // use cinemaDNG files
                        break ;
        
                    case "TIFF (images)":
                        request += '"tiff"'; // use tiff images
                        break ;
        
                    case "TIFF RAW (images)":
                        request += '"tiffRaw"'; // use tiff RAW images
                        break ;
        
                    case "H.264 (mp4)":
                    default:
                        request += '"h264"'; // use h.264 format (mp4)
                        break ;
                
                }

                var maxBitRate = document.getElementById("maxBitRateNum").value * 1000000;
                var bitRate = document.getElementById("bitsPerPixelNum").value ; // start with the bits per pixel

                if ( (resFRSettingsOnCam[0] != null) && (resFRSettingsOnCam[1] != null) ) {

                    bitRate *= resFRSettingsOnCam[0] * resFRSettingsOnCam[1]; // multiply by the resolution
                    bitRate *= document.getElementById("saveFPSNum").value;   // multiply by the framerate

                    if (maxBitRate < bitRate)
                        bitRate = maxBitRate; // correct to always be below the maximum

                    request += ', "bitrate": ' + Math.floor(bitRate) ; // add the bitrate to the request
                }

                request += ', "framerate": ' + document.getElementById("saveFPSNum").value ; // add the framerate to te request

                var tmp = request;

                // Get system time to generate filename automatically
                var currentTime = new Date();
                var year = currentTime.getFullYear(); 
                var month = currentTime.getMonth()+1; if (month < 10) { month = "0" + month; }
                var day = currentTime.getDay(); if (day < 10) { day = "0" + day; }
                var hour = currentTime.getHours(); if (hour < 10) { hour = "0" + hour; }
                var minute = currentTime.getMinutes(); if (minute < 10) { minute = "0" + minute; }
                var second = currentTime.getSeconds(); if (second < 10) { second = "0" + second; }

                for (i = 0; i < ipArray.length; i++) {
                    request = tmp;
                    if (fileName != "") {
                        request += ', "filename": "' + fileName + '_' + camSerial[i] + '"';
                    }
                    else {
                        request += ', "filename": "vid_' + year + '-' + month + '-' + day + '_' + hour + '-' + minute + '-' + second + '_' + camSerial[i] + '"';
                    }
                    request += '}';

                    $.ajax({
                        url: ipArray[i] + "/control/startFilesave",
                        data: request,
                        method: "POST",
                        contentType: "application/json",
                        timeout: 500
                    });
                }
                setInterval(getVideoState, 500);
            }
            else {
                if (StorageLocation == "")
                    document.getElementById("errorWhileSavingBox").firstChild.textContent = "Cannot save video. Please select a storage device.";
                else
                    document.getElementById("errorWhileSavingBox").firstChild.textContent = "Nothing to save. Please record something first.";
        
                document.getElementById("popUpBackground").classList.remove("hidden");
                document.getElementById("errorWhileSavingBox").classList.remove("hidden"); // show the reason why you're unable to save
            }
        })
    }

    /* Help Functions */
    // States Change for Components(Different States)
    stateSelecter = function(element, state) {
        if (state) {
            element.classList.remove("inactive");
            element.classList.add("active");
        }
        else {
            element.classList.remove("active");
            element.classList.add("inactive");
        }

        if (element.id in stateChange) {
            element.innerHTML = stateChange[element.id][state];
        }
    }

    // Check Camera Versions
    checkVersion = function() {
        if (camVersion.length > 1){
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
        else {
            return camVersion[0];
        }
    }

    // Check value (min < value < max)
    boundInput = function(element){
        if (parseInt(element.value) > parseInt(element.max)){
            element.value = element.max;
        }
        else if (parseInt(element.value) < parseInt(element.min)){
            element.value = element.min;
        }
    }

    // Password Show/Hide
    passShowHide = function() { // toggle the class (active/inactive), change the name, and run a function for a toggle button/switch
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

    // Video Format Drop Down Selector & Pop-up Window Buttons
    var dropDownFunctions = {
                            "H.264 (mp4)":		function(){ document.getElementById("saveFormat").firstChild.textContent = "H.264 (mp4)"; setCookie("ff", 0); },
                            "CinemaDNG (raw)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "CinemaDNG (raw)"; setCookie("ff", 1); },
                            "TIFF (images)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF (images)"; setCookie("ff", 2); },
                            "TIFF RAW (images)": function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF RAW (images)"; setCookie("ff", 3); },

                            //"Yes (overwrite)":	function() { document.getElementById("popUpBackground").classList.add("hidden"); document.getElementById("overwrittenBox").classList.add("hidden"); dataRequester("startRecording", "{}", pageUpdate); },
                            //"No (don't record)": function() { document.getElementById("popUpBackground").classList.add("hidden"); document.getElementById("overwrittenBox").classList.add("hidden"); stateSelecter(document.getElementById("record"), 0); },

                            "Yes (apply the changed settings)": function() { document.getElementById("popUpBackground").classList.add("hidden"); document.getElementById("resNotAppliedBox").classList.add("hidden"); applyResolution(); },
                            "No (revert to previous settings)": function() { document.getElementById("popUpBackground").classList.add("hidden"); document.getElementById("resNotAppliedBox").classList.add("hidden"); getResolution(); },

                            "Ok":				function() { document.getElementById("popUpBackground").classList.add("hidden"); 
                                                             document.getElementById("ipNotInputBox").classList.add("hidden");
                                                             document.getElementById("overwrittenBox").classList.add("hidden");
                                                             document.getElementById("resNotAppliedBox").classList.add("hidden");
                                                             document.getElementById("errorWhileSavingBox").classList.add("hidden");
                                                             document.getElementById("noRecordSegmentModeBox").classList.add("hidden"); 
                                                             document.getElementById("cantApplyResBox").classList.add("hidden");
                                                             document.getElementById("netShareResultBox").classList.add("hidden");
                                                             document.getElementById("videoSavingBox").classList.add("hidden");
                                                            },
                            }
    dropDownSelect = function(element) {
        if (element.innerText in dropDownFunctions) // if the key-value exists
            dropDownFunctions[element.innerText](); // run the function
    }

    // Check whether Resolution & Frame Rate Change
    checkFRChanged = function() {
        if (resFRSettingsOnCam[0] == document.getElementById("hRes").value && resFRSettingsOnCam[1] == document.getElementById("vRes").value && resFRSettingsOnCam[2] == document.getElementById("fps").value) {
            return false;
        }
        else {
            return true;
        }
    }

    // Update webpage for video display
    updateScreen = function() {
        $("#imageDisplay").attr("src", example_camera_addr + "/cgi-bin/screenCap?" + Math.random());
    }

    // Cookie
    setCookie = function(name, value) {
        var expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 1000*60*60*24*90); // add 90 days (time is in ms)
        document.cookie = name + "=" + value + "; expires=" + expiryDate.toUTCString() + "; path=/";
    }

    getCookie = function(cname) {
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

    saveToStorage = function() {
        if (window.sessionStorage) {
            var list = document.getElementById("ipList").innerHTML;
            var input = document.getElementById("ipAddressArea").value;

            window.sessionStorage.setItem("ipList", list);
            window.sessionStorage.setItem("ipAddressArea", input);
        }
    }

    // Update Video Screenshot
    setInterval(updateScreen, 500);
    
});