var message = $.QueryString("channel");
var game = $.QueryString("game");
if (message == null)
    game = '';
else
    message = decodeURIComponent(message);
var message2 = "hostname=www.twitch.tv&channel=" + message + "&auto_play=true&start_volume={VOLUME}";  
var message3 =  "http://www.twitch.tv/widgets/live_embed_player.swf?channel=" + message;    
var message4 = "http://twitch.tv/chat/embed?channel=" + message + "&amp;popout_chat=true" 
game = decodeURIComponent(game);
if(game == "null")
    game = "an unspecified game";

$(function() {
    whiteListCheck(game);
    $('#random').click(function (evobj) {
        if ($('#x').is(':checked') == true) {
            blackListRandom();
        } else if($('#filter').val() == ''){
            normalRandom();
        } else {
            whiteListRandom();               
        }
    });

    $('#filter').keypress(function(ev) {
        if(ev.keyCode == 13){
            ev.preventDefault();
            console.log("test");
            whiteListRandom();
        }
    }); 

    $('#filter').autocomplete({
        source: function(request, response) {
             $.ajax({
                dataType: 'jsonp',
                url: 'https://api.twitch.tv/kraken/search/games?q=' + request.term + '&type=suggest&live=true&limit=10',
                success: function (suggest) {
                    ret = []
                    for (var i = 0; i < suggest.games.length; i++) {
                        ret.push(suggest.games[i].name);
                    }
                    response(ret);
                }
            });
        },
        autoFocus: true
    });

    $(document).on('propertychange keyup input paste', 'input.data_field', function(){
        var io = $(this).val().length ? 1 : 0 ;
        $(this).next('.icon_clear').stop().fadeTo(300,io);
    }).on('click', '.icon_clear', function() {
        $(this).delay(300).fadeTo(300,0).prev('input').val('');
    });
    if ($('#filter').val() != "") {
        $('#filter').trigger('propertychange');
    }
    
    if (message != null) {
        videoCreate();
    } else {
        $('#title').html('Click Random Channel to start.');
        $('#newStart').css({
             'color': 'white',
             'height': '100px', 
             'width': '500px'
        });
        $('#newStart').html('Click to view a random Twitch channel!');
        $('#x').prop('checked', true);
    }

    $('#x').hover(function() {
        $('#ignore').delay(300).fadeTo(300, 0.75);
    }).mouseleave(function() {
        $('#ignore').delay(300).fadeTo(300, 0);
    });
    $('#x').change(function() {
        $('#filter').val("");
    });
    $('#filter').change(function() {
        $('#x').prop('checked', false);
    });
});

function normalRandom(){
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.twitch.tv/kraken/streams/summary',
        success: function (summary) {
        var rChannel = Math.random()*summary.channels;
            $.ajax({
                dataType: 'jsonp',
                url: 'https://api.twitch.tv/kraken/streams?limit=1&offset=' + rChannel,
                success: function (streamInfo) {
                    var owner = streamInfo.streams[0].channel.display_name;
                    var game = streamInfo.streams[0].channel.game;
                    console.log(owner, game);
                    window.location.href = 'http://twitch-wildcard.herokuapp.com/index.html?channel=' + owner + '&game=' + game+ "&color=grey";
                }
            });
        }
    });
}

function whiteListRandom() {
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.twitch.tv/kraken/search/streams?limit=100&offset=0&q=' + $('#filter').val(),
        success: function (channelList) {
            var i = Math.floor(Math.random()*channelList.streams.length);
            var owner = channelList.streams[i].channel.display_name;
            var game = channelList.streams[i].channel.game;
            console.log(owner, game);
            window.location.href = 'http://twitch-wildcard.herokuapp.com/index.html?channel=' + owner + '&game=' + game + "&color=white";
        }
    });
}

function blackListRandom() {
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.twitch.tv/kraken/games/top?limit=1',
        success: function (games) {
            var rand = Math.floor(Math.random()*(games._total-10) + 10);
            $.ajax({
                dataType: 'jsonp',
                url: 'https://api.twitch.tv/kraken/games/top?limit=1&offset=' + rand,
                success: function (topremoved) {
                    var rand2 = Math.floor(Math.random()*topremoved.top[0].channels);
                    var name = topremoved.top[0].game.name;
                    console.log(topremoved.top[0].game.name);
                    console.log(rand2);
                    $.ajax({
                        dataType: 'jsonp',
                        url: 'https://api.twitch.tv/kraken/search/streams?limit=1&offset='+ rand2 + '&q=' + name,
                        success: function (channelList) {
                            var owner = channelList.streams[0].channel.display_name;
                            var game = channelList.streams[0].channel.game;
                            window.location.href = 'http://twitch-wildcard.herokuapp.com/index.html?channel=' + owner + '&game=' + game + "&color=black";
                        }
                    });
                }
            });
        }
    });
}
function videoCreate(){
    var videoplayer = document.createElement('object');
    videoplayer.id = 'videoPlayer';
    videoplayer.type = "application/x-shockwave-flash";
    videoplayer.height = "480";
    videoplayer.width = "720";
    videoplayer.data = message3;
    
    var param1 = document.createElement('param');
    param1.name = "allowFullScreen";
    param1.value = "true";
    
    var param2 = document.createElement('param');
    param2.name = "allowScriptAccess";
    param2.value = "always";
   
    var param3 = document.createElement('param');
    param3.name = "allowNetworking";
    param3.value = "all";   

    var param4 = document.createElement('param');
    param4.name = "movie";
    param4.value = "http://www.twitch.tv/widgets/live_embed_player.swf";

    var param5 = document.createElement('param');
    param5.name = "flashvars";
    param5.value = message2;
    
    videoplayer.appendChild(param1);
    videoplayer.appendChild(param2);
    videoplayer.appendChild(param3);
    videoplayer.appendChild(param4);
    videoplayer.appendChild(param5);

    $("#vidDiv").append(videoplayer);
    
    var iframe = document.createElement('iframe');
    iframe.scrolling = 'no';
    iframe.id = 'chat_embed'
    iframe.src = message4;
    iframe.frameborder = '0';
    iframe.height = '480';
    iframe.width = "{WIDTH}";
    $("#vidDiv").append(iframe);
    $('#title').html( "Twitch WildCard drew " + message + " playing " + game);
}

function whiteListCheck(games) {
    if($.QueryString('color') == 'white')
        $('#filter').val(games);    
    else if($.QueryString('color') == 'black')
        $('#x').prop('checked', true);
}
