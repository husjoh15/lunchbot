var SlackBot = require('slackbots');
var axios = require('axios')

const bot = new SlackBot({
    token: 'xoxb-2556485562-651410196912-pZDt6cziY42gB57P4tRM2UNb',
    name: 'lunchbot'
}); 


bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }

    handelMessage(data.text);
})

function handelMessage(message) {
    if(message.includes(' dagens')){
        todaysLunch();
    }
}

function todaysLunch (){
    var params = {
        icon_emoji: ':hamburger:'
    }

    bot.postMessageToChannel('test-lunchbot', 'Dagens lunsj er ```Kål``` ', params);
}

bot.on('error', (err) => console.log(err));

