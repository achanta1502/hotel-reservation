const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const port=3000;
const {mongoose} =require('./db/mongoose');
const hbs=require('hbs');
//var popup = require('popups');

const bycrypt=require('bcryptjs');
const session=require('express-session');
const {Hotel}=require('./models/hotel');
const {User}=require('./models/user');
const {Wishlist}=require('./models/wishlist');
var app=express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
hbs.registerPartials(__dirname+'/views/partials');   //to inject repeated tags and data in hbsx
app.set('view engine','hbs');
app.use(express.static(__dirname + '/public'));
hbs.registerHelper('getCurretnYear',()=>{           //to render the values into hbs
  return new Date().getFullYear()
});
//session variables
app.use(session({secret:'abc123',saveUninitialized:false,resave: false}));
app.get('/',(req,resp)=>{
 resp.render('index.hbs');
  });
  app.get('/register',(req,res)=>{
    res.render('register.hbs');
  })
   app.get('/index',(req,resp)=>{
    resp.render('index.hbs');
  });
  app.get('/about',(req,resp)=>{
    resp.render('about.hbs');
  });
  app.get('/booking',(req,resp)=>{
    resp.render('booking.hbs');
  });
  app.get('/contact',(req,resp)=>{
    resp.render('contact.hbs');
  });
  app.get('/home',(req,resp)=>{
    resp.render('home.hbs');
  });

  //to register into portal
 app.post('/register',(req,res)=>{
   var body=_.pick(req.body,['email','password','fname','phone']);
  console.log(body);
   if(!body.email || !body.fname || !body.password || !body.phone){
      res.status(401).render('register.hbs');}
    User.findOne({
      'email':body.email
    },(err,result)=>{
      if(err) throw err;
        //console.log(result.email);
      if(result!=null){
        console.log('already email');
        res.status(200).render('register.hbs',{
          output:'User already registered'
        });
      }else{
               
                let hash = bycrypt.hashSync(body.password, 10);
                
                console.log('password',hash);
                var obj={
                  
                  'email':body.email,
                  'password':hash,
                  'name':body.fname,
                  'phone':body.phone,
                  'status':1
                };
                var user=new User(obj);
                user.save().then(()=>{
                  res.status(200).render('index.hbs');
                })
                // User.insertMany(obj,(err,result)=>{
                //   if(err) throw err;
                //   console.log('successful',result);
                //   res.status(200).render('index.hbs');
                // });         
      }

    });
 });

// to login to the portal
  app.post('/login',(req,res)=>{
   var body=_.pick(req.body,['email','password']);
    User.findOne({'email':body.email},(err,result)=>{
      if(err) throw err;
      if(result==null){
        res.status(401).render('index.hbs',{output:'Email incorrect'});
      }else{
        if(bycrypt.compareSync(body.password,result.password)) {
          console.log('successful');
          req.session.sess_userid=result.user_id;
         Hotel.getHotel((result1)=>{
           res.status(200).render('home.hbs',{obj1:result1});
          });
         
         
         } else {
          res.status(401).render('index.hbs',{output:'password incorrect'});
         }
      }
      
    });
  });
app.get('/hotel',(req,res)=>{
  res.render('hotel.hbs');
  
});
  app.post('/hotel',(req,res)=>{
    var body=_.pick(req.body,['hotel_id','city','address','zipcode','status']);
    var obj={
      'hotel_id':body.hotel_id,
      'city':body.city,
      'address':body.address,
      'zipcode':body.zipcode,
      'status':body.status
    }
    var hotel=new Hotel(obj);
    hotel.save().then(()=>{
        res.status(200).send(obj);
    });
  }); 
app.post('/home',(req,res)=>{
  var body=_.pick(req.body,['check_in','check_out','noOfPersons','hotel_id']);
  app.locals.obj2=body;
  res.status(200).write('<script type="text/javascript">location.href = "search?page=1";</script>');
});
app.get('/search',(req,res)=>{
  var pagenumber=req.query.page;
  app.locals.pagenumber=pagenumber;
  res.render('search.hbs'); 
});
app.post('/search',(req,res)=>{

var hotel_id=app.locals.obj2.hotel_id;
var check_in=app.locals.obj2.check_in;
var check_out=app.locals.obj2.check_out;
var noOfPersons=app.locals.obj2.noOfPersons;
var pagenumber=app.locals.pagenumber;
if(!pagenumber)
    pagenumber=1;
var start=pagenumber*5-5;
var end=pagenumber*5;
var name_filter=""
var name_filter_flag=false;
if(req.body.filter_text!="Hotel name...")  {
  name_filter=req.body.filter_text;
  name_filter_flag=true;
}  
console.log(hotel_id,check_in,check_out,noOfPersons,name_filter,name_filter_flag,pagenumber);
res.send({hotel_id});
});

//add to wishlist
app.get('/wishlist',(req,res)=>{
  var room_id=req.query.room_id;
  var user_id=req.session.sess_userid;
  Wishlist.findOne({room_id:room_id},(err,result)=>{
    
    if(result!=null && result.room_id==room_id){
    var aler="<script type='text/javascript'>alert('Room already exists in your wishlist!');</script>";
    console.log('already exist',result.room_id);
   res.status(200).render('search.hbs',{output:aler});
      
    }else{
      console.log(room_id,user_id);
      var obj={
        'room_id':room_id,
        'user_id':2,
        'check_in':Date.parse(app.locals.obj2.check_in),
        'check_out':Date.parse(app.locals.obj2.check_out),
        'numberOfPeople':Number.parseInt(app.locals.obj2.noOfPersons)
      };
      var wishlist=new Wishlist(obj);
      wishlist.save().then(()=>{
        var aler="<script type='text/javascript'>alert('New room added to wishlist');</script>";
            res.status(200).render('search.hbs',{output:aler});
      }).catch((err)=>{
        console.log(err);
      });
    }
  });
  
});
app.get('/success',(req,res)=>{
  res.send(app.locals.obj2);
})
app.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
    
})