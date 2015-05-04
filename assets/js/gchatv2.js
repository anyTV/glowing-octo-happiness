/* jshint unused: false */
/* global
    io,
    page_data,
    JST
*/

'use strict';

$.fn.initChatBox = function (chl, usr, sender) {
    var chatUI,
        msgNotify,
        msgChat,
        socket,
        uid, 
        uname, 
        avatar, 
        detail, 
        acode,
        chid, 
        chname,
        dt,
        btnname,
        txtname,
        txtctrl,
        inputctrl,
        gchatdiv,
        ud,
        notify = '',
        msgbox,
        x;

    dt = new Date();
    socket = io.connect('http://52.74.64.71:3000');

    if (typeof chl.id === 'undefined' && typeof chl.title === 'undefined') {
        chid = '1';
        chname = 'Chat Room ' + chid;
    }
    else {
        chid = chl.id;
        chname = chl.title;
    }
    if (typeof (sender) === 'undefined') {
        console.log('I\'m at option 1');
        // console.log(JST['chatui.html']());
        chatUI = JST['chatui.html']().replace(/{cid}/ig, chid);
    }
    else {
        console.log('I\'m at option 2');
        chatUI = JST['chatui.html']().replace(/{cid}/ig, chid).replace(/{ADVERT}/ig, page_data.custom_fields &&
            page_data.custom_fields.advertisement);
    }

    msgNotify = JST['gchatnotify.html']().replace(/{cid}/ig, chid);
    msgChat = JST['chatms.html']().replace(/{cid}/ig, chid);

    if (!jQuery.isEmptyObject(usr) && typeof (usr) !== 'undefined') {
        if (usr.user_id && usr.access_code) {
            uid = usr.user_id;
            uname = usr.username;
            avatar = usr.links.avatar;
            detail = usr.links.detail;
            acode = usr.access_code;
        }
        else {
            uid = dt.getMonth() + '' + dt.getDay() + '' + dt.getFullYear() + '' + dt.getHours() + '' + dt.getMinutes() +
                '' + dt.getSeconds();
            uname = 'Guest' + uid;
            avatar = '/assets/images/gchat-anoni-user.png';
            detail = 'none';
            acode = uid;
        }
    }

    gchatdiv = '#' + this.attr('id');
    btnname = '#btn-' + chid;
    txtname = '#msgs-' + chid;

    $(window).resize(function () {
        $(gchatdiv).css('height', '100% !important');
    });

    $(window).on('user_logged_in', function () {
        location.reload(5);
    });

    $(gchatdiv).on('click', btnname, function () {
        txtctrl = '#msgs-' + chid;
        ud = {
            userid: uid,
            username: uname,
            uavatar: avatar,
            udetail: detail,
            access_code: acode,
            cid: chid,
            cname: chl.title,
            msg: $(txtctrl).val()
        };
        if ($(txtctrl).val().length > 0) {
            socket.emit('send-gm', ud);
            $(txtctrl).val('');
            $(txtctrl).focus();
        }
    });

    $(gchatdiv).on('keypress', txtname, function (evt) {
        if (evt.which === 13) {
            txtctrl = '#msgs-' + chid;
            ud = {
                userid: uid,
                username: uname,
                uavatar: avatar,
                udetail: detail,
                access_code: acode,
                cid: chid,
                cname: chl.title,
                msg: $(txtctrl).val()
            };

            if ($(txtctrl).val().length > 0) {
                socket.emit('send-gm', ud);
                $(txtctrl).val('');
                $(txtctrl).focus();
            }
        }
    });

    socket.on('connect', function () {
        ud = {
            userid: uid,
            username: uname,
            uavatar: avatar,
            udetail: detail,
            access_code: acode,
            cid: chid,
            cname: chl.title
        };
        socket.emit('auth_user', ud);
    });

    socket.on('allow-chat-input', function (sd) {
        if (sd.allow === false) {
            $('#chatinputs-' + sd.cid).css({
                display: 'none',
                zIndex: -1
            });

            $('#notifylogin-' + sd.cid).css({
                display: 'block',
                zIndex: 1
            });
        }
        else {
            $('#chatinputs-' + sd.cid).css({
                display: 'block',
                zIndex: 1
            });
            $('#notifylogin-' + sd.cid).css({
                display: 'none',
                zIndex: -1
            });
        }
    });

    socket.on('update-ui', function (sd) {
        var today = new Date(),
            tinmins,
            timesent,
            elem;

        if (sd.cid === chl.id) {
            if (sd.msgtype === 'notification') {
                msgbox = '#tblchatmsgs-' + sd.cid;
                $(msgbox).append(msgNotify.replace(/{gchat-message}/ig, sd.msg));
            }
            else {

                if (sd.msg.length > 0) {
                    if (today.getMinutes() < 10) {
                        tinmins = '0' + today.getMinutes();
                    }
                    else {
                        tinmins = today.getMinutes();
                    }

                    msgbox = '#tblchatmsgs-' + sd.cid;
                    if (today.getHours() > 11) {
                        timesent = today.getHours() + ':' + tinmins + 'PM';
                    }
                    else {
                        timesent = today.getHours() + ':' + tinmins + 'AM';
                    }


                    $(msgbox).append(msgChat.replace(/{message}/ig, sd.msg).replace(/{username}/ig, sd.user)
                        .replace(/{avatar}/ig, sd.uavatar).replace(/{timesent}/ig, 'Sent on ' +
                            timesent)).linkify({
                        tagName: 'a',
                        target: '_blank',
                        newLine: '\n',
                        linkClass: null,
                        linkAttributes: null
                    });
                }
            }

            x = elem = document.getElementById('chcontainer-' + sd.cid);
            elem.scrollTop = elem.scrollHeight;
        }
    });

    socket.on('createroom', function (user, newchannel) {
        socket.emit('newroom', {
            username: user,
            channel: newchannel
        });
    });

    socket.on('leaveroom', function (user) {
        socket.emit('leaveroom', {
            username: user
        });
    });

    this.append(chatUI);
    return false;
};

var closeAdvert = function () {
    $('#advertisement-container-yt').css('display', 'none').fadeOut('slow');
    $('div .chatinputs_single').removeClass('chatinputs_single').addClass('chatinputs_single_noadvert');
    $('div .chcontainer_single').removeClass('chcontainer_single').addClass('chcontainer_single_noadvert');
};
