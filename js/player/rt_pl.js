$ = jQuery;

var RTPlayer = function (ch_id, default_volume, do_autoplay, host, format, stream, language) {
    this.ch_id = ch_id; // Player unique channel id
    this.vol = default_volume;
    this.autoplay = do_autoplay;
    this.ready = false;
    this.timer_handle = false;
    this.timer_time = 0;
    this.host = host;
    this.format = format;
    this.stream = stream;
    this._init();
    if (language === 'ru') {
        this.loadingText = "Загрузка...";
        this.errorText = "Ошибка";
        this.errorSSL = "Невозможно проиграть не защищенный HTTP поток с защищенной HTTPS страницы";
    }
    else if (language === 'fr') {
        this.loadingText = "Chargement...";
        this.errorText = "Erreur";
        this.errorSSL = "La lecture de flux HTTP non sécurisé est impossible à partir d'une page chargée via le protocole HTTPS";
    }
    else {
        this.loadingText = "Loading...";
        this.errorText = "Error";
        this.errorSSL = "Unsecure HTTP stream playback is impossible from a page loaded over HTTPS protocol";
    }
};

RTPlayer.prototype = {

    _formatTime: function (secs) {
        var pad = function (n) {
            return (n < 10 ? "0" + n : n);
        };
        var h = Math.floor(secs / 3600);
        var m = Math.floor((secs / 3600) % 1 * 60);
        var s = secs % 60;
        return pad(h) + ":" + pad(m) + ":" + pad(s);
    },

    reconnect: function () {
        var $p = $("#rtJpID-" + this.ch_id);
        this.timer_time = 0;
        clearInterval(this.timer_handle);
        $p.jPlayer("stop");
        $("#current_time-" + this.ch_id).html(this.loadingText);
        $p.jPlayer("clearMedia");
        $p.jPlayer("setMedia", this.stream);
        $p.jPlayer("play");
    },
    _init: function () {

        // Pointer to the current widget
        var w = this;
        w.isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
        $("#rtJpID-" + this.ch_id).jPlayer({
            ready: function (e) {
                $(this).jPlayer("setMedia", w.stream);
                w.ready = true;
                if (w.autoplay) {
                    if (!w.isMobile) {
                        var audio = $("#rtJpID-" + w.ch_id).find("audio");
                        if(audio.length){
                            audio = audio[0];
                            var playPromise = audio.play();
                            if (playPromise !== undefined) {
                                playPromise.then(function() {
                                    // Automatic playback started!
                                    console.log("Autoplay is supported");
                                    $("#rtJpID-" + w.ch_id).jPlayer("clearMedia");
                                    $('#button_play_stop-' + w.ch_id).trigger('click');
                                }).catch(function(error) {
                                    // Automatic playback failed.
                                    // Show a UI element to let the user manually start playback.
                                    console.log("Autoplay is not supported");
                                });
                            }
                            else{
                                $("#rtJpID-" + w.ch_id).jPlayer("clearMedia");
                            }
                        }
                    }
                }
            },
            swfPath: w.host + "/media/static/swf", // path to Jplayer.swf
            supplied: w.format,
            wmode: "window",
            preload: "none",
            solution: 'html, flash',
	        volume: w.vol / 100,
            play: function (e) {
                ///console.log("play");
            },
            playing: function (e) {
                //console.log("Playing")
                $("#current_time-" + w.ch_id).html('00:00:00');
                clearInterval(w.timer_handle);
                w.timer_handle = setInterval(function () {
                    w.timer_time += 1;
                    $("#current_time-" + w.ch_id).html(w._formatTime(w.timer_time));
                }, 1000);
                clearInterval(w.reconnect_timer_handle);
                delete w.reconnect_timer_handle;
                this.play_started = true;
            },
            pause: function () {
                $(this).jPlayer("clearMedia");
            },
            suspend: function (e) {
                //console.log("Suspend!", e)
                //if (!w.isMobile && !w.reconnect_timer_handle && this.play_started) {
                //    w.reconnect(w);
                //    w.reconnect_timer_handle = setInterval(w.reconnect.bind(w), 10 * 1000);
                //}
            },

            abort: function (e) {
                //console.log("Abort!", e)
            },

            emptied: function (e) {
                //console.log("emptied!", e)
                if (!w.isMobile && !w.reconnect_timer_handle && this.play_started) {
                    w.reconnect(w);
                    w.reconnect_timer_handle = setInterval(w.reconnect.bind(w), 10 * 1000);
                }
            },
            stalled: function (e) {
                //console.log("stalled!", e)
                if (!w.isMobile && !w.reconnect_timer_handle && this.play_started) {
                    w.reconnect(w);
                    w.reconnect_timer_handle = setInterval(w.reconnect.bind(w), 10 * 1000);
                }
            },
            ended: function (e) {
                //console.log("ended!", e)
            },

            error: function (event) {
                if (w.ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
                    $(this).jPlayer("setMedia", w.stream).jPlayer("play");
                }
                else if (event.jPlayer.error.type == 'e_url') {
                    $(this).jPlayer("setMedia", w.stream);
                }
                else if (w.ready) {
                    $("#current_time-" + w.ch_id).html(w.errorText);
                    clearInterval(w.timer_handle);
                }
            }
        });

        // Mute
        $('#rtplmute-' + this.ch_id).click(function (e) {
            e.preventDefault();
            $('#rtplmaxvol-' + w.ch_id).removeClass("active");
            if ($('#rtplmute-' + w.ch_id).hasClass("active")) {
                $('#rtplmute-' + w.ch_id).removeClass("active");
                $("#rtJpID-" + w.ch_id).jPlayer("unrtplmute");
                $("#rtplvolume-" + w.ch_id).slider("value", w.vol);
            }
            else {
                $('#rtplmute-' + w.ch_id).addClass("active");
                $("#rtJpID-" + w.ch_id).jPlayer("rtplmute");
                $("#rtplvolume-" + w.ch_id).slider("value", 0);
            }
        });

        // Max volume
        $('#rtplmaxvol-' + this.ch_id).click(function (e) {
            e.preventDefault();
            $('#rtplmute-' + w.ch_id).removeClass("active");
            // Fall back to default volume
            if ($('#rtplmaxvol-' + w.ch_id).hasClass("active")) {
                $('#rtplmaxvol-' + w.ch_id).removeClass("active");
                $("#rtplvolume-" + w.ch_id).slider("value", w.vol);
            }
            else {
                $("#rtJpID-" + w.ch_id).jPlayer("unrtplmute");
                $('#rtplmaxvol-' + w.ch_id).addClass("active");
                $("#rtJpID-" + w.ch_id).jPlayer("volume", 1);
                $("#rtplvolume-" + w.ch_id).slider("value", 100);
            }
        });

        // Play/Stop
        $('#button_play_stop-' + this.ch_id).click(function (e) {
            e.preventDefault();

            if (!$(this).hasClass('active')) {

                var a = w.stream[w.format].split("//");
                //if(a.length > 1){
                    //var stream_protocol = a[0];
                    //if(location.protocol == "https" && stream_protocol != 'https'){
                    //    alert(w.errorSSL);
                    //    return;
                    //}
                //}
                // Stop all other players
                $("[id^=rtJpID-]").each(function (idx, element) {
                    if ((element.id != "rtJpID-" + w.ch_id)) {
                        var n = element.id.split('-');
                        if ($('#button_play_stop-' + n[1]).hasClass('active')) {
                            $('#button_play_stop-' + n[1]).trigger('click');
                        }
                    }
                });
                $("#rtJpID-" + w.ch_id).jPlayer("play");
                $("#button_play_stop-" + w.ch_id).addClass('active');
                $("#current_time-" + w.ch_id).html(w.loadingText);
            }
            else {
                $("#button_play_stop-" + w.ch_id).removeClass('active');
                clearInterval(w.timer_handle);
                $("#rtJpID-" + w.ch_id).jPlayer("stop");
                $("#current_time-" + w.ch_id).html('00:00:00');
                w.timer_time = 0;
                $("#rtJpID-" + w.ch_id).jPlayer("clearMedia");
                w.play_started = false;
            }
        });

        // Volume slider
        $("#rtplvolume-" + this.ch_id).slider({
            value: w.vol,
            orientation: "horizontal",
            range: "min",
            animate: true,
            change: function (e, ui) {
                if (ui.value === 0) {
                    if (!$('#rtplmute-' + w.ch_id).hasClass("active")) {
                        $('#rtplmute-' + w.ch_id).addClass("active");
                    }
                }
                else if (ui.value == 100) {
                    if (!$('#rtplmaxvol-' + w.ch_id).hasClass("active")) {
                        $('#rtplmaxvol-' + w.ch_id).addClass("active");
                    }
                }
                else {
                    if ($('#rtplmute-' + w.ch_id).hasClass("active")) {
                        $('#rtplmute-' + w.ch_id).removeClass("active");
                    }
                    if ($('#rtplmaxvol-' + w.ch_id).hasClass("active")) {
                        $('#rtplmaxvol-' + w.ch_id).removeClass("active");
                    }
                }
                $("#rtJpID-" + w.ch_id).jPlayer("volume", ui.value / 100.0);
            }
        });
    },
};

