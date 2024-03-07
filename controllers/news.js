const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const contact = require('../models/contact');
const newsFeeds = require('../models/newsfeeds');

const LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./scratch');

const iplocate = require("node-iplocate");
const publicIp = require('public-ip');
const request = require('request');

const helper = require('../helper/dateFormat');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

function weatherData(lat,lng){
    const weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lng+"&appid=978ef9994d07bf057a04a4b948ff3239&units=metric&cnt=5";
    var options = {
        url: weatherUrl,
        headers:{ 'User-Agent':'request' }
    }
    return new Promise(function(resolve,reject){
            request.get(options,(err, response, body)=>{
                if(err){reject(err);}
                else{ resolve(body); }
            })
    });
}
async function buildWeatherData(){
    await publicIp.v4().then(ip => {
        iplocate(ip).then(function(results) {
            localStorage.setItem('userlocalCity',results.city);
            localStorage.setItem('userLatitude',results.latitude)
            localStorage.setItem('userLongitude',results.longitude)
       });
    });
    
    const data = await weatherData(localStorage.getItem('userLatitude'),localStorage.getItem('userLongitude'),localStorage.getItem('userlocalCity'));
    localStorage.setItem('weatherData',data);
}

router.get('/index',async(req,res)=>{
    const othersNews = await newsFeeds.find({category: 'sports'}).sort({publishedAt:-1}).limit(3);
    const latestNews = await newsFeeds.find({}).sort({publishedAt:-1}).limit(3);
    const SliderNews = await newsFeeds.find({ category:'banner'}).limit(3);
    await buildWeatherData();
    weatherInformation = JSON.parse(localStorage.getItem('weatherData'));
    res.render('index',{latestNews, SliderNews, othersNews,data:weatherInformation, helper});

});
router.get('/chat',(req, res)=>{
    res.render('chat')
});
router.get('/sports',async(req, res)=>{
    const results = await newsFeeds.find({category: 'sports'}).sort({publishedAt:1}).limit(3);
    res.render('sports', {'sportsNews':results});
});
router.get('/about',(req, res)=>{
    res.render('about')
});
router.get('/contact',(req, res)=>{
    let message;
    message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
    localStorage.removeItem('message');
    res.render('contact',{message})
});
router.get('/feeds/:id',async(req,res)=>{
    const newsId = req.params.id;
    const result = await newsFeeds.findById({_id: newsId});
    res.render('feed', {'news':result});
});

router.post('/contact',(req,res)=>{
    contact.create(req.body).then((result)=>{
        localStorage.setItem('message',JSON.stringify({'success':'Message Sent successfully'}));
        res.redirect('/news/contact');
    }).catch((err)=>{
        if (err) { localStorage.setItem('message',JSON.stringify({'danger':'Something went wrong'}));res.redirect('/news/contact');};
    });
    
});
module.exports = router;