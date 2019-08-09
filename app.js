require('dotenv').config();
var SlackBot = require('slackbots');
var Parse = require('parse/node');
var express = require('express');
var schedule = require('node-schedule');
//var mongoose = require('mongoose');

var app = express();

// mongoose.connect(process.env.MONGO_DB_PATH, {useNewUrlParser: true});
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
// });
// var lunchSchema = new mongoose.Schema({
//     name: String,
//     date: String,
//     posted: String
//   });

// var Lunch = mongoose.model('Lunch', lunchSchema);
// var pizza = new Lunch({name: 'pizza', date: '28/6/2019', posted: false})
// console.log(pizza.name);

// pizza.save(function (err, pizza) {
//     if (err) return console.error(err);
//     console.log(pizza.posted);
//   });



app.get('/', function (req, res) {
    res.send('Hello World');
 })

app.listen(process.env.PORT, '0.0.0.0');

Parse.serverURL = 'https://parseapi.back4app.com';

Parse.initialize(
    'vN7TX86eluj0mrrW6cnBdl87KaXJe6gihnGHRfeV', // This is your Application ID
    'SgBWNm5AHX46MvvZInlBcEzvUaEVn8UwNkikJzef', // This is your Javascript key
    'CpLQoAythtn64XSHl6PQkXEZNIHEvype1pZ7Ey3L' // This is your Master key (never use it in the frontend)
);

const bot = new SlackBot({
    token: process.env.SLACK_OAUTH_ACCESS_TOKEN,
    name: 'lunchbot'
});

var posted = false;

schedule.scheduleJob('30 9 * * *', function(){
    if (posted == false){
        todaysLunch('test-lunchbot', false);
        posted = true;
    }
  });

schedule.scheduleJob('0 0 * * *', function(){
    posted = false;
  });

bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }
    if(data.username !== 'lunchbot' && data.subtype != 'message_replied')
    {
        console.log(data);
        if(data.text.includes("<@UK5C25SSU>"))
        {
            handleMessage(data);
        }
    }


})

function handleMessage(data) {
    if(data.text.includes(' dagens lunsj')) {
        var danielEmoji = {
            icon_emoji: ':party_parrot:'
        }
        var akselEmoji = {
            icon_emoji: ':hypers:'
        }

        if (data.user == 'UC1P036RX')
        {
            bot.postMessage(data.channel, "Dagens lunsj er: ```2 Polarbrød med smøreost```", danielEmoji);
        }
        else if (data.user == 'UCLP4J332')
        {
            bot.postMessage(data.channel, "Dagens lunsj er: ```Rislunsj```", akselEmoji);
        }
        else if (data.user == 'U276V7G2F'){
            todaysLunch(data.channel, true);
        }
        else {
            todaysLunch(data.channel, false);
        }

    }
    else {
        var emoji = {
            icon_emoji: ':robot_face:'
        }
        bot.postMessage(data.channel, 'Jeg er under utvikling og svarer bare på kommandoen `@Lunchbot dagens lunsj`', emoji);
    }
    // if(message.includes(' add lunch')){
    //     var time = new Date();
    //     var lunch = 'kålstuing';
    //     addLunch(lunch, getFullDate(time));
    // }
}

function todaysLunch (channel, geir) {
    var paramsNoLunch = {
        icon_emoji: ':pepehands:'
    }
    var paramsManyLunch = {
        icon_emoji: ':monkas:'
    }

    var date = new Date();
    const Lunchlist = Parse.Object.extend('Lunchlist');
    const query = new Parse.Query(Lunchlist);
    query.equalTo('dato', getFullDate(date));
    query.find().then((results) => {
      if (typeof document !== 'undefined') document.write(`Lunchlist found1: ${JSON.stringify(results)}`);
      stringified = JSON.stringify(results);
      parsed = JSON.parse(stringified);
      if (parsed.length === 1)
      {
        lunch = parsed[0].lunch;
        bot.postMessage(channel, 'Dagens lunsj er: ```' + lunch + ' ``` ', getParams(lunch.toLowerCase()));
        posted = true;
        if (geir)
          bot.postMessage(channel, "Håper ikke du får forstoppelse!"); 
      }
      else if (parsed.length === 0)
      {
        bot.postMessage(channel, 'Det er ikke registrert noen lunsj i dag ', paramsNoLunch);
      }
      else
      {
        bot.postMessage(channel, 'Det er registrert flere enn 1 lunsj i dag :thinking_face: ', paramsManyLunch);
      }

    }, (error) => {
      if (typeof document !== 'undefined') document.write(`Error while fetching Lunchlist: ${JSON.stringify(error)}`);
      console.error('Error while fetching Lunchlist', error);
    });
    //var lunches = Lunch.find({name: 'pizza'}).findOne();
    //console.log(lunches.schema.object)
}

function getParams (lunch) {
    if (lunch.includes('burger'))
        return {icon_emoji: ':hamburger:'}
    else if (lunch.includes('kalkun'))
        return {icon_emoji: ':turkey:'}
    else if (lunch.includes('storfe'))
        return {icon_emoji: ':cut_of_meat:'}
    else if (lunch.includes('potet'))
        return {icon_emoji: ':potato:'}
    else if (lunch.includes('bacon'))
        return {icon_emoji: ':bacon:'}
    else if (lunch.includes('meat'))
        return {icon_emoji: ':cut_of_meat:'}
    else if (lunch.includes('pølse'))
        return {icon_emoji: ':hotdog:'}
    else if (lunch.includes('fries'))
        return {icon_emoji: ':fries:'}
    else if (lunch.includes('kylling'))
        return {icon_emoji: ':chicken:'}
    else if (lunch.includes('chicken'))
        return {icon_emoji: ':chicken:'}
    else if (lunch.includes('pork'))
        return {icon_emoji: ':cut_of_meat:'}
    else if (lunch.includes(' is '))
        return {icon_emoji: ':icecream:'}
    else if (lunch.includes('pommes frites'))
        return {icon_emoji: ':fries:'}
    else if (lunch.includes('pizza'))
        return {icon_emoji: ':pizza:'}
    else if (lunch.includes('innovation lunch'))
        return {icon_emoji: ':bulb:'}
    else if (lunch.includes('gulrot'))
        return {icon_emoji: ':carrot:'}
    else
        return {icon_emoji: ':robot_face:'}
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

function cola() {
    return ':cola::cola::cola::cola::cola:        :cola::cola::cola::cola::cola::cola:     :cola:                                          :cola: \n:cola:                               :cola:                       :cola:     :cola:                                       :cola::cola: \n:cola:                               :cola:                       :cola:     :cola:                                     :cola:    :cola: \n:cola:                               :cola:                       :cola:     :cola:                                   :cola:        :cola: \n:cola:                               :cola:                       :cola:     :cola:                                 :cola:            :cola: \n:cola:                               :cola:                       :cola:     :cola:                               :cola::cola::cola::cola::cola: \n:cola:                               :cola:                       :cola:     :cola:                             :cola:                      :cola: \n:cola:                               :cola:                       :cola:     :cola:                           :cola:                          :cola: \n:cola::cola::cola::cola::cola:        :cola::cola::cola::cola::cola::cola:     :cola::cola::cola::cola::cola:  :cola:                              :cola: ';
}

bot.on('error', (err) => console.log(err));
