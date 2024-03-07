const express = require('express');
const path = require('path');

let app = express();
const db = require('./db/db');
const port = 4750;

app.use(express.urlencoded({ extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/helper'));

app.use('/news', express.static(__dirname +'/src/views'));
app.use('/admin', express.static(__dirname +'/src/admin'));


app.set('views',[path.join(__dirname, "src/admin"),path.join(__dirname, "src/views")]);
app.set('view engine','ejs');

const adminController = require('./controllers/admin');
app.use('/admin',adminController);

const newsController = require('./controllers/news');
app.use('/news',newsController);

const chatRoom = require('./controllers/chatRoom')
app.use('/chat',chatRoom);

app.use((req, res, next) => { 
    res.status(404).send( 
        "<h1>Page not found on the server</h1>") 
}) 
const expressServer = app.listen(port,()=>{
    console.log("Server running on port :"+port)
});


app.set('expressServer', expressServer);
