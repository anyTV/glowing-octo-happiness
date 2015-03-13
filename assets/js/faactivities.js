'use strict';
var all_events = [];

function get_user_info() {

    var userinfo = $.parseJSON(utilCookie.get('user'));
    var user_id = userinfo.user_id;

    if (user_id === 18) {
        addEventForm();
        get_data();
    }
    else {
        get_data();
    }
}

function addEventForm() {


    var html = [];

    html.push('<div id="add_event_header">Add an Event</div>');
    html.push('<div id="addForm"><form>');
    html.push(
        '<p id="e_title">Title</p> <input type="text" name="event_name" placeholder="Event Title" id="event_name" required>'
    );
    html.push(
        '<p id="e_s_date">Start Date</p> <input type = "date" name = "event_start_date"' +
        'placeholder = "Event Start Date"' +
        'id = "event_start_date" required>'
    );
    html.push(
        '<p id="e_e_date">End Date</p> <input type="date"' +
        'name="event_end_date" placeholder="Event End Date"' +
        ' id="event_end_date" required>'
    );
    html.push(
        '<p id="s_time">Start Time</p> <input type="time"' +
        ' name="event_start_time"' +
        'placeholder="Event Start Time" id="event_start_time" required>'
    );
    html.push(
        '<p id="e_time">End Time</p> <input type="time"' +
        'name="event_end_time"' +
        'placeholder="Event End Time" id="event_end_time" required>'
    );
    html.push('<p id="e_desc">Event Description</p>');

    html.push('<textarea id="event_desc" name="event_desc" placeholder="Event Description"></textarea>');
    html.push('<button onclick="add_event()">ADD EVENT</button>');
    html.push(
        '</form><button onclick="get_events()">' +
        'SHOW EVENTS</button>'
    );

    $('.add_events_form').html(html.join(''));



}


function add_event() {

    $.ajax({

        url: server + 'freedom_events/add',
        type: 'post',
        data: {

            'event_title': $('#event_name').val(),
            'start_date': $('#event_start_date').val(),
            'end_date': $('#event_end_date').val(),
            'start_time': $('#event_start_time').val(),
            'end_time': $('#event_end_time').val(),
            'e_description': $('#event_desc').val()
        }

    }).success(function (data) {
        console.log(data);
        console.log('success');
    }).fail(function (data) {
        console.log(data);
        console.log('Fail');
    });

}

function get_data() {

    $.ajax({
        dataType: 'json',
        url: server + 'freedom_events',
        type: 'get',
        data: {
            'event_title': $('#event_name').val(),
            'start_date': $('#event_start_date').val(),
            'end_date': $('#event_end_date').val(),
            'start_time': $('#event_start_time').val(),
            'end_time': $('#event_end_time').val(),
            'e_description': $('#event_desc').val()
        }
    }).success(function (data) {
        all_events.fetched_data = data;
    }).fail(function (data) {
        console.log(data);
        console.log('failure');
    });
}

function get_events() {


    var html = [];
    html.push('<div id="backButton">' + '<a href="' + origin + 'freedom/#tab-4-1">' +
        '<img src="/assets/images/back_button.png"></a>' + '</div>');

    all_events.fetched_data.forEach(function (item) {
        html.push('<div id="title">' + item.event_title + '</div>');
        html.push('<div id="startDate">' + item.start_date + '</div>');
        html.push('<div id="endDate">' + item.end_date + '</div>');
        html.push('<div id="startTime">' + item.start_time + '</div>');
        html.push('<div id="endTime">' + item.end_time + '</div>');
        html.push('<div id="e-desc">' + item.e_description + '</div>');
        html.push('<div id="join-event">' + '<button onclick="join_event()">JOIN EVENT</buttton>' +
            '</div>');
        html.push('<div id="join-link">' + '<p>ENTER JOIN EVENT LINK</p>' +
            '<input type="text" name="event_link" id="event_link">' + '</div>');
    });

    $('.add_events_form').hide();
    $('#show_events').html(html.join(''));
    $('#editEvent').html('<div id="edit_event">' +
        '<button onclick="update_events()"><img src="/assets/images/pencil.jpg">EDIT EVENT</button>' + '</div>'
    );
}

function delete_events(eventTitle) {




}

function search_events(eventTitle) {

    var search_query = [];

    $.ajax({
        dataType: 'json',
        url: server + 'freedom_events',
        type: 'get',
        data: {
            'event_search': $('#search_event').val(),
        }
    }).success(function (data) {
        all_events.fetched_data.forEach(function (item) {
            if (eventTitle === item.event_title) {
                search_query.push(item.event_title);
            }
        });

    }).fail(function (data) {

    });

    console.log(search_query);
}

function edit_events(eventTitle) {



}


var get_date_diff = function (sched, time) {

    var today = new Date(),
        currdate = today.toJSON().substr(0, 10),
        currtime = today.toTimeString().substr(0, 5),
        result = currdate.localeCompare(sched),
        result2 = currtime.localeCompare(time);

    if (result < 0) {
        return 'Ongoing';
    }
    else if (result === 0) {
        if (result2 <= 0) {
            return 'Ongoing';
        }
        else {
            return 'Ended';
        }
    }
    else {
        return 'Ended';
    }

}


function schedule_template() {

    var html = [],
        eventStatus = '';

    all_events.fetched_data.forEach(function (item) {

        html.push('<div class="activity">');
        html.push('<div class="left">');
        html.push('<div id="startEventDate">' + item.start_date + '</div>' + '<p> - </p>' +
            '<div id="endEventDate">' + item.end_date + '</div>');
        html.push('<div id="startEventTime">' + item.start_time + '</div>' + '<p> - </p>' +
            '<div id="endEventTime">' + item.end_time + '</div>');
        html.push('</div>');
        html.push('<div class="center">');
        html.push('<div id="eventHeader">' + item.event_title + '</div>');
        html.push('</div>');
        html.push('<div class="right">');
        if (get_date_diff(item.end_date, item.end_time) == 'Ongoing') {
            eventStatus = '<div id="eventStatus" style="background:#FFE10E;color:#000">';
          // html.push('<div id="eventStatus" style="background:#FFE10E;color:#000">' + get_date_diff(item.end_date, item.end_time) + '</div>');
        }
        else {
            eventStatus = '<div id="eventStatus" style="background:red;color:#FFF">';
          // html.push('<div id="eventStatus" style="background:red;color:#FFF">' + get_date_diff(item.end_date, item.end_time) + '</div>');
        }
        html.push(eventStatus + get_date_diff(item.end_date, item.end_time) + '</div>');
        html.push('</div>');
        html.push('</div>');
    });

    return html;

}

function get_schedule() {

    var html = [];
    html = schedule_template();

    $('#all_schedule').html(html.join(''));

}

function get_archive() {

    var html = [];
    html = schedule_template();

    $('#archive_schedule').html(html.join(''));

}
