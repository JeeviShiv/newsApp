const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const admin = require('../models/admin');
const news = require('../models/newsfeeds');

const config = require('../config/config');
const {isAuthorized} = require('../helper/tokenvalidation');

const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

router.use(bodyParser.urlencoded({ extended:true }));
router.use(bodyParser.json());

router.get('/profile',(req,res)=>{
    const { auth, decoded } = isAuthorized();
    if(auth){
        admin.findById(decoded.id).then((userData) => {
            if (!userData) {res.redirect('/')};
            res.render('profile', { page: 'profile', 'tokenAuth':auth, user:userData, 'role': decoded.role });
        });
    }
    else{
        res.redirect('/admin/login');
    }
});

router.get('/login',(req,res)=>{
    const { auth, decoded } = isAuthorized();
    if(!auth){
        let message;
        message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
        localStorage.removeItem('message');
        res.render('login',{message, 'tokenAuth':auth,page: 'login', 'role': decoded.role});
    }
    else{
        res.redirect(`/admin/profile`);
    }
});

router.get('/register',(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth){
        res.redirect('/admin/profile');
    }
    else{
        let message;
        message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
        localStorage.removeItem('message');
        res.render('register', { page: 'register', 'tokenAuth':auth, 'role': decoded.role,message});
    }
});
router.post('/addUser',(req,res)=>{
    let hash = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hash;
    admin.create(req.body).then((result)=>{
        localStorage.setItem('message',JSON.stringify({'success':'Registered successfully'}));
        res.redirect('/admin/login');
    }).catch((err)=>{
        if (err) {
            localStorage.setItem('message',JSON.stringify({'danger':'Something went wrong'}));
            res.redirect('/admin/register');
        };
    });
});

router.get('/viewNews/:id',async(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        const newsId = req.params.id;
        const result = await news.findById({_id: newsId});
        res.render('viewNews', { page: 'viewNews', 'tokenAuth':auth, 'role': decoded.role, 'data':result});
    }
    else {
        res.redirect('/admin/login');
    }
});

router.get('/addNews',(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        let message;
        message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
        localStorage.removeItem('message');
        console.log(message);
        res.render('addNews', { page: 'addNews', 'tokenAuth':auth, 'role': decoded.role, 'data':'',message});
    }
    else {
        res.redirect('/admin/login');
    }
});
router.post('/addNews',(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        news.create(req.body).then((result)=>{
            localStorage.setItem('message',JSON.stringify({'success':'News successfully added'}));
            res.redirect('/admin/newsList');
        }).catch((err)=>{
            if (err) {
                localStorage.setItem('message',JSON.stringify({'danger':'Something went wrong'})); 
                res.redirect('/admin/addNews')};
        });
    }
}); 
 
router.get('/updateNews/:id',async(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        const newsId = req.params.id;
        const result = await news.findById({_id: newsId});
        let message;
        message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
        localStorage.removeItem('message');
        res.render('addNews', { page: 'updateNews', 'tokenAuth':auth, 'role': decoded.role, data:result,message});
    }
    else {
        res.redirect('/admin/login');
    }
});
router.post('/updateNews',async(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        const result = await news.findByIdAndUpdate(req.body._id,{$set : req.body},{new: true});
        localStorage.setItem('message',JSON.stringify({'success':'News successfully updated'}));
        res.redirect('/admin/newsList');
    }
});
router.get('/deleteNews/:id',async(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        const result =   await news.deleteOne({ _id: req.params.id});
        if(result.deletedCount==1){
            localStorage.setItem('message',JSON.stringify({'success':'News successfully deleted'}));
            res.redirect('/admin/newsList');
        }
        else{
            localStorage.setItem('message',JSON.stringify({'danger':'Something went wrong'}));
            res.redirect('/admin/newsList');
        }    
    }
});
router.get('/newsList',(req,res)=>{
    const {auth, decoded} = isAuthorized();
    if(auth && decoded.role =='admin'){
        news.find({}).then((results) => {
            let message;
            message = (localStorage.getItem('message')) ? localStorage.getItem('message') :'';
            localStorage.removeItem('message');
            res.render('newslist',{ page: 'newsList', 'tokenAuth':auth, data:results, 'role': decoded.role, message});
        }).catch((err)=>{
            if (err) {res.redirect('/')};
        });
    }else{
        res.redirect('/admin/login');
    }
});

router.post('/loginUser',(req,res)=>{
    admin.findOne({ username: req.body.username}).then((data)=> { 
        if(!data){ 
            localStorage.setItem('message',JSON.stringify({'danger':'Invalid username or password'}));
            res.redirect('/admin/login')
        }else {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                const token = jwt.sign({ id: data._id, role:data.role }, config.secret, {expiresIn: 86400});
                localStorage.setItem('authtoken', token)
                res.redirect(`/admin/profile`);
            } else {
                localStorage.setItem('message',JSON.stringify({'danger':'Invalid username or password'}));
                res.redirect('/admin/login')
            }
        }
        });
});
router.get('/logout', (req,res) => {
    localStorage.removeItem('authtoken');
    res.redirect('/admin/login');
})
module.exports = router;