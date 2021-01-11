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
        var ipDisplay = "The List of IP Address:<br>";
        ipArray = ipList.split(",");
        /*
        ipArray.forEach( function(item, index){
            $(".ip_list").append('<li class="">' + 
                                 '<span class="mcs-courseTagList__text" data-id="'+item.id+'">'+item.ename+'</span>' + 
                                 '<a href="javascript:;" class="mcs-courseTagList__close  j-close"><i class="ico-close"></i></a></li>');
        });

        $('.j-selected-employee').show(function(){
            $(".ip_list li").each(function(){
                var top = $(this).position().top;
                if(top>0){
                    $(this).addClass('other-row');//非第一行标注other-row
                }
            })
            if($('.other-row').length!==0){
                $('.j-selected-employee').append('<a href="javascript:;" class="more-btn j-more"><span>More</span> <i class="arrow arrow-down"></i></a>');
            }
            $('.ip_list .other-row').hide();
        });
        */
        for (i = 0; i < ipArray.length; i++)
        {
            ipDisplay += ipArray[i] + "<br>";
        }
        document.getElementById("ip_list").innerHTML = ipDisplay;
        
    }

    //Extend
    $('body').on('click','.j-more',function () {
        $(this).parent().find('.other-row').show();
        $(this).after('<a href="javascript:;" class="more-btn j-fold"><span>收起</span> <i class="arrow arrow-up"></i></a>');
        $(this).remove();
        
    });
    //Fold
    $('body').on('click','.j-fold',function () {
        $(this).parent().find('.other-row').hide();
        $(this).after('<a href="javascript:;" class="more-btn j-more"><span>更多</span> <i class="arrow arrow-down"></i></a>');
        $(this).remove();
    })

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
        init_resolution.resolution.hOffset = parseInt($("#hRes").attr("data-hOff_max"));
        init_resolution.resolution.vOffset = parseInt($("#vRes").attr("data-vOff_max"));

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

    function changeExposureOften(element) {
        boundInput(element) ;
    
        if (typeof changeExposureOften.requestCount == 'undefined')
            changeExposureOften.requestCount = 0 ;
    
    
        var whenFinished = function() {
            changeExposureOften.requestCount -= 1 ;
        }
    
        var sendParams = "" ;
    
        switch (element.id) {
            case "exposurePercent":
                sendParams = '{"exposurePercent":' + parseFloat(element.value) + '}' ;
                break ;
    
            case "exposureDegrees":
                sendParams = '{"shutterAngle":' + parseFloat(element.value) + '}' ;
                break ;
    
            case "exposureTime":
                sendParams = '{"exposurePeriod":' + parseInt(element.value * 1000) + '}' ;
                break ;
        }
    
        if ( (sendParams != "") && (changeExposureOften.requestCount < 1) ) {
            changeExposureOften.requestCount += 1 ;
            dataRequester ("set", sendParams, whenFinished) ;
        }
    }

    $("#shutter").on("input", function(){
        holdWhileSliding($("#shutter"));
    });

    $("#exposureDegrees").on("input", function(){
        changeExposureOften(this);
    });
    $("#exposurePercent").on("input", function(){
        changeExposureOften(this);
    });
    $("#exposureTime").on("input", function(){
        changeExposureOften(this);
    });
    


    /* Old functions Usage */
    $("#btn_toggle_record").on("click", function(){

        var obj_btn = $(this);

        if(obj_btn.hasClass("start")){
            console.log("Start");
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
    initRes_SelectBox();
    getResolution();
});