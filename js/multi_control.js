$(function() {

    var camera_inet_addr = "http://192.168.12.1";
    var ipArray;
    var i;

    // Input IP addresses
    function getIpAddress(){
        var ipList = document.getElementById("ip_address_area").value;
        var ipDisplay = "The List of IP Address:<br>";
        ipArray = ipList.split(",");
 
        for (i = 0; i < ipArray.length; i++)
        {
            ipDisplay += ipArray[i] + "<br>";
        }
        document.getElementById("ip_list").innerHTML = ipDisplay;
        
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
    function getResolution(){
        $.ajax({
            url:camera_inet_addr+"/control/get",
            data:{"resolution":""},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                $("#hRes").val(data.resolution.hRes);
                $("#vRes").val(data.resolution.vRes);
                $("#fps").val(parseFloat(1 / parseFloat(data.resolution.minFrameTime)).toFixed(2));
                $("#hOff").val(data.resolution.hOffset);
                $("#vOff").val(data.resolution.vOffset);
            });    
    }

    function getExposure(){
        $.ajax({
            url:camera_inet_addr+"/control/get",
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

                // SHutter Display
                document.getElementById("shutter").min = data.exposureMin;
                document.getElementById("shutter").max = data.exposureMax;
                var value = Math.sqrt(data.exposurePeriod / data.exposureMax) * data.exposureMax;
                $("#shutter").val(value);
            });
    }

    var init_resolution = {
        "framePeriod": 100000,
        "resolution": {
            bitDepth: 12,
            hOffset: 320,
            hRes: 640,
            minFrameTime: 0.000444622,
            vDarkRows: 0,
            vOffset: 272,
            vRes: 480,
        }
    }

    /* Set parameters from webpage to all cameras on the IP list */
    // Resolution & frame rate
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
        init_resolution.resolution.hOffset = parseInt($("#hOff").val());
        init_resolution.resolution.vOffset = parseInt($("#vOff").val());

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

    // Set Frame Rate to its max value
    function getMaxFrameRate() {
        $.ajax({
            url:camera_inet_addr+"/control/get",
            data:{"minFramePeriod":""},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                var fpsBox = document.getElementById("fps") ;
                fpsBox.value = parseFloat(1000000000 / parseFloat(data.minFramePeriod)).toFixed(2) ;;
                fpsBox.max = fpsBox.value ;
            });
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

    // Center Window
    function centerWindow(){
        // calculate horizontal offset (to center the window on the sensor)
        document.getElementById("hOff").value = Math.floor((document.getElementById("hRes").max - parseInt(document.getElementById("hRes").value)) / 2) ;

        // calculate vertical offset (to center the window on the sensor)
        document.getElementById("vOff").value = Math.floor((document.getElementById("vRes").max - parseInt(document.getElementById("vRes").value)) / 2) ;

        if ( parseInt(document.getElementById("vOff").value) % 2 == 1 ) // if the number is odd
            document.getElementById("vOff").value -= 1 ;

        updatePreviewWindow();
    }

    function updatePreviewWindow(){

    }


    var resolutionPresets = [	[1920, 1200, 0],
                                [1920, 1080, 0],
                                [1696, 1050, 0],
                                [1600, 1050, 0],
                                [1408, 1050, 0],

                                [1280, 1024, 0],
                                [1280, 720, 0],
                                [1280, 512, 0],
                                [1280, 360, 0],
                                [1280, 240, 0],
                                [1280, 120, 0],
                                [1280, 96, 0],
                                [1024, 768, 0],
                                [1024, 576, 0],
                                [800, 600, 0],
                                [800, 480, 0],
                                [640, 480, 0],
                                [640, 360, 0],
                                [640, 240, 0],
                                [640, 120, 0],
                                [640, 96, 0],
                                [336, 240, 0],
                                [336, 120, 0],
                                [336, 96, 0],
                            ] ;


    var counter = 0 ;


    // SMB
    //Password
    					//	 key	 	 inactive		active
    var nameChange = {	"displayToggleButton":	[ "Off", "On" ],
                        "autoSaveButton":		[ "No", "Yes" ],

                        "disableRBButton":		[ "Enabled", "Disabled" ],
                        //					"smbPassShowHide":		[ "Show", "Hide" ],
                     }

    var buttonFunctions = {	"menu":			[ function(){ document.getElementById("menuList").style.display = "" ; }, function(){ menuKeeper() ; document.getElementById("menuList").style.display = "block" ;} ],					

                            "debugToggle":			[ function(){ DebugOnOff = false ; document.getElementById("debugger").innerHTML = "" ; document.getElementById("debugger2").innerHTML = "" ; }, function() { DebugOnOff = true ; } ],
                            "displayToggleButton":	[ function(){ dataRequester("set", '{"backlightEnabled": false}', pageUpdate) ; }, function(){ dataRequester("set", '{"backlightEnabled": true}', pageUpdate) ; } ],
                            "autoSaveButton":		[ function(){ if (getCookie("as") > 0) { setCookie("as", parseInt(getCookie("as") * -1)) ; } else { setCookie("as", 0) ; } }, function() { if (getCookie("as") < 0) { setCookie("as", parseInt(getCookie("as") * -1)) ; } else { setCookie("as", 1) ; } } ],

                            "disableRBButton":		[ function(){ dataSender("set", '{"disableRingBuffer": 0}') ; }, function() { dataSender("set", '{"disableRingBuffer": 1}') ; } ],
                            "smbPassShowHide":		[ function(){ document.getElementById("smbPass").type="password" ; document.getElementById("smbPass").placeholder="******" ; }, function(){ document.getElementById("smbPass").type="text" ; document.getElementById("smbPass").placeholder="s3cr3t" ; } ],
                          }


    function toggler(element) { // toggle the class (active/inactive), change the name, and run a function for a toggle button/switch
        var leftRight = 0 ;

        if (element.classList.contains("active")) { // changing to 'inactive' or no state set previously
        element.classList.remove("active") ; // remove the "active" styling
        element.classList.add("inactive") ; // use the "inactive" styling
        leftRight = 0 ; // use the 'left' column for names / functions
        }
        else if (element.classList.contains("disabled")) { // button disabled
        return ; // don't do anything
        }
        else {
        element.classList.remove("inactive") ; // remove the "inactive" styling
        element.classList.add("active") ; // use the "active" styling
        leftRight = 1 ; // use the 'right' column for names / functions
        }

        if (element.id in nameChange) // check if key-value exists
        element.innerHTML = nameChange[element.id][leftRight] ; // set name to the left (inactive) or right (active) one

        if (element.id in buttonFunctions) // if the key-value exists
        buttonFunctions[element.id][leftRight]() ; // run the left (inactive) or right (active) function
    }

    $("#smbPassShowHide").on("click", function(){
        toggler(this);
    })


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
    
        /*
        requestSender.onreadystatechange = function(){ // do something with the response
            if (this.readyState == 4 && this.status == 200){
                if (requestSender.responseText == "") // got nothing back
                    document.getElementById("netShareResultBox").firstChild.textContent = "Camera could not connect" ;
                else {
                    var jsonBack = JSON.parse(requestSender.responseText) ; // convert to json
                    if ("error" in jsonBack)
                        document.getElementById("netShareResultBox").firstChild.textContent = jsonBack.error ;
                    else
                        document.getElementById("netShareResultBox").firstChild.textContent = "Success!" ;
                }
    
                // show the status
                document.getElementById("popUpBackground").classList.remove("hidden") ;
                document.getElementById("netShareResultBox").classList.remove("hidden") ;
    
            }
        }
        */
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
        //requestSender.open("GET", "/cgi-bin/netShare?" + parameters) ;
        //requestSender.setRequestHeader("Content-Type", "application/json") ;
    
    
        //requestSender.send() ;
    
    }

    var inputFunctions = { "segmentNum":			function(value) { dataRequester("set", '{"recSegments": ' + value + '}', pageUpdate) ; },

                            "colourDefaultBtn":		function() { detourRequester("set", '{"colorMatrix": [1.91455, -0.57666, -0.234131,  -0.30542, 1.3894, -0.0966797,  0.127197, -0.952881, 1.64917]}', pageUpdate) ; },
                            "colourIdentityBtn":	function() { detourRequester("set", '{"colorMatrix": [1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0]}', pageUpdate) ; },
                            "colourApplyBtn":		function() { detourRequester("set", '{"colorMatrix": [' + document.getElementById("colMatrixa").value + ', ' + document.getElementById("colMatrixb").value + ', ' + document.getElementById("colMatrixc").value + ', ' + document.getElementById("colMatrixd").value + ', ' + document.getElementById("colMatrixe").value + ', ' + document.getElementById("colMatrixf").value + ', ' + document.getElementById("colMatrixg").value + ', ' + document.getElementById("colMatrixh").value + ', ' + document.getElementById("colMatrixi").value + ']}', pageUpdate) ; },
                            "colourPreset1Btn":		function() { detourRequester("set", '{"colorMatrix": [1.91455, -0.57666, -0.234131,  -0.30542, 1.3894, -0.0966797,  0.127197, -0.952881, 1.64917]}', pageUpdate) ; },
                            "colourPreset2Btn":		function() { detourRequester("set", '{"colorMatrix": [1.23291, 0.646729, -0.776367,  -0.321777, 1.68994, -0.380859,  -0.0612793, -0.640869,1.52563]}', pageUpdate) ; },

                            "whiteBalApplyBtn":		function() { detourRequester("set", '{"wbColor": [' + document.getElementById("whiteBalNuma").value + ', ' + document.getElementById("whiteBalNumb").value + ', ' + document.getElementById("whiteBalNumc").value + ']}', pageUpdate) ; },

                            "resetAll":				function() { resetAll() ; },

                            "morePreRecTime":		function() { extender += lastKnownMaxRecFrames ; document.getElementById("postTriggerSlider").max = lastKnownMaxRecFrames + extender ; document.getElementById("postTriggerSlider").value = parseInt(document.getElementById("postTriggerSlider").value) + lastKnownMaxRecFrames ; document.getElementById("postTriggerFrameNum").value = document.getElementById("postTriggerSlider").max - parseInt(document.getElementById("postTriggerSlider").value) ; document.getElementById("backgroundThing").style.borderLeftWidth = ( extender / (extender + lastKnownMaxRecFrames) * document.getElementById("postTriggerSlider").offsetWidth ) + "px" ; },
                            "defaultTrigDelay":		function() { extender = 0 ; dataRequester("set", '{"recTrigDelay": 0}', pageUpdate) ; },

                            "nfsTestBtn":			function() { if (!document.getElementById("nfsTestBtn").classList.contains("disabled")) { netStorageRequest("test", "nfs") ; } },
                            "nfsApplyBtn":			function() { netStorageRequest("mount", "nfs") ; },
                            "nfsUnmountBtn":		function() { if (!document.getElementById("nfsUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "nfs") ; } },
                            
                            "smbTestBtn":			function() { if (!document.getElementById("smbTestBtn").classList.contains("disabled")) { netStorageRequest("test", "smb") ; } },
                            "smbApplyBtn":			function() { netStorageRequest("mount", "smb") ; },
                            "smbUnmountBtn":		function() { if (!document.getElementById("smbUnmountBtn").classList.contains("disabled")) {netStorageRequest("unmount", "smb") ; } },
                        }


    function justRunSomething(element) {
        if (element.id in inputFunctions) // if the key-value exists
            inputFunctions[element.id](element.value) ; // run the function (with the value given)
    }

    $("#smbUnmountBtn").on("click", function(){
        justRunSomething(this);
    });
    $("#smbTestBtn").on("click", function(){
        justRunSomething(this);
    });
    $("#smbApplyBtn").on("click", function(){
        justRunSomething(this);
    })


    var dropDownFunctions = { "0dB (x1)":		function(){ dataSender("set",'{"currentGain": 1}'); },
                            "6dB (x2)":			function(){ dataSender("set",'{"currentGain": 2}'); },
                            "12dB (x4)":		function(){ dataSender("set",'{"currentGain": 4}'); },
                            "18dB (x8)":		function(){ dataSender("set",'{"currentGain": 8}'); },
                            "24dB (x16)":		function(){ dataSender("set",'{"currentGain": 16}'); },

                            "8000K":			function(){ dataSender("set", '{"wbTemperature": 8000}'); },
                            "6500K":			function(){ dataSender("set", '{"wbTemperature": 6500}'); },
                            "5600K":			function(){ dataSender("set", '{"wbTemperature": 5600}'); },
                            "5250K":			function(){ dataSender("set", '{"wbTemperature": 5250}'); },
                            "4600K":			function(){ dataSender("set", '{"wbTemperature": 4600}'); },
                            "3200K":			function(){ dataSender("set", '{"wbTemperature": 3200}'); },
                            "Custom":			function(){ document.getElementById("whiteBalance").firstChild.textContent = "Custom"; },

                            "Refresh":			function(){ dataGetter("get", 'externalStorage', pageUpdate); },

                            "H.264 (mp4)":		function(){ document.getElementById("saveFormat").firstChild.textContent = "H.264 (mp4)"; setCookie("ff", 0) ; },
                            "CinemaDNG (raw)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "CinemaDNG (raw)"; setCookie("ff", 1) ; },
                            "TIFF (images)":	function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF (images)"; setCookie("ff", 2) ; },
                            "TIFF RAW (images)": function(){ document.getElementById("saveFormat").firstChild.textContent = "TIFF RAW (images)"; setCookie("ff", 3) ; },

                            "Debug Tools":		function(){ var item = document.getElementById("debugBar") ; if (item.classList.contains("hidden")) { item.classList.remove("hidden") ; } else { item.classList.add("hidden") ; } },

                            "Play Mode":		function() { dataRequester("startPlayback", '{"framerate": 0}', pageUpdate) ; },
                            "Cancel Save":		function() { dataSender("stopFilesave", "{}") ; },
                            "Record Mode":		function() { dataRequester("startLivedisplay", "{}", pageUpdate) ; },

                            "Update":			function() { dataGetter("p", "", pageUpdate) ; },
                            "Yes (overwrite)":	function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("overwrittenBox").classList.add("hidden") ; dataRequester("startRecording", "{}", pageUpdate) ; },
                            "No (don't record)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("overwrittenBox").classList.add("hidden") ; stateSelecter(document.getElementById("record"), 0) ; },

                            "Yes (apply the changed settings)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("resNotAppliedBox").classList.add("hidden") ; applyResolution() ; },
                            "No (revert to previous settings)": function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("resNotAppliedBox").classList.add("hidden") ; dataGetter("get", "resolution&frameRate", pageUpdate) ; },

                            "Ok":				function() { document.getElementById("popUpBackground").classList.add("hidden") ; document.getElementById("errorWhileSavingBox").classList.add("hidden") ; document.getElementById("noRecordSegmentModeBox").classList.add("hidden") ; document.getElementById("cantApplyResBox").classList.add("hidden") ; },

                            }


    const dbFromMult = { 1:0, 2:6, 4:12, 8:18, 16:24 } // provide a multiple, get back the dB value

    function dropDownSelect (element) {
        if (element.innerText in dropDownFunctions) // if the key-value exists
            dropDownFunctions[element.innerText]() ; // run the function
    }

    $("#refreshdropdown").on("click", function(){
        dropDownSelect(this);
    });
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
    $("#ok").on("click", function(){
        dropDownSelect(this);
    });



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
    $("#saveVideoButton").on("click", function(){
        saveWholeVideo();
    });




    /* Help FUnctions */
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

    function updateScreen(){
        $("#imageDisplay").attr("src", camera_inet_addr+"/cgi-bin/screenCap?" + Math.random());
    }

    function setCookie (name, value) {
        var expiryDate = new Date() ;
    
        expiryDate.setTime(expiryDate.getTime() + 1000*60*60*24*90) ; // add 90 days (time is in ms)
    //	expiryDate.setTime(expiryDate.getTime() + 1000*60*20) ; // add 20 minutes (time is in ms)
    
        document.cookie = name + "=" + value + "; expires=" + expiryDate.toUTCString() + "; path=/" ;
    }
    
    function appendLogMsg(msg){

        var today = new Date();
        $("#Status").append(today.toLocaleString()+" : "+msg+"<br/>");
    }

    // Record/Stop button
    $("#btn_toggle_record").on("click", function(){
        var obj_btn = $(this);

        if(obj_btn.hasClass("start")){
            startRecording("toggle");
        }else if(obj_btn.hasClass("stop")){
            stopRecording("toggle");
        }
    });

    // Apply Resolution, Frame Rate, Offset
    $("#applyButton").on("click", function(){
        setResFrameRate();
    });

    // Set Exposure Time, Percent, Degrees
    $("#shutter").on("input", function(){
        holdWhileSliding(this);
    });
    $("#exposureTime").on("input", function(){
        setExposure(this);
    });
    $("#exposurePercent").on("input", function(){
        setExposure(this);
    });
    $("#exposureDegrees").on("input", function(){
        setExposure(this);
    });
    $("#maxShutterButton").on("click", function(){
        maxShutter();
    });

    $("#maxFRButton").on("click", function(){
        getMaxFrameRate();
    })

    $("#hRes").on("input", function(){
        centerWindow();
    });
    $("#vRes").on("input", function(){
        centerWindow();
    })
    $("#centerWindow").on("click", function(){
        centerWindow();
    })

    // Reboot cameras
    $("#rebootBtn").on("click", function(){
        rebootCamera();
    });

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

    // Get IP Addresses List
    $("#ipConfirmButton").on("click", function(){
        getIpAddress();
    });
    // Clear Textarea
    $("#ipClearButton").on("click", function(){
        clearIpAddress();
    });

    var intervalID = setInterval(updateScreen, 500)
    //initRes_SelectBox();
    getResolution();
    getExposure();
});