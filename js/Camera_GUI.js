$(function() {

    var camera_inet_addr = "http://192.168.12.1";
    var camera_state = "";
    var ipArray;
    var i;

    function checkIp(ip){
        var ipHttp = ip.indexOf("http://");

        if(ipHttp == 0){
　　　　    return ip;
　　    }
　　    if(ipHttp == -1){
　　　　    return "IP address should start with 'http://'"
　　    }
    }

    function getIpAddress(){
        var ipList = document.getElementById("ip_address_area").value;
        var ipDisplay = "";
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

    function getCameraState(){

        $.ajax({
            url:camera_inet_addr+"/get?state",
            data:{},
            method:"GET",
            success: function(data){
                camera_state = data.state;
                updateCameraState();
            },
            error: function(error){
                
            },
            complete: function(data){

            },
            timeout: 10000
        });
    }

    function updateCameraState(){

    }

    function dataGetter(){
        $.ajax({
            url:camera_inet_addr+"/control",
            data:{},
            method:"GET"})
            .done(function(data){
                $("#Status").html(data);
            });
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
                        $("#btn_toggle_record").val("Stop Record");
                    }
                },
                error: function(error){
                    
                },
                complete: function(data){

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
                        $("#btn_toggle_record").val("Start Record");
                    }
                },
                error: function(error){
                    
                },
                complete: function(data){

                },
                timeout: 10000});
        }
    }

    function startFilesave(){
        //var option = {filename:"", device: "nfs", format: "dng"}
        var option = {filename:"", device: "smb", format: "dng"}
        
        $.ajax({
            url:camera_inet_addr+"/control/startFilesave",
            data:JSON.stringify(option),
            method:"POST",
            contentType: "application/json",
            success: function(data){
                
            },
            error: function(error){
                
            },
            complete: function(data){

            },
            timeout: 10000
        }); 
    }

    function stopFilesave(){
        
        $.ajax({
            url:camera_inet_addr+"/control/stopFilesave",
            data:{},
            method:"POST",
            success: function(data){
                
            },
            error: function(error){
                
            },
            complete: function(data){

            },
            timeout: 10000
        });
    }

    function getParameters(){

        $.ajax({
            url:camera_inet_addr+"/control/p",
            data:{},
            method:"GET",
            timeout: 10000})
            .done(function(data){
              
            });
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

    var resolutionPresets = [
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


    var triggerSettings = {
        "ioThresholdIo1": 2.0,
        "ioMappingTrigger": {
            "source": "io1",
            "debounce": false,
            "invert": false}
    }

    function initRes_SelectBox(){
        $("#selectBox_res").append("<option>Choose....</option>");
        for(var i in resolutionPresets){
            
            var limit_data = getResolutionTimingLimits(resolutionPresets[i][0], resolutionPresets[i][1]);
        }
    }

    function getResolutionTimingLimits(hRes, vRes){

        var res_data = {"hRes": 0, "vRes": 0}
        var return_data = {};

        res_data.hRes = hRes;
        res_data.vRes = vRes;
   
        $.getJSON({
            url:camera_inet_addr+"/control/getResolutionTimingLimits",
            data:JSON.stringify(res_data),
            method:"POST",
            contentType: "application/json",
            timeout: 10000})
            .done(function(data){

                var val_fps = parseFloat(1000000000 / parseFloat(data.minFramePeriod)).toFixed(2);
                var val_minFramePeriod = parseFloat(data.minFramePeriod/1000000000);
                $("#selectBox_res").append("<option class='itemRes' data-hRes='"+hRes+"' data-vRes='"+vRes+"' data-frame='"+val_fps+"' data-minFramePeriod='"+val_minFramePeriod+"'>"+hRes+"x"+vRes+" :: "+val_fps+" fps"+"</option>");
            });

    }

    function setResFrameRate(){

        if($("#hRes").val()){
            init_resolution.resolution.hRes = parseInt($("#hRes").val());
        }else{
            //alert("해상도를 선택하세요.");
            return;
        }

        if($("#vRes").val()){
            init_resolution.resolution.vRes = parseInt($("#vRes").val());
        }else{
            //alert("해상도를 선택하세요.");
            return;
        }

        if($("#fps").val()){
            //init_resolution.framePeriod = parseInt($("#fps").attr("data-minFramePeriod"));
            init_resolution.framePeriod = parseInt(1000000000/parseInt($("#fps").val()));
        }else{
            //alert("해상도를 선택하세요.");
            return;
        }
        init_resolution.resolution.hOffset = parseInt($("#hRes").attr("data-hOff_max"));
        init_resolution.resolution.vOffset = parseInt($("#vRes").attr("data-vOff_max"));

        init_resolution.resolution.minFrameTime = parseFloat($("#fps").attr("data-minFramePeriod"));
        //console.log(init_resolution);
        //return;
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

    function setTriggerSttings(){
        
        $.ajax({
            url:camera_inet_addr+"/control/set",
            data:JSON.stringify(initializeSetting),
            method:"POST",
            contentType: "application/json",
            success: function(data){
                
            },
            error: function(error){
                
            },
            timeout: 10000
        });
    }

    function rebootCamera(){

        $.ajax({
            url:camera_inet_addr+"/control/reboot",
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

    function flushRecording(){

        $.ajax({
            url:camera_inet_addr+"/control/flushRecording",
            data:{},
            method:"GET",
            contentType: "application/json"})
            .done(function(data){
                
            });
    }

    

    function updateScreen(){
        $("#imageDisplay").attr("src", camera_inet_addr+"/cgi-bin/screenCap?" + Math.random());
    }

    
    function appendLogMsg(msg){

        var today = new Date();
        $("#Status").append(today.toLocaleString()+" : "+msg+"<br/>");
    }


    $("#btn_start_record").on("click", function(){
        startRecording();
    });

    $("#btn_stop_record").on("click", function(){
        stopRecording();
    });

    $("#btn_toggle_record").on("click", function(){

        var obj_btn = $(this);

        if(obj_btn.hasClass("start")){
            startRecording("toggle");
        }else if(obj_btn.hasClass("stop")){
            stopRecording("toggle");
        }
    });

    $("#btn_start_file_save").on("click", function(){
        startFilesave();
    });

    $("#btn_stop_file_save").on("click", function(){
        stopFilesave();
    });

    $("#btn_set_record_setting").on("click", function(){
        setResFrameRate();
    });
    
    $("#btn_set_trigger_setting").on("click", function(){
        //setFrameRate();
        setTriggerSttings();
    });

    $("#btn_reboot").on("click", function(){
        rebootCamera();
    });

    $("#btn_flush_Recording").on("click", function(){
        flushRecording();
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

    $("#btn_ip_confirm").on("click", function(){
        getIpAddress();
    });

    $("#btn_ip_clear").on("click", function(){
        clearIpAddress();
    });

    var intervalID = setInterval(updateScreen, 500)
    initRes_SelectBox();
    getResolution();
});