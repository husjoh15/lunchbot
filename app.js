require('dotenv').config();
var SlackBot = require('slackbots');
var express = require('express');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
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

var weeklyMenu = "";
var url = 'https://k6.retailsolution.no/meny';

app.get('/', function (req, res) {
    res.send('Hello World');
 })

app.listen(process.env.PORT, '0.0.0.0');

const bot = new SlackBot({
    token: process.env.SLACK_OAUTH_ACCESS_TOKEN,
    name: 'lunchbot'
});

function getWeeklyMenu()
{
    var req = new XMLHttpRequest();

    req.open('GET', url, false);
    req.send(null);

    if(req.status == 200) {
        return formatResponseText(req.responseText);
    }
    return "";
}

function getDailyMenu(){
    getWeeklyMenu();
    var time = new Date();
    if (time.getDay() === 1)
        return getMondayMenu();
    if (time.getDay() === 2)
        return getTuesdayMenu();
    if (time.getDay() === 3)
        return getWednesdayMenu();
    if (time.getDay() === 4)
        return getThursdayMenu();
    if (time.getDay() === 5)
        return getFridayMenu();
}

function getMondayMenu(){
    var menu = weeklyMenu.split(/Mandag:*/g)[1];
    var menu1 = menu.split(/Tirsdag:*/g)[0].replace('*','').replace('*','');
    return menu1;
}
function getTuesdayMenu(){
    var menu = weeklyMenu.split(/Tirsdag:*/g)[1];
    var menu1 = menu.split(/Onsdag:*/g)[0].replace('*','').replace('*','');
    return menu1;
}
function getWednesdayMenu(){
    var menu = weeklyMenu.split(/Onsdag:*/g)[1];
    var menu1 = menu.split(/Torsdag:*/g)[0].replace('*','').replace('*','');
    return menu1;
}
function getThursdayMenu(){
    var menu = weeklyMenu.split(/Torsdag:*/g)[1];
    var menu1 = menu.split(/Fredag:*/g)[0].replace('*','').replace('*','');
    return menu1;
}
function getFridayMenu(){
    var menu = weeklyMenu.split(/Fredag:*/g)[1].replace('*','');
    return menu;
}

function formatResponseText(responseText){
    var changed = responseText.replace(/<[^>]*>?/gm, '');
    var weeklyMenuGibberish = changed.match("Uke (.*)Dagens");
    var weeklyRemoveGibberish = weeklyMenuGibberish[0].replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
    weeklyMenu = weeklyRemoveGibberish.replace(/Mandag:/g, '\n *Mandag:* \n')
    .replace(/Tirsdag:/g, '\n\n *Tirsdag*: \n')
    .replace(/Onsdag:/g, '\n\n *Onsdag:* \n')
    .replace(/Torsdag:/g, '\n\n *Torsdag:* \n')
    .replace(/Fredag:/g, '\n\n *Fredag:* \n')
    .replace(/Hoved:/g, '_Hoved:_ \n')
    .replace(/Vegetarisk:/g, '\n _Vegetarisk:_ \n')
    .replace(/Suppe:/g, '\n _Suppe:_ \n');
    return weeklyMenu;
}

bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }
    if(data.username !== 'lunchbot' && data.subtype != 'message_replied' && data.subtype !== 'message_changed')
    {
        console.log(data);
        if(data.text.includes("<@UK5C25SSU>"))
        {
            handleMessage(data);
        }
    }


})

function handleMessage(data) {
    if(data.text.toLowerCase().includes(' ukens')){
        bot.postMessage(data.channel, getWeeklyMenu(), emoji);
    }
    else if(data.text.toLowerCase().includes(' dagens')){
        bot.postMessage(data.channel, getDailyMenu(), emoji);
    }
    else if (data.text.toLowerCase().includes('cola')){
        bot.postMessage(data.channel, cola(), emoji);
    }
    else {
        var emoji = {
            icon_emoji: ':robot_face:'
        }
        bot.postMessage(data.channel, 'Jeg svarer bare på følgende kommandoer: \n `Dagens` Dagens meny \n `Ukens` Ukens meny \n `Cola` Cola', emoji);
    }
}

function cola() {
    return ':cola::cola::cola::cola::cola:        :cola::cola::cola::cola::cola::cola:     :cola:                                          :cola: \n:cola:                               :cola:                       :cola:     :cola:                                       :cola::cola: \n:cola:                               :cola:                       :cola:     :cola:                                     :cola:    :cola: \n:cola:                               :cola:                       :cola:     :cola:                                   :cola:        :cola: \n:cola:                               :cola:                       :cola:     :cola:                                 :cola:            :cola: \n:cola:                               :cola:                       :cola:     :cola:                               :cola::cola::cola::cola::cola: \n:cola:                               :cola:                       :cola:     :cola:                             :cola:                      :cola: \n:cola:                               :cola:                       :cola:     :cola:                           :cola:                          :cola: \n:cola::cola::cola::cola::cola:        :cola::cola::cola::cola::cola::cola:     :cola::cola::cola::cola::cola:  :cola:                              :cola: ';
}

bot.on('error', (err) => console.log(err));
