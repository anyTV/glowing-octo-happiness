'use strict';
/*global $,server,console*/

$.get(server + 'freedom_events', function(data) {
    filter_display_events(data);
});

$.ajax({
    dataType: 'jsonp',
    url: server + 'freedom_events/checkAdmin',
    type: 'get'

}).success(function(data) {
    show_html(data);
}).fail(function(data) {});

var show_html = function(data) {

    var html = [];

    $.ajax({
            dataType: 'jsonp',
            url: server + 'logged_user',
            type: 'get'
        })
        .done(function(session) {
            if (session.message === 'Not logged in.') {
                document.getElementById('all_events_form').innerHTML = '';
            } else {
                $.get(server + 'user/' + session.user_id, function(user) {
                    if (user.is_admin === 1) {
                        data.forEach(function(item) {
                            html.push(item);
                        });
                        $('.add_events_form').html(html.join(''));
                    }
                });
            }
        });
};


var get_date_diff = function(sched, time) {
    var today = new Date(),
        currdate = today.toJSON()
        .substr(0, 10),
        currtime = today.toTimeString()
        .substr(0, 5),
        result = currdate.localeCompare(sched),
        result2 = currtime.localeCompare(time);

    if (result < 0) {
        return 'Ongoing';
    } else if (result === 0) {
        if (result2 <= 0) {
            return 'Ongoing';
        } else {
            return 'Ended';
        }
    } else {
        return 'Ended';
    }
};

var show_events = function(data) {

    var html = [];

    data.forEach(function(item) {


        html.push('<div class="activity">');
        html.push('<div class="left">');
        html.push('<div id="startEventDate">' + item.start_date + '</div>' +
            '<p> - </p>' +
            '<div id="endEventDate">' + item.end_date + '</div>');
        html.push('<div id="startEventTime">' + item.start_time + '</div>' +
            '<p> - </p>' +
            '<div id="endEventTime">' + item.end_time + '</div>');
        html.push('</div>');
        html.push('<div class="center">');
        html.push('<div id="eventHeader">' + item.event_title + '</div>');
        html.push('</div>');
        html.push('<div class="right">');
        html.push('<div id="eventStatus">' + get_date_diff(item.end_date, item.end_time) +
            '</div>');
        html.push('</div>');
        html.push('</div>');
    });

    return html;

};


var filter_display_events = function(all_events) {


    all_events.forEach(function(item) {
        if ((get_date_diff(item.end_date, item.end_time) === 'Ongoing') || (get_date_diff(item.end_date,
                item.end_time) === 'Ended')) {
            var html_content_sched = show_events(all_events);
            $('#all_schedule')
                .html(html_content_sched.join(''));
        }
    });
    all_events.forEach(function(item) {
        if (get_date_diff(item.end_date, item.end_time) === 'Ended') {
            var html_content_archive = show_events(all_events);
            $('#archive_schedule')
                .html(html_content_archive.join(''));
        }
    });


};

var search_events = function(event_title) {
    $.get(server + 'freedom_events/search' + event_title, function(data) {
        return data;
    });
};

$('#seachEvent').on('click', function() {
    var event_title = $('#search_input').val(),
        search_result = search_events(event_title);
});


var add_event = function() {
    $.ajax({
        url: server + 'freedom_events/add',
        type: 'post',
        data: {
            'event_title': $('#event_name')
                .val(),
            'start_date': $('#event_start_date')
                .val(),
            'end_date': $('#event_end_date')
                .val(),
            'start_time': $('#event_start_time')
                .val(),
            'end_time': $('#event_end_time')
                .val(),
            'e_description': $('#event_desc')
                .val()
        }
    });
};

$('#event_form').submit(function(event) {
    event.preventDefault();
});
