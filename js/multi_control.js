$(function() {

    var camera_inet_addr = "http://192.168.12.1";
    var ipArray;
    var i;

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

    function clearIpAddress(){
        document.getElementById("ip_address_area").value='';
        document.getElementById("ip_list").innerHTML="";
    }

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
                  "exposureMin":"",
                  "exposureMax":"",
                  "framePeriod":""},
            method:"GET",
            timeout: 10000})
            .done(function(data){
                $("#exposureTime").val(parseFloat(data.exposurePeriod / 1000).toFixed(1));
                $("#exposurePercent").val(parseFloat(data.exposurePeriod / data.exposureMax * 100).toFixed(1));
                $("#exposureDegrees").val(parseFloat(data.exposurePeriod / data.framePeriod * 360).toFixed(1));
                var value = Math.sqrt(data.exposurePeriod / data.exposureMax) * data.exposureMax;
                console.log(data);
                console.log(value);
                $("#shutter").val(value);
            });
    }

    var initializeSetting = {
        "exposureMax": 929900,
        "exposureMin": 1000,
        "exposureMode": "normal",
        "exposureNormalized": 1,
        "exposurePercent": 100,
        "exposurePeriod": 929900,
        "framePeriod": 935455,
        "ioDelayTime": 0,
        "ioMappingCombAnd": {source: "alwaysHigh", debounce: false, invert: false},
        "ioMappingCombOr1": {source: "none", debounce: false, invert: false},
        "ioMappingCombOr2": {source: "none", debounce: false, invert: false},
        "ioMappingCombOr3": {source: "none", debounce: false, invert: false},
        "ioMappingCombXor": {source: "none", debounce: false, invert: false},
        "ioMappingDelay": {source: "none", debounce: false, invert: false},
        "ioMappingGate": {source: "none", debounce: false, invert: false},
        "ioMappingIo1": {drive: 0, source: "alwaysHigh", debounce: false, invert: false},
        "ioMappingIo2": {drive: 0, source: "alwaysHigh", debounce: false, invert: false},
        "ioMappingShutter": {source: "none", debounce: false, invert: false},
        "ioMappingStartRec": {source: "io1", debounce: false, invert: false},
        "ioMappingStopRec": {source: "io1", debounce: false, invert: true},
        "ioMappingToggleClear": {source: "io1", debounce: false, invert: false},
        "ioMappingToggleFlip": {source: "io1", debounce: false, invert: false},
        "ioMappingToggleSet": {source: "io1", debounce: false, invert: false},
        "ioMappingTrigger": {source: "none", debounce: false, invert: false},
        "ioThresholdIo1": 4.0,
        "ioThresholdIo2": 2.49929,
        "miscScratchPad": {empty: 1},
        "recMaxFrames": 1000,
        "recMode": "normal",
        "recPreBurst": 1,
        "recSegments": 1,
        "recTrigDelay": 0,
        "resolution": {
            bitDepth: 12,
            hOffset: 0,
            hRes: 1280,
            minFrameTime: 0.000934922,
            vDarkRows: 0,
            vOffset: 0,
            vRes: 1024
        }
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
                success: function(data){
                    
                },
                error: function(error){
                    
                },
                timeout: 10000
            });
        }
    }

    function rebootCamera(){
        for (i = 0; i < ipArray.length; i++){
            $.ajax({
                url:ipArray[i]+"/control/reboot",
                data:{"power":1},
                method:"GET",
                contentType: "application/json",
                success: function(data){
                    
                },
                error: function(error){
                    
                },
                timeout: 10000
            });
        }
    }

    function updateScreen(){
        $("#imageDisplay").attr("src", camera_inet_addr+"/cgi-bin/screenCap?" + Math.random());
        
    }

    
    function appendLogMsg(msg){

        var today = new Date();
        $("#Status").append(today.toLocaleString()+" : "+msg+"<br/>");
    }

    /* Add new functions */
    // Help Functions
    function dataRequester(method, parameter, callMeMaybe) {
        var requestSender = new XMLHttpRequest() ; // set up a new request
        requestSender.open("POST", "/control/" + method) ; // use "post", and use the /control/ method
        requestSender.setRequestHeader("Content-Type", "application/json") ; // use json format
    
        requestSender.onreadystatechange = function(){ // do something with the response
            if (this.readyState == 4 && this.status == 200){ // wait for successful response
                callMeMaybe(requestSender.responseText) ; // call the callback function with the response text
            }
        }
    
        requestSender.send(parameter) ;
    }

    function dataSender(method, parameter){
        var requestSender = new XMLHttpRequest() ;
        requestSender.open("POST", "/control/" + method) ;
        requestSender.setRequestHeader("Content-Type", "application/json") ;
        
        requestSender.send(parameter) ;
    }

    // Exposure(Shutter)
    var exposureValue = document.getElementById("shutter").value;
    var exposureMin = 1000;
    var exposureMax = 2000;
    var framePeriod = 3000;
    var resFRSettingsOnCam = [];

    function holdWhileSliding(element) {

        if (typeof holdWhileSliding.requestCount == 'undefined')
            holdWhileSliding.requestCount = 0 ;
    
        exposureValue = Math.pow( ((element.value - exposureMin) / (exposureMax - exposureMin)), 2 ) * exposureMax ;
    
        var notTooOften = function() {
            holdWhileSliding.requestCount -= 1 ;
        }
    
        if (holdWhileSliding.requestCount < 1) {
            holdWhileSliding.requestCount += 1 ;
            dataRequester ("set", '{"exposurePeriod":' + parseInt(exposureValue) + '}', notTooOften) ;
        }
    
    }

    

    $("#shutter").on("input", function(){
        holdWhileSliding($("#shutter"));
    });
    
    //SMB Storage
    //Password Show&Hide
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
        var obj_btn = $(this);
        toggler(obj_btn);
    });

    /* Old functions Usage */
    $("#btn_toggle_record").on("click", function(){

        var obj_btn = $(this);

        if(obj_btn.hasClass("start")){
            startRecording("toggle");
        }else if(obj_btn.hasClass("stop")){
            stopRecording("toggle");
        }
    });

    $("#applyButton").on("click", function(){
        setResFrameRate();
    });

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

    $("#ipConfirmButton").on("click", function(){
        getIpAddress();
    });

    $("#ipClearButton").on("click", function(){
        clearIpAddress();
    });

    var intervalID = setInterval(updateScreen, 500)
    //initRes_SelectBox();
    getResolution();
    getExposure();
});