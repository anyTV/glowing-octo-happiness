var slider = {};
var con = 'all';

$(function() {
    $(".sf-menu").superfish();
    slider.featured_games = $("#container-featured-games").bxSlider();
    slider.latest_games = $("#container-latest-games").bxSlider();
    slider.container_videos = $("#container-videos").bxSlider({
      onSlideAfter: load_game_videos_next_page
    });
    $(".tabs").tabslet({ animation: true });
});

page_data = $.parseJSON(page_data);
var hash;

$('#txtbox-search-games').on('keydown', function(e) {
    if (e.keyCode == 13) { filter_game(this); }
});

$('#txtbox-search-videos').on('keydown', function(e) {
    if (e.keyCode == 13) { filter_videos(this); }
});

var filter_game = function(input) {
    var $this = $(input);
    var filterString = $this.val();
    render_featured_games(filterString);
    render_games(filterString);
    slider.latest_games.reloadSlider();
    slider.featured_games.reloadSlider();
};

var filter_videos = function(input) {
    var $this = $(input);
    var filterString = $this.val();
    var game = get_game();
    $.getJSON(server+'games/'+game+'/videos?limit=18&console='+con+'&search='+filterString, function(result) {
        page_data.videos = result;
        render_videos();
        slider.container_videos.reloadSlider();
    });
};

var render_featured_games = function (filter) {
    var html = [];
    var items = [];
    filter =  new RegExp(filter, 'i');

    page_data.featured_games.forEach(function(item, i){
        if(item.name.search(filter) == -1) return;

        item.game = item.name;
        items.push(template($('#gameTpl').html(), item));
        if(items.length == 12) {
            html.push(template($('#gameContainerTpl').html(), {'items' : items.join('')}));
            items = []
        }
    });

    if(items.length != 0) {
        html.push(template($('#gameContainerTpl').html(), {'items' : items.join('')}));
    }

    $('#container-featured-games').html(html.join(''));
}

var render_games = function(filter) {
    var html = [];
    var items = [];
    filter =  new RegExp(filter, 'i');

    page_data.games.forEach(function(item, i){
        if(item.name.search(filter) == -1) return;
        items.push(template($('#gameTpl').html(), item));
        if(items.length == 12) {
            html.push(template($('#gameContainerTpl').html(), {'items' : items.join('')}));
            items = []
        }
    });

    if(items.length != 0) {
        html.push(template($('#gameContainerTpl').html(), {'items' : items.join('')}));
    }

    $('#container-latest-games').html(html.join(''));
};

var render_videos = function() {
    var html = [];
    var items = [];
    var ids = [];
    var tplVideo = $('#videoTpl').html();
    var tplVideoContainer = $('#videoContainerTpl').html();
    page_data.videos.forEach(function (item, i) {
        item.provider = attachments_server;
        item.thumb = item.snippet.thumbnails.medium.url;
        item.title = item.snippet.title;
        item.bust = +new Date();
        item.comments = item.snippet.meta.statistics.commentCount;
        item.views = item.snippet.meta.statistics.viewCount;
        item.link = '/youtuber/'+item.user_id+'#!/video/'+item.snippet.resourceId.videoId;

        items.push(template(tplVideo, item));
        ids.push(item.youtube_id);
        if(items.length == 9) {
            html.push(template(tplVideoContainer, {'items' : items.join('')}));
            items = [];
        }
    });

    if(items.length != 0) {
        html.push(template(tplVideoContainer, {'items' : items.join('')}));
    }

    $('#container-videos').html(html.join(''));
};

var get_hash = function() {
    var hash = window.location.hash.replace('#!/', '');
    hash = hash.split('/');
    return hash;
};

var get_game = function() {
    var game = get_hash()[0];
     return game == '' ? 'all' : game;
}

var render_game_videos = function(game, page) {
    page = typeof page !== 'undefined' ? '&page='+page : ''
    $.getJSON(server+'games/'+game+'/videos?limit=18&console='+con+page, function(result) {
        page_data.videos = result;
        render_videos();
        slider.container_videos.reloadSlider();
    });
};

var load_game_videos_next_page = function() {
    var html = [];
    var items = [];
    var page = Math.floor(slider.container_videos.getSlideCount()/2);
    var nextPage = page+1;
    var tplVideo = $('#videoTpl').html();
    var tplVideoContainer = $('#videoContainerTpl').html();
    var game = get_game();
    var filter = $('#txtbox-search-videos').val();
    $.getJSON(server+'games/'+game+'/videos?limit=18&console='+con+'&page='+nextPage+'&search='+filter, function(result) {
        page_data.videos.concat(result);
        result.forEach(function (item, i) {
            item.provider = attachments_server;
            item.thumb = item.snippet.thumbnails.medium.url;
            item.title = item.snippet.title;
            item.bust = +new Date();
            item.comments = item.snippet.meta.statistics.commentCount;
            item.views = item.snippet.meta.statistics.viewCount;
            item.link = '/youtuber/'+item.user_id+'#!/video/'+item.snippet.resourceId.videoId;

            items.push(template(tplVideo, item));

            if(items.length == 9) {
                html.push(template(tplVideoContainer, {'items' : items.join('')}));
                items = [];
            }
        });

        if(items.length != 0) {
           html.push(template(tplVideoContainer, {'items' : items.join('')}));
        }

        $("#container-videos").append(html.join(''));
        var currentSlide = slider.container_videos.getCurrentSlide();

        slider.container_videos.reloadSlider({
            startSlide: currentSlide,
            onSlideAfter: load_game_videos_next_page
        });
    });
}

var filter_category = function(console) {
    con = console;
    $.getJSON(server+'gamesdata?console='+console, function(results) {
        page_data = results;
        render_page();
    });
};


$(window).on('hashchange', function(){
    hash = get_hash();

    hash = hash.filter(function(item) {
        return item != "";
    });

    if(hash.length) {
        var id = hash.shift();
        $('#game-title').html($('[data-id='+id+']').attr('data-name'));
        render_game_videos(id);
    } else {
        render_videos();
    }
});

var render_page = function() {
    $(window).trigger('hashchange');

    render_games();
    render_featured_games();
};

render_page();