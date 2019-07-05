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

schedule.scheduleJob('30 11 * * *', function(){
    if (posted == false){
        todaysLunch('test-lunchbot');
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
            icon_emoji: 'hypers'
        }
        if (data.user == 'UC1P036RX')
        {
            bot.postMessage(data.channel, "Dagens lunsj er: ```2 Polar brød med smøre ost```", danielEmoji);
        }
        else if (data.user == 'UCLP4J332')
        {
            bot.postMessage(data.channel, "Dagens lunsj er: ```Rislunsj```", akselEmoji);
        }
        else if (data.user == 'U276V7G2F'){
            todaysLunch(data.channel);
            bot.postMessage(data.channel, "Håper ikke du får forstoppelse");
            posted = true;
        }
        else {
            todaysLunch(data.channel);
            posted = true;
        }
        
    } 
    else if(data.user == 'UCLD39CUU' && data.text.includes(' innovation lunch')){
        var messages = 1;
        let startTime = new Date(Date.now());
        let endTime = new Date(startTime.getTime() + 180000);
        var presentation = schedule.scheduleJob({start: startTime, end: endTime, rule: '*/10 * * * * *'}, function(){
            bot.postMessage(data.channel, getSlide(messages) );
            messages++;
            });


            
    }
    else if(data.text.includes(' cola')){
        var emoji = {
            icon_emoji: ':cola:'
        }
        bot.postMessage(data.channel, cola());
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

function getSlide(number){
    switch (number){
        case 1: return 'Slide 1:``` Hei. Jeg heter Lunchbot og har fått noen forbedringer siden forrige gang. ```';
        case 2: return 'Slide 2:``` Før lunsj fikset jeg en bug som gjor at jeg krasjet når noen skrev i en kommentartråd. ```';
        case 3: return 'Slide 3:``` Etter lunsj la jeg til node-schedule, som gjør at jeg kan planlegge å poste noe på en bestemt tid. ```'; 
        case 4: return 'Slide 4:``` Alt node-schedule trenger er: (sekunder(OPTIONAL), minutter, timer, dag i måneden, måned, dag i uken). Det er altså veldig lett å bruke. ```';
        case 5: return 'Slide 5:``` Hvis jeg vil poste noe 11:30 hver dag, er alt jeg trenger å skrive: schedule.scheduleJob("30 11 * * *", function() { // Kode her } ```';
        case 6: return 'Slide 6:``` Hvis dagens lunsj ikke har blitt postet noen plass, poster jeg lunchen i min egen testkanal klokka 11:30. ```';
        case 7: return 'Slide 7:``` Det ser ut til å funke bra, men kommer ikke til #ux-general før etter sommerferien.  ```';
        case 8: return 'Slide 8:``` Har dere hørt om CaptainDuckDuck? Jeg fikk hjelp av Thomas til å bytte kjønn til en and. Så nå lever jeg som en and i sjøen.  ```';
        case 9: return 'Slide 9:``` Jeg har begynt å bytte duckabase til MongoDB, men det er ikke i bruk enda. ```';
        case 10: return 'Slide 10:``` Er det noen som har noen spørsmål? Rekk opp hånda og si navnet ditt høyt nokk for at jeg skal kunne høre deg. ```';
        case 11: return 'Slide 11:``` Hva er ditt spørsmål? ```';
        case 12: return 'Slide 12:``` Nei, tror han ville vært positiv til å bli kvalm uten å tenke igjennom konsekvenser ganske hardt. Untatt ved forstoppelse. Der er jeg for. ```';
        case 13: return 'Slide 13:``` Takk for meg! ```';
        default: return cola();
    }
}

function todaysLunch (channel) {
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
    // var lunches = Lunch.find({name: 'pizza'}).findOne();
    // console.log(lunches.schema.object)
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

