function init_requests () {
    console.log("init_requests");

    $("#request_test").click(function () { request_test(); });
    $("#btn_seach").click(function () {
        search();
    });
    // $('#input_search').keypress(function (event) {
    //     var keycode = (event.keyCode ? event.keyCode : event.which);
    //     if (keycode == '13') {
    //         console.log("Enter Key")
    //         search();
    //     }
    // });


    console.log("Set button handler");
}

function request_test () {
    console.log("request_test");
    $("#server_status").text("Checking");
    $.getJSON("https://api2.wikiwoosoaps.com/api/test", function (data) {
        var status = "Bad"
        console.log(data);
        if (data && data.status) {
            status = data.status;
        }
        $("#server_status").text("Checked - Status: " + status);
    });

}

// I hate jquery. I'm so used to Vue but I don't feel like rewriting this site right now. 

var current_search = "";
var current_page = 0;
var per_page = 8;
var results = [];

function display_results () {
    var html = "";

    html += "<hr class='mb-2'/>"
    html += "<div class='w-full text-slate-800 text-center font-bold'>Showing results for:</div>";
    html += "<div class='w-full text-orange-800 text-center font-bold mb-4'>…" + current_search + "…</div>";
    html += "<ul>";
    var current_start = per_page * current_page
    var current_end = per_page * current_page + (per_page - 1)
    if (current_end >= results.length) {
        current_end = results.length - 1
    }
    console.log("current start/end: ", current_start, current_end)
    for (i = current_start; i <= current_end; i++) {
        console.log("i: ", i)
        html += "<li style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;'>"
        html += "<a class='text-blue-800 hover:underline' id='" + results[i].ID + "' href='#' onclick='select(" + i + "); return false;'>"
        html += truncate(results[i].artist, 20) + " - " + truncate(results[i].title, 35);
        html += "</a></li>"
    }
    html += "</ul>"

    html += "<div class='mt-4 mb-2 font-bold text-slate-800 text-center'>Showing " + (current_start + 1) + " to " + (current_end + 1) + " of " + results.length + " Results</div>";

    html += "<div class='flex justify-center w-full mx-auto'>"

    var enabled_btn_class = "class='bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'";
    var disabled_btn_class = "class='bg-slate-300 mr-2 text-slate-100 font-bold py-1 px-2 rounded'";

    if (current_page == 0) {
        html += "<button " + disabled_btn_class + " disabled type=button class='text-grey-400'>Prev</button>";
    } else {
        html += "<button " + enabled_btn_class + " type=button onclick='current_page--; display_results();' class='text-blue-900'>Prev</button>";
    }
    if ((current_end + 1) >= results.length) {
        html += "<button " + disabled_btn_class + " disabled type=button class='text-grey-400'>Next</button>";
    } else {
        html += "<button " + enabled_btn_class + " type=button onclick='current_page++; display_results();' class='text-blue-900'>Next</button>";
    }
    html += "</div>"

    html += "<hr class='mb-2 mt-4'/>"

    html += "<div class='mb-2'><a class='text-blue-800 hover:underline' href='#' onclick='display_suggest(); return false;'>Don't see the song you want? <b>Click here!</b></a></div>";


    $("#search_results").html(html)
}

var request_song_id = -1
var request_song_title = ""
var request_song_artist = ""


function select (i) {
    console.log(results[i]);
    request_song_id = results[i].ID
    request_song_title = results[i].title
    request_song_artist = results[i].artist

    var html = "";

    html += "<hr class='mb-2'/>"

    html += "<div class='mb-2'>< <a class='text-blue-800 hover:underline' href='#' onclick='display_results(); return false;'>Back</a></div>";

    html += "<div class='font-bold'>Requesting:</div>"
    html += "<div class='mb-2 text-orange-800' style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;'>" + request_song_artist + " - " + request_song_title + "</div>"
    html += "<div class='mb-2 font-bold'>Tell me:</div>"

    html += "<form id='form_request' type='submit' action='javascript: void(0);'>";
    html += "<input id='who' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Your (Telegram) name'></input>"
    html += "<input id='when' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='When you want to hear it (example: 8pm)'></input>"
    html += "<input id='tz' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Your timezone (example: Pacific)'></input>"

    var enabled_btn_class = "class='bg-blue-500 mt-2 mb-2 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'";
    html += "<button id='request_button' " + enabled_btn_class + " type=button onclick='request_submit();' class='text-blue-900'>Submit Request</button>";

    html += "<div id='submit_status'></div>";

    html += "</form>"


    $("#search_results").html(html)

}

function validate_request () {
    $("#who").removeClass('border-red-800')
    $("#when").removeClass('border-red-800')
    $("#tz").removeClass('border-red-800')
    $("#who").addClass('border-gray-300')
    $("#when").addClass('border-gray-300')
    $("#tz").addClass('border-gray-300')

    var found_error = false;
    if (!$("#who").val()) {
        $("#who").addClass('border-red-800')
        found_error = true;
    }
    if (!$("#when").val()) {
        $("#when").addClass('border-red-800')
        found_error = true;
    }
    if (!$("#tz").val()) {
        $("#tz").addClass('border-red-800')
        found_error = true;
    }

    if (found_error) {
        $("#submit_status").addClass("text-red-700")
        $("#submit_status").text("We need a little more info")
        return false;
    }

    return true
}


function request_submit () {

    var request_name = $("#who").val();
    var request_when = $("#when").val();
    var request_tz = $("#tz").val();
    var msg = request_when + " - " + request_tz;

    console.log("Posting request: ", request_song_id, request_name, msg)

    var data = {
        request_song_id: request_song_id,
        request_name: request_name,
        request_song_artist: request_song_artist,
        request_song_title: request_song_title,
        msg: msg
    }

    if (validate_request()) {
        $("#request_button").prop("disabled", true)
            .removeClass('hover:bg-blue-700')
            .removeClass('bg-blue-500')
            .addClass('bg-slate-300')

        $('#form_request input').css('background-color', '#dddddd');
        $('#form_request input').prop('disabled', 'true');


        $("#submit_status").text("Sending...")
        $.post("https://api2.wikiwoosoaps.com/api/request", data)
            .done(function () {
                $("#submit_status").addClass("text-green-700").addClass('font-bold')
                $("#submit_status").text("Success! We'll do our thing!")
            }).fail(function (response) {
                console.log("Error: ", response)
                $("#submit_status").addClass("text-red-700").addClass('font-bold')
                $("#submit_status").text("Oh no. Something went wrong. If you don't mind, can you send Jon Jon this message in the Sunny Bungalow Chat: '" + response.responseText + "'")
            });
    }


}

function search () {
    var txt = $("#input_search").val();
    //    $("#server_status").text("Searching for: " + txt);
    $.getJSON("https://api2.wikiwoosoaps.com/api/search?q=" + encodeURI(txt), function (data) {
        var status = "Bad"
        console.log(data);
        if (data && data.status) {
            status = data.status;
        }

        if (data && data.results && Array.isArray(data.results) && data.results.length) {

            results = [];
            current_search = txt;
            for (i in data.results) {
                results.push({
                    ID: data.results[i].ID,
                    artist: data.results[i].artist,
                    title: data.results[i].title
                });
            }

            current_page = 0;

            display_results();

        } else {
            $("#search_results").text("No results. Try again!")
        }

        // $("#server_status").text("Checked - Status: " + status);
    });
    console.log("Searching for: " + txt);
}


// Suggest

function display_suggest () {
    var html = "";

    html += "<hr class='mb-2'/>"

    html += "<div class='mb-2'>< <a class='text-blue-800 hover:underline' href='#' onclick='display_results(); return false;'>Back</a></div>";

    html += "<div class='font-bold mb-2 text-orange-800'>Suggest a song to be added!</div>"
    html += "<div class='mb-2 font-bold'>Tell me:</div>"

    html += "<form id='form_suggest' type='submit' action='javascript: void(0);'>";
    html += "<input id='who' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Your (Telegram) name'></input>"
    html += "<input id='artist' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Song Artist/Band'></input>"
    html += "<input id='title' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Song Name'></input>"
    html += "<input id='special' class='w-full border-2 border-gray-300 bg-white h-10 px-5 pr-12 mb-2 rounded-sm text-sm focus:outline-none' class='' placeholder='Special features (live, extended..)'></input>"

    var enabled_btn_class = "class='bg-blue-500 mt-2 mb-2 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'";
    html += "<button id='request_button' " + enabled_btn_class + " type=button onclick='suggest_submit();' class='text-blue-900'>Submit Suggestion</button>";

    html += "<div id='submit_status'></div>";

    html += "</form>"

    $("#search_results").html(html)
}


function validate_suggest () {
    $("#who").removeClass('border-red-800')
    $("#artist").removeClass('border-red-800')
    $("#title").removeClass('border-red-800')
    $("#who").addClass('border-gray-300')
    $("#artist").addClass('border-gray-300')
    $("#title").addClass('border-gray-300')

    var found_error = false;
    if (!$("#who").val()) {
        $("#who").addClass('border-red-800')
        found_error = true;
    }
    if (!$("#artist").val()) {
        $("#artist").addClass('border-red-800')
        found_error = true;
    }
    if (!$("#title").val()) {
        $("#title").addClass('border-red-800')
        found_error = true;
    }

    if (found_error) {
        $("#submit_status").addClass("text-red-700")
        $("#submit_status").text("We need a little more info")
        return false;
    }

    return true
}

function suggest_submit () {

    var request_name = $("#who").val();
    var request_artist = $("#artist").val();
    var request_title = $("#title").val();
    var request_special = $("#special").val();

    console.log("Posting request: ", request_name, request_artist, request_title, request_special)

    var data = {
        request_name: request_name,
        request_artist: request_artist,
        request_title: request_title,
        request_special: request_special
    }

    if (validate_suggest()) {
        $("#request_button").prop("disabled", true)
            .removeClass('hover:bg-blue-700')
            .removeClass('bg-blue-500')
            .addClass('bg-slate-300')
        $('#form_suggest input').css('background-color', '#dddddd');
        $('#form_suggest input').prop('disabled', 'true');

        $("#submit_status").text("Sending...")
        $.post("https://api2.wikiwoosoaps.com/api/suggest", data)
            .done(function () {
                $("#submit_status").addClass("text-green-700").addClass('font-bold')
                $("#submit_status").text("Success! We'll look for it and add it to the library!")
            }).fail(function (response) {
                console.log("Error: ", response)
                $("#submit_status").addClass("text-red-700").addClass('font-bold')
                $("#submit_status").text("Oh no. Something went wrong. If you don't mind, can you send Jon Jon this message in the Sunny Bungalow Chat: '" + response.responseText + "'")
            });
    }


}



function truncate (str, n) {
    return (str.length > n) ? str.slice(0, n - 1).trim() + '…' : str;
};
