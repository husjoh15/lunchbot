var SlackBot = require('slackbots');
var Parse = require('parse/node');

Parse.serverURL = 'https://parseapi.back4app.com';

Parse.initialize(
    'vN7TX86eluj0mrrW6cnBdl87KaXJe6gihnGHRfeV', // This is your Application ID
    'SgBWNm5AHX46MvvZInlBcEzvUaEVn8UwNkikJzef', // This is your Javascript key
    'CpLQoAythtn64XSHl6PQkXEZNIHEvype1pZ7Ey3L' // This is your Master key (never use it in the frontend)
);

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
    if(message.includes(' dagens lunsj')){
        todaysLunch();
    }
    // if(message.includes(' add lunch')){
    //     var time = new Date();
    //     var lunch = 'kålstuing';
    //     addLunch(lunch, getFullDate(time));
    // }
}

function todaysLunch () {
    var paramsLunch = {
        icon_emoji: ':hamburger:'
    }
    var paramsNoLunch = {
        icon_emoji: ':pepehands:'
    }
    var paramsManyLunch = {
        icon_emoji: ':monkas:'
    }

    var date = new Date();
    const Lunchlist = Parse.Object.extend('Lunchlist');
    const query = new Parse.Query(Lunchlist);
    //query.equalTo('lunch', 'pizza');
    query.equalTo('dato', getFullDate(date));
    query.find().then((results) => {
      if (typeof document !== 'undefined') document.write(`Lunchlist found1: ${JSON.stringify(results)}`);
      stringified = JSON.stringify(results);
      parsed = JSON.parse(stringified);
      if (parsed.length === 1)
      {
        lunch = parsed[0].lunch;
        bot.postMessageToChannel('test-lunchbot', 'Dagens lunsj er ```' + lunch + ' ``` ', paramsLunch);
      }
      else if (parsed.length === 0)
      {
        bot.postMessageToChannel('test-lunchbot', 'Det er ikke registrert noen lunsj i dag ', paramsNoLunch);
      }
      else 
      {
        bot.postMessageToChannel('test-lunchbot', 'Det er registrert flere enn 1 lunsj i dag :thinking_face: ', paramsManyLunch);
      }
      
    }, (error) => {
      if (typeof document !== 'undefined') document.write(`Error while fetching Lunchlist: ${JSON.stringify(error)}`);
      console.error('Error while fetching Lunchlist', error);
    });
}



// function addLunch (lunch, date) {
//     var Lunchlist = Parse.Object.extend('Lunchlist');
//     var lunchlist = new Lunchlist();

//     lunchlist.set('lunch', lunch);
//     lunchlist.set('dato', date);

//     lunchlist.save().then(
//     (result) => {
//         if (typeof document !== 'undefined') document.write(`ParseObject created: ${JSON.stringify(result)}`);
//         console.log('ParseObject created', result);
//     },
//     (error) => {
//         if (typeof document !== 'undefined') document.write(`Error while creating ParseObject: ${JSON.stringify(error)}`);
//         console.error('Error while creating ParseObject: ', error);
//     }
//     );
// }

function getFullDate(date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}


bot.on('error', (err) => console.log(err));

