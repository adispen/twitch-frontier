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
        createFacebook(message);
        createTwitter(message, game);
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
                    window.location.href = 'http://twitch-frontier.herokuapp.com/index.html?channel=' + owner + '&game=' + game+ "&color=grey";
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
            window.location.href = 'http://twitch-frontier.herokuapp.com/index.html?channel=' + owner + '&game=' + game + "&color=white";
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
                            window.location.href = 'http://twitch-frontier.herokuapp.com/index.html?channel=' + owner + '&game=' + game + "&color=black";
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
    $('#title').html( "Twitch Frontier found " + message + " playing " + game);
}
function createFacebook(message){
    var iframe = document.createElement('iframe');
    iframe.name = 'left';
    iframe.allowTransparency = 'true';
    iframe.frameBorder = '1';
    iframe.scrolling = 'no';
    iframe.height = '25px';
    iframe.width = '106px';
    iframe.src = "http://www.facebook.com/plugins/like.php?href=http://www.twitch.tv/" + message + "&layout=button_count&show_faces=false&width=10&action=like&colorscheme=dark&height=21";
    iframe.style = "display:inline; border:none; overflow:hidden; width:10px; height:21px;";
    $("#fbLike").append(iframe);
}
function createTwitter(message, game){
    var iframe = document.createElement('iframe');
    iframe.name = 'right';
    iframe.id = 'twitter-widget-0';
    iframe.scrolling = 'no';
    iframe.frameBorder = '1';
    iframe.allowtransparency = 'true';
    iframe.src = 'http://platform.twitter.com/widgets/tweet_button.1381275758.html#_=1381628353603&count=horizontal&id=twitter-widget-0&lang=en&original_referer=http%3A%2F%2Fwww.twitch.tv%2Fsaltybet&related=Twitch&size=m&text=Watch%20' + message + ' play ' + game +'!&url=http%3A%2F%2Fwww.twitch.tv%2F' + message;
    iframe.class = 'twitter-share-button twitter-tweet-button twitter-count-horizontal';
    iframe.title = 'Tweet About This Stream!'
    iframe.data = 'true';
    iframe.display = "inline";
    iframe.height = '25px';
    iframe.width = '106px';
    iframe.style = 'display:inline; width: 106px; height: 20px;';
    $("#tweet").append(iframe);
}
function whiteListCheck(games) {
    if($.QueryString('color') == 'white')
        $('#filter').val(games);    
    else if($.QueryString('color') == 'black')
        $('#x').prop('checked', true);
}

// Input is giant bomb id field from twitch's game info json response
function getSimilarGames(gameID) {
    $.ajax({
        dataType: 'jsonp',
        url: 'http://www.giantbomb.com/api/game/' + gameID + '/?api_key=8d728e293dc117083117383a6517eaff526fd50d&format=JSON&similar_games',
        success: function (suggest) {
            similarGames = []
            for (var i = 0; i < suggest.similar_games.length; i++) {
                similarGames.push(suggest.similar_games[i].name);
            }
        response(similarGames);
        }
    });
    var similarGames = document.createElement('iframe');
    similar.scrolling = 'no';
    similar.id = 'similar games';
    similar.src = similarGames;
    similar.frameborder = '0';
    similar.height = '480';
    similar.width = "{WIDTH}";
    

}

function getStores(gameName) {
    
}