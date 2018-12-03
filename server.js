const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const port=3000;
const {mongoose} =require('./db/mongoose');
const hbs=require('hbs');
const fs=require('fs');
const multer=require('multer');
var dateFormat=require('dateformat');
//var popup = require('popups');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const bycrypt=require('bcryptjs');
const session=require('express-session');
const {Hotel}=require('./models/hotel');
const {User}=require('./models/user');
const {Room}=require('./models/room');
const {Booking}=require('./models/booking');
const {Search}=require('./models/search');
const {Wishlist}=require('./models/wishlist');
const {Feature}=require('./models/feature');
const date=require('date-and-time');
var MomentHandler = require("handlebars.moment");
var helpers=require('handlebars-helpers');
var math=helpers.math();
var app=express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
hbs.registerPartials(__dirname+'/views/partials');   //to inject repeated tags and data in hbsx
hbs.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 1; i <= n; ++i)
      accum += block.fn(i);
  return accum;
});
hbs.registerHelper( 'random', function(max) {
  var max=parseInt(max);
  var rand=Math.random();
  var final=Math.floor((rand*100)/10);
  return max+final+1;
});
hbs.registerHelper( 'rating', function(id) {
  var max=parseInt(id);
  var final=max%5;
  return final;
});
MomentHandler.registerHelpers(hbs);
app.set('view engine','hbs');
app.use(express.static(__dirname + '/public'));
// app.use((req, res, next)=>{
//   var now=new Date().toString();
//   var log=`${now}:${req.method} ${req.url}`;
// console.log(log);
// fs.appendFile('server.log',log+'\n',(err)=>{
//   if(err){
//     console.log('Unable to append to server.log');
//   }
// })
//   next();
// });
const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null, './uploads/');
  },
  filename:function(req,file,cb){
    cb(null,Date.now()+file.originalname);
  }
});
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}
const upload=multer({storage,limits:{
  fileSize:1024*1024*5
},fileFilter:fileFilter});
hbs.registerHelper('getCurretnYear',()=>{           //to render the values into hbs
  return new Date().getFullYear()
});
//session variables
app.use(express.static(__dirname + '/uploads'));
app.use(session({secret:'abc123',saveUninitialized:false,resave: false}));

//homepage
app.get('/',(req,resp)=>{
  if(req.session.sess_userid!=null){
    var admin=0;
    if(req.session.sess_userid==1){
      admin=1;
    }
    Hotel.getHotel((result1)=>{
      resp.status(200).render('home.hbs',{obj1:result1,'name':req.session.sess_name,admin});
     });
  }else{
    resp.render('index.hbs');
  }
  });
 
  app.get('/addCity',(req,res)=>{
    res.status(200).render('addCity.hbs');
  });
  app.post('/email',(req,res)=>{
    var email=Object.keys(req.body).pop();
    var valid;
    User.findOne({'email':email},(err,doc)=>{
      if(doc!=null){
        valid=true;
      }else{
        valid=false;
      }
      res.send(valid);
    });
   
  });
  app.get('updateCity',(req,res)=>{
    res.render('updateCity.hbs');
  })
  app.get('/register',(req,res)=>{
    res.render('register.hbs');
  })
   app.get('/index',(req,resp)=>{
    if(req.session.sess_userid!=null){
      var admin=0;
      if(req.session.sess_userid==1){
        admin=1;
      }
      Hotel.getHotel((result1)=>{
        var min=dateFormat(new Date(), "yyyy-mm-dd");
        
        resp.status(200).render('home.hbs',{obj1:result1,'name':req.session.sess_name,admin,'min':min});
       });
    }else{
      resp.render('index.hbs');
    }
  });
  app.get('/about',(req,resp)=>{
    resp.render('about.hbs');
  });

  app.get('/contact',(req,resp)=>{
    resp.render('contact.hbs');
  });
  app.get('/home',(req,resp)=>{
    var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
    resp.render('home.hbs',{name,admin});
  });

  //to register into portal
 app.post('/register',(req,res)=>{
   var body=_.pick(req.body,['email','password','fname','phone']);
  
   if(!body.email || !body.fname || !body.password || !body.phone){
      res.status(401).render('register.hbs');}
      else{
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
               User.findOne({},(err,result1)=>{
                 if(err) throw err;
                 var user_id;
                 if(result1==null){
                   user_id=1;
                 }else{
                  user_id=result1.user_id+1;
                 }
                let hash = bycrypt.hashSync(body.password, 10);
                
                
                var obj={
                  'user_id':user_id,
                  'email':body.email,
                  'password':hash,
                  'name':body.fname,
                  'phone':body.phone,
                  'status':1
                };
                var user=new User(obj);
                user.save().then(()=>{
                  res.status(200).render('index.hbs');
                });
               }).sort({'user_id':-1})
                
                // User.insertMany(obj,(err,result)=>{
                //   if(err) throw err;
                //   console.log('successful',result);
                //   res.status(200).render('index.hbs');
                // });         
      }

    });
  }
 });

// to login to the portal
  app.post('/login',(req,res)=>{
   var body=_.pick(req.body,['email','password']);
    User.findOne({'email':body.email},(err,result)=>{
      if(err) throw err;
      if(result==null){
        var aler=1;
        res.status(401).render('index.hbs',{aler});
      }else{
        if(bycrypt.compareSync(body.password,result.password)) {
          
          req.session.sess_userid=result.user_id;
          req.session.sess_name=result.name;
          var admin=0;
          if(result.user_id==1){
            admin=1;
          }
         Hotel.getHotel((result1)=>{
          var min=dateFormat(new Date(), "yyyy-mm-dd");
           res.status(200).render('home.hbs',{obj1:result1,'name':result.name,admin,'min':min});
          });
                
         } else {
          var aler=1;
          res.status(401).render('index.hbs',{aler});
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

  //main home page
app.post('/home',(req,res)=>{
  var body=_.pick(req.body,['check_in','check_out','noOfPersons','hotel_id']);
  app.locals.obj2=body;
  res.status(200).write('<script type="text/javascript">location.href = "search?page=1";</script>');
});

//search page get request
app.get('/search',(req,res)=>{
var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var pagenumber=req.query.page;
  var feature_id=req.query.feature;
  var hotel_id=app.locals.obj2.hotel_id;
  app.locals.feature_id=feature_id;
  app.locals.pagenumber=pagenumber;
var check_in=app.locals.obj2.check_in;
var check_out=app.locals.obj2.check_out;
var occupancy=app.locals.obj2.noOfPersons;
var start=pagenumber*5-5;
var end=pagenumber*5;
var skip=start;
var limit=end-start;
var pageCount;
if(feature_id){
  if(feature_id>0){
  Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},'booking_id':{$gt:0}},(err,doc)=>{
    if(err) throw err;
    
    if(doc.length>0){
      Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
      
      Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
       
        pageCount=Math.ceil(result1.length/5);
           res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,'feature':feature_id,name,admin});
         
          
      }).skip(skip).limit(limit);
    });
    }
    if(doc.length==0){
      console.log('enter equal length');
      Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
      
      Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
      console.log(result);
         pageCount=Math.ceil(result1.length/5);
            res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,'feature':feature_id,name,admin});   
       }).skip(skip).limit(limit);
      });
      }
});
  }else{
    Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},'booking_id':{$gt:0}},(err,doc)=>{
      if(err) throw err;
      if(doc.length>0){
        console.log('enter greater length');
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
         
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
         
          pageCount=Math.ceil(result1.length/5);
             res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,'feature':feature_id,name,admin});
           
            
        }).skip(skip).limit(limit);
      });
      }
      if(doc.length==0){
        console.log('enter equal length');
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
        
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
        console.log(result);
           pageCount=Math.ceil(result1.length/5);
              res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,'feature':feature_id,name,admin});   
         }).skip(skip).limit(limit);
        });
        }
  });
  }
}
  else{
  Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},'booking_id':{$gt:0}},(err,doc)=>{
    if(err) throw err;
    console.log('entered this page');
    if(doc.length>0){
      console.log('entered to doc.length');
      Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
     
      Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
     console.log(result);
        pageCount=Math.ceil(result.length/5);
           res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});
         
          
      }).skip(skip).limit(limit);
    });

    }
    else{
      Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
      Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
      console.log('result',result);
         pageCount=Math.ceil(result1.length/5);
            res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});   
       }).skip(skip).limit(limit);
      });
      }
});
}
  
});
app.post('/search',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
var feature_id=req.query.feature;
var feature_id=app.locals.feature_id;
var hotel_id=app.locals.obj2.hotel_id;
var check_in=app.locals.obj2.check_in;
var check_out=app.locals.obj2.check_out;
var occupancy=app.locals.obj2.noOfPersons;
var pagenumber=req.query.page;
var pagenumber=app.locals.pagenumber;
if(!pagenumber)
    pagenumber=1;
    var start=pagenumber*5-5;
    var end=pagenumber*5;
    var skip=start;
    var limit=end-start;
    var pageCount;
var name_filter=""
var name_filter_flag=false;
if(req.body.filter_text!="Hotel type...")  {
  name_filter=req.body.filter_text;
  name_filter_flag=true;
}  
var limit=end-start;

if(name_filter_flag && !feature_id){
 
  Search.find({'room_type':name_filter,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},'booking_id':{$gt:0}},(err,doc)=>{
    if(err) throw err;
    
    if(doc.length>0){
      Search.find({'room_type':name_filter,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
       
      Search.find({'room_type':name_filter,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
        
        pageCount=Math.ceil(result1.length/5);
           res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});
         
          
      }).skip(skip).limit(limit);
    });

    }
    if(doc.length==0){
      Search.find({'room_type':name_filter,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
      
      Search.find({'room_type':name_filter,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
      
         pageCount=Math.ceil(result1.length/5);
            res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});   
       }).skip(skip).limit(limit);
      });
      }
});


}
else if(name_filter_flag && feature_id){
  
  Search.find({'room_type':name_filter,'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},'booking_id':{$gt:0}},(err,doc)=>{
    if(err) throw err;
    
    if(doc.length>0){
      console.log(new Date(check_in),new Date(check_out));
      Search.find({'room_type':name_filter,'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
      
      Search.find({'room_type':name_filter,'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
        
        pageCount=Math.ceil(result1.length/5);
           res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});
         
          
      }).skip(skip).limit(limit);
    });
    }
    if(doc.length==0){
      Search.find({'room_type':name_filter,'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
      
      Search.find({'room_type':name_filter,'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
      
         pageCount=Math.ceil(result1.length/5);
            res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});   
       }).skip(skip).limit(limit);
      });
      }
});
}else if(!name_filter_flag){
  if(!feature_id){
 
    Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},'booking_id':{$gt:0}},(err,doc)=>{
      if(err) throw err;
      
      if(doc.length>0){
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
        
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
          
          pageCount=Math.ceil(result1.length/5);
             res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});
           
            
        }).skip(skip).limit(limit);
      });
  
      }
      if(doc.length==0){
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
        
        Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
        
           pageCount=Math.ceil(result1.length/5);
              res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});   
         }).skip(skip).limit(limit);
        });
        }
  });
  
  
  }
  else if(feature_id){
    
    Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},'booking_id':{$gt:0}},(err,doc)=>{
      if(err) throw err;
      
      if(doc.length>0){
        console.log(new Date(check_in),new Date(check_out));
        Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result1)=>{
         
        Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:occupancy},$and:[{$or:[{'check_in':{$gt:new Date(check_in)}},{'check_out':{$lt:new Date(check_in)}}]},{$or:[{'check_in':{$gt:new Date(check_out)}},{'check_out':{$lt:new Date(check_out)}}]}]},(err,result)=>{
          
          pageCount=Math.ceil(result1.length/5);
             res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});
           
            
        }).skip(skip).limit(limit);
      });
  
      }
      if(doc.length==0){
        Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result1)=>{
        
        Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)}},(err,result)=>{
        
           pageCount=Math.ceil(result1.length/5);
              res.render('search.hbs',{output:result,len:result.length,prevPage:parseInt(pagenumber)-1,nextPage:parseInt(pagenumber)+1,pageCount,name,admin});   
         }).skip(skip).limit(limit);
        });
        }
  });

}
}
});

//add to wishlist
app.get('/wishlist',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var room_id=req.query.room_id;
  var user_id=req.session.sess_userid;

  Wishlist.findOne({room_id:room_id,user_id:user_id},(err,result)=>{
    
    if(result!=null && result.room_id==room_id){
    var aler="<script type='text/javascript'>alert('Room already exists in your wishlist!');window.location.href='/search?page=1'</script>";
   res.status(200).render('search.hbs',{aler:aler,name,admin});
      
    }else{
      console.log(room_id,user_id);
      Wishlist.findOne({},(err,doc)=>{
        var wishlist_id;
        if(doc==null){
          wishlist_id=1;
        }else{
          wishlist_id=doc.wishlist_id+1;
        }
        Room.findOne({'room_id':room_id},(err,roomdoc)=>{ 
          var obj={
          'wishlist_id':wishlist_id,
          'room_id':room_id,
          'user_id':user_id,
          'check_in':Date.parse(app.locals.obj2.check_in),
          'check_out':Date.parse(app.locals.obj2.check_out),
          'numberOfPeople':Number.parseInt(app.locals.obj2.noOfPersons),
          'room_type':roomdoc.room_type,
          'image_url':roomdoc.image_url,
          'status':roomdoc.status,
          "price":roomdoc.price,
          'room_desc':roomdoc.room_desc
        };
        var wishlist=new Wishlist(obj);
        wishlist.save().then(()=>{
          var aler="<script type='text/javascript'>alert('New room added to wishlist');window.location.href='/search?page=1'</script>";
              res.status(200).render('search.hbs',{aler:aler,name,admin});
        }).catch((err)=>{
          console.log(err);
        });
      });
       
        
       
      }).sort({'wishlist_id':-1})
     
     
    }
  });
  
});

app.get('/single',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var room_id=req.query.room_id;
  var src=req.query.src;
  var wishlist_id=req.query.wishlist_id;
    if(src=='search' && room_id!=null){
    Search.findOne({'room_id':room_id,'status':1,},(err,docs)=>{    
      var room_type=docs.room_type;
      var max_occupancy=docs.max_occupancy;
      var check_in=app.locals.obj2.check_in;
      var check_out=app.locals.obj2.check_out;
      var image_url=docs.image_url;
      var feature_name=docs.feature_name;
      var costcount=Math.abs(Date.parse(check_in)-Date.parse(check_out))/86400000;
      var price=costcount*parseInt(docs.price);
      var serviceCharge=Math.round(price*0.15);
      var amountFinal=price+serviceCharge;
      res.render('single.hbs',{room_id,room_type,max_occupancy,check_in,check_out,image_url,feature_name,price,serviceCharge,amountFinal,len:1,name,admin});
    });
  }
    if(src=='wishlist' && wishlist_id!=null){
      var flag=0;
      Wishlist.findOne({'wishlist_id':wishlist_id},(err,doc)=>{
        if(err) throw err;
        // console.log(doc);
        var room_id=doc.room_id;
        var noOfPersons=doc.numberOfPeople;
        var check_in=doc.check_in; 
        check_in=date.addDays(check_in,1);
        check_in=dateFormat(check_in,"yyyy-mm-dd");    
        var check_out=doc.check_out;
        check_out=date.addDays(check_out,1);
        check_out=dateFormat(check_out,"yyyy-mm-dd");  
        var price=doc.price;
        Search.findOne({'room_id':room_id,'status':1},(err,result)=>{
          if(err) throw err;
          if(result!=null){
            flag=1;
            var max_occupancy=result.max_occupancy;
            var room_type=result.room_type;        
            var image_url=result.image_url;
            var feature_name=result.feature_name;
            var costcount=Math.abs(Date.parse(check_in)-Date.parse(check_out))/86400000;
            price=costcount*parseInt(price);
            var serviceCharge=Math.round(price*0.15);
            var amountFinal=price+serviceCharge;
           
           //console.log(checkin);
            res.render('single.hbs',{room_id,room_type,max_occupancy,noOfPersons,check_in,check_out,image_url,feature_name,price,serviceCharge,amountFinal,len:0,flag,name,admin});
          }
        });
      });
    }
  
});

app.post('/single',(req,res)=>{
var src=req.query.src;
var amount_paid=req.body.amountPaid;
var user_id=req.session.sess_userid;
var wishlist_id=req.query.wishlist_id;
if(src=='wishlist'){
var room_id=req.body.roomId;
var check_in=req.body.check_in;
var check_out=req.body.check_out;
var noOfPersons=req.body.noOfPersons;
Room.find({'room_id':room_id,'max_occupancy':{$gte:noOfPersons}},(err,docs)=>{
  Booking.findOne({'room_id':room_id,$or:[{$and:[{'check_in':{$lte:new Date(check_in)}},{'check_out':{$gte:new Date(check_in)}}]},{$and:[{'check_in':{$lte:new Date(check_out)}},{'check_out':{$gte:new Date(check_out)}}]}]},(err,doc1)=>{

    if(doc1==null){
      Booking.findOne({},(err,doc)=>{
        var booking_id;
        if(doc==null){
          booking_id=1;
        }else{
          booking_id=doc.booking_id+1;
        }
        
        var obj={
          booking_id,
          user_id,
          room_id,
          amount_paid,
          check_in,
          check_out,
          'status':1
        };
        var booking=new Booking(obj);
        booking.save().then(()=>{
          Search.findOne({'room_id':room_id},(err,doc3)=>{
            if(doc3.booking_id==0){
       
          Search.findOneAndUpdate({'room_id':room_id},{$set:{'booking_id':booking_id,'user_id':user_id,'check_in':check_in,'check_out':check_out,'amount_paid':amount_paid}},(err,doc2)=>{
            Wishlist.findOneAndDelete({'wishlist_id':wishlist_id},(err,result1)=>{
              res.redirect('/bookings?page=1');
            });
          });
        }else{
   
          var obj3={
              'room_id':doc3.room_id,
              'feature_id':doc3.feature_id,
              'feature_name':doc3.feature_name,
              'hotel_id':doc3.hotel_id,
              'room_type':doc3.room_type,
              'image_url':doc3.image_url,
              'price':doc3.price,
              'room_desc':doc3.room_desc,
              'status':1,
              'booking_id':booking_id,
              'user_id':user_id,
              'check_in':check_in,
              'check_out':check_out,
              'amount_paid':amount_paid
          };
          var search=new Search(obj3);
          search.save().then(()=>{
            Wishlist.findOneAndDelete({'wishlist_id':wishlist_id},(err,result1)=>{
              res.redirect('/bookings?page=1');
            });
          });
        }
        });
         
        });
      }).sort({'booking_id':-1});
    }else{
      //res.write("<script type='text/javascript'>window.location='/single?wishlist='"+wishlist_id+"'&src=wishlist';</script>");
        var check_in=req.body.check_in;
        var check_out=req.body.check_out;
        var noOfPersons=req.body.noOfPersons;
        Search.findOne({'room_id':room_id,'status':1},(err,result)=>{
        var max_occupancy=result.max_occupancy;
        var room_type=result.room_type;        
        var image_url=result.image_url;
        var feature_name=result.feature_name;
        var costcount=Math.abs(Date.parse(check_in)-Date.parse(check_out))/86400000;
        var price=costcount*parseInt(req.body.amountPaid);
        var serviceCharge=Math.round(price*0.15);
        var amountFinal=price+serviceCharge;
        var aler = "<script type='text/javascript'>alert('try different dates');</script>"
        var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
      var room_id=req.body.roomId;
      console.log(room_id);
      var flag=1;
       //console.log(checkin);
        res.render('single.hbs',{room_id,room_type,max_occupancy,noOfPersons,check_in,check_out,image_url,feature_name,price,serviceCharge,amountFinal,len:0,flag,name,admin,aler});
      
      });

    }
  }
)
});
}
if(src=='search'){
  var room_id=req.query.room_id;
  Booking.findOne({},(err,doc)=>{
    var booking_id;
    if(doc==null){
      booking_id=1;
    }else{
      booking_id=doc.booking_id+1;
    }
    
    var check_in=app.locals.obj2.check_in;
    var check_out=app.locals.obj2.check_out;
    var obj={
      booking_id,
      user_id,
      room_id,
      amount_paid,
      check_in,
      check_out,
      'status':1
    };
    var booking=new Booking(obj);
    booking.save().then(()=>{
      // Search.findOneAndUpdate({'room_id':room_id},{$set:{'booking_id':booking_id,'user_id':user_id,'check_in':check_in,'check_out':check_out,'amount_paid':amount_paid}},(err,doc2)=>{
      //   res.redirect('/bookings?page=1');
      //});  
      Search.findOne({'room_id':room_id},(err,doc3)=>{
        if(doc3.booking_id==0){
          Search.findOneAndUpdate({'room_id':room_id},{$set:{'booking_id':booking_id,'user_id':user_id,'check_in':check_in,'check_out':check_out,'amount_paid':amount_paid}},(err,doc5)=>{
              res.redirect('/bookings?page=1');
          });
        }else{
          var obj3={
            'room_id':doc3.room_id,
            'feature_id':doc3.feature_id,
            'feature_name':doc3.feature_name,
            'hotel_id':doc3.hotel_id,
            'room_type':doc3.room_type,
            'image_url':doc3.image_url,
            'price':doc3.price,
            'room_desc':doc3.room_desc,
            'status':1,
            'booking_id':booking_id,
            'user_id':user_id,
            'check_in':check_in,
            'check_out':check_out,
            'amount_paid':amount_paid
        };
        var search=new Search(obj3);
        search.save().then(()=>{
          res.redirect('/bookings?page=1');
        });
        }
      })
    });
  }).sort({'booking_id':-1});
}
});
app.get('/bookings',(req,res)=>{
  var user_id=req.session.sess_userid;
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  if(user_id!=null){
  Search.find({'user_id':user_id},(err,docs)=>{
    var pages=1;
    if(docs.length>2){
pages=Math.ceil(docs.length/2);
    }
    var offset=(pages-1)*2;
    var start=offset+1;
    var end=Math.min(offset+2,docs.length);
    res.render('booking.hbs',{docs,name,admin});
  });}  
  else{
    res.render('index.hbs');
  }
});


//admin pages go down from heres
app.get('/wishlists',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var pagenumber=parseInt(req.query.page);
var start=pagenumber*2-2;
var end=pagenumber*2;
var skip=start;
var limit=end-start;
var pageCount;
  var room_delete=req.query.delete;
  var room_id=req.query.room_id;
  var user_id=req.session.sess_userid;
  if(room_delete==1){
    Wishlist.findOneAndDelete({'room_id':room_id,"user_id":user_id},(err,resul)=>{
      res.redirect('/wishlists?page=1');
     // res.end();
    })
  }
  if(room_delete!=1){
  Wishlist.find({'user_id':user_id,'status':1},(err,docs)=>{ 
    console.log(docs.length);
    console.log(docs.length/2);
    console.log(Math.ceil(docs.length/2.0));
    pageCount=Math.ceil(docs.length/2.0)+1;
    res.render('wishlist.hbs',{name,admin,docs,len:docs.length,pageCount,'prevPage':pagenumber-1,'nextPage':pagenumber+1});
  }).skip(skip).limit(limit);
}
});
app.get('/manageHotel',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
var deleteRoom=req.query.deleteId;
MongoClient.connect(url,function(err,db){
if(err) throw err;
var dbo=db.db("hotel_reservation");
dbo.collection("hotels").find({'status':1}).toArray((err,results)=>{
if(err) throw err;
db.close();
if(deleteRoom!=null){
   Hotel.findOneAndUpdate({hotel_id:deleteRoom},{$set:{'status':0}},{new:true},(err,docs)=>{
     //console.log(docs);
    res.redirect('/manageHotel');
   });
}else{
//console.log(results);
res.status(200).render('manageHotel.hbs',{output:results,name,admin});
}
});
});

});
app.post('/addCityDetails',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var body=_.pick(req.body,['name','address','zipcode']);
  if(!body.name || !body.address || !body.zipcode){
    res.status(401).render('addCity.hbs',{name,admin});
  }
  Hotel.findOne({},(err,result)=>{
    if(err) throw err;
    var hotel_id;
    if(result==null){
      hotel_id=1;
    }else{
      hotel_id=result.hotel_id+1;
    }
    var obj={
      'hotel_id':hotel_id,
      'city':body.name,
      'address':body.address,
      'zipcode':body.zipcode,
      'status':1
    };
    var hotel=new Hotel(obj);
hotel.save().then(()=>{
  
  res.status(200).redirect('/manageHotel');
});
  }).sort({'hotel_id':-1});
});
app.get('/updateCity',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var hotel_id=req.query.cityId;
  app.locals.updateId=hotel_id;
  Hotel.findOne({'hotel_id':hotel_id,'status':1},(err,result)=>{
    res.status(200).render('updateCity.hbs',{name,admin,"city":result.city,'address':result.address,'zipcode':result.zipcode});
  });
});
app.post('/updateCityDetails',(req,res)=>{
  var body=_.pick(req.body,['name','address','zipcode']);
  if(!body.name || !body.address || !body.zipcode){
    res.status(401).redirect('/updateCity');
  }
  Hotel.findOneAndUpdate({'hotel_id':app.locals.updateId},{$set:{"city":body.name,'address':body.address,'zipcode':body.zipcode}},{new:true},(err,docs)=>{
    res.status(200).redirect('/manageHotel');
  });
});
app.get('/roomInfo',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var hotelId=req.query.city;
  var page=req.query.page;
  
  var search=req.query.search;
  
  var featurenames=[];
  var start=page*5-5;
  var end=page*5;
  
  if(search=='search' && hotelId!=null){
    Search.find({'hotel_id':hotelId,'status':1},(err,result1)=>{
     
    Search.find({'hotel_id':hotelId,'status':1},(err,result)=>{
      
        if(err) console.log('error');   
        var count=result1.length;
        console.log('pages',end);
        var noOfPages=Math.ceil(count/5);
        console.log('pages',noOfPages);
        res.statusCode=200;
        previous=parseInt(page)-1;
        next=parseInt(page)+1;
        if(hotelId!=null && search!='search'){
          
        Hotel.findOne({'hotel_id':hotelId},(err,docs1)=>{
          if(err) console.log('error');
          res.render('roomInfo.hbs',{'hotel_id':hotelId,'id':hotelId,cityname:docs1.city,output:app.locals.cities,name,admin});
          
        });}
        if(result!=null){
          Hotel.findOne({'hotel_id':hotelId,'status':1},(err,doc5)=>{
            
          res.render('roomInfo.hbs',{name,admin,'result':result,'hotel_id':hotelId,'noOfPages':noOfPages,'previous':previous,'next':next,cityname:doc5.city});
          });
        }
    }).limit(end).skip(start);
  });
  }
  if(hotelId==null && search!='search'){
  Hotel.find({'status':1},(err,docs)=>{
    app.locals.cities=docs;
    if(err) console.log('error');  
    res.setHeader('Content-Type','text/html');
    res.render('roomInfo.hbs',{output:docs,name,admin});
       
  });}
  if(hotelId!=null && search!='search'){
    console.log("entered");
  Hotel.findOne({'hotel_id':hotelId},(err,docs1)=>{
    if(err) console.log('error');
    res.render('roomInfo.hbs',{'id':hotelId,'hotel_id':hotelId,cityname:docs1.city,output:app.locals.cities,name,admin});
    
  });}


});
app.get('/addRoom',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  app.locals.hotelId=req.query.hotelId;

  if(req.query.hotelId.length<1){
    res.render('roomInfo.hbs',{aler:"<script type='text/javascript'>alert('Select Hotel');</script>",name,admin});
  }else{
  Feature.find({},(err,docs)=>{
    res.render('addRoom.hbs',{docs,name,admin});
  });
}
});
app.post('/addRoomDetails',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var hotelId=app.locals.hotelId;
  var body=_.pick(req.body,['desc','price','roomType','max_occupancy','features[]']);

 Room.findOne({},(err,result)=>{
   if(err) throw err;
   var room_id;
   if(result==null){
     room_id=1;
   }else{
room_id=result.room_id+1;
   }

   var obj={
     'room_id':room_id,
     'hotel_id':hotelId,
     'status':1,
     'room_desc':body.desc,
     'price':body.price,
     'room_type':body.roomType,
     'max_occupancy':body.max_occupancy,
     'image_url':app.locals.imageName
   };
   var namesArray=[];
   var room=new Room(obj);
   for(var i=0;i<body["features[]"].length;i++){
     
     if(body["features[]"][i]==1){
      namesArray.push('Roll-in shower');
     }else if(body["features[]"][i]==2){namesArray.push("Free infant/kid's bed");}
     else if(body["features[]"][i]==3){namesArray.push("Wifi-Facility");}
     else if(body["features[]"][i]==4){namesArray.push("Gym");}
   }
   
   room.save().then(()=>{
   
    obj['feature_id']=body["features[]"];
    obj['feature_name']=namesArray;
    obj['booking_id']=0;
    obj['check_in']='2000-11-09';
    obj['check_out']='2000-12-09';
    var search=new Search(obj);
    search.save().then(()=>{
      res.status(200).redirect('/roomInfo?city='+hotelId+'&search=search');
    })   
    
   });
 }).sort({'room_id':-1});
});
app.get('/roomUpdate',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var roomId=req.query.roomId;
  var city=req.query.city;
  Search.findOne({'room_id':roomId,'status':1},(err,result)=>{
    if(err) throw err;
    var featureid=[];
    var featurenames=[];
    for(var i=0;i<result.feature_id.length;i++){
     featureid.push(result.feature_id[i]);
     featurenames.push(result.feature_name[i]);
    }
    app.locals.image_url=result.image_url;
    app.locals.roomId=roomId;
    app.locals.city=city;
    Feature.find({},(err,docs)=>{
    res.status(200).render('roomUpdate.hbs',{name,admin,'image_url':result.image_url,'room_desc':result.room_desc,'price':result.price,'room_type':result.room_type,'max_occupancy':result.max_occupancy,docs,result,featurenames}); 
  });
  });
});
app.post('/roomUpdateDetails',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
var image_url=app.locals.image_url;
var room_id=app.locals.roomId;
var city=app.locals.city;
var body=_.pick(req.body,['desc','price','roomType','max_occupancy','features[]']);

Room.findOneAndUpdate({'room_id':room_id,'hotel_id':city},{$set:{'image_url':image_url,'room_desc':body.desc,'price':body.price,'room_type':body.roomType,'max_occupancy':body.max_occupancy}},(err,results)=>{
Search.findOneAndUpdate({'room_id':room_id,'hotel_id':city},{$set:{'image_url':image_url,'room_desc':body.desc,'price':body.price,'room_type':body.roomType,'max_occupancy':body.max_occupancy}},(err,docs)=>{
  res.status(200).redirect('/roomInfo?city='+city+'&search=search');
});
});
});
app.post('/uploadScripts',upload.single('upload_file'),(req,res)=>{
  app.locals.imageName=req.file.filename;
 res.send("<img id='imgsrc' class='imgsrc' src='"+req.file.filename+"' width='192px' height='192px'></img> <input type='hidden' name='imgsrc' form='addRoom' value='"+req.file.filename+"'/>");
});
app.post('/uploadScripts1',upload.single('upload_file'),(req,res)=>{
  var name=req.session.sess_name;
  var admin=0;
  if(req.session.sess_userid==1){
    admin=1;
  }
  var city=app.locals.city;
  var roomid=app.locals.roomId
  app.locals.image_url=req.file.filename;
  //res.send("<img id='imgsrc' class='imgsrc' src='"+req.file.filename+"' width='192px' height='192px'></img> <input type='hidden' name='imgsrc' form='roomUpdate' value='"+req.file.filename+"'/>");
  Room.find({hotel_id:city,room_id:roomid},(err,result)=>{
  res.status(200).render('roomUpdate.hbs',{'image_url':req.file.filename,name,admin,'room_desc':result.room_desc,'price':result.price,'room_type':result.room_type,'max_occupancy':result.max_occupancy});
  });
});
app.get('/roomDelete',(req,res)=>{
  var room_id=req.query.deleteId;
  var hotel_id=req.query.city;
  Room.findOneAndUpdate({'hotel_id':hotel_id,'room_id':room_id},{$set:{'status':0}},(err,docs)=>{
    if(err) throw err;
    Search.findOneAndUpdate({'hotel_id':hotel_id,'room_id':room_id},{$set:{'status':0}},(err,doc)=>{
      res.status(200).redirect("/roomInfo?city="+hotel_id+"&search=search");
    });
  });
});
app.get('/usersList',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var pagenumber=parseInt(req.query.page);
  var deleteId=req.query.deleteId;
  var start=pagenumber*5-5;
var end=pagenumber*5;
var skip=start;
var limit=end-start;
var pageCount;
  if(!deleteId){
  User.find({'user_id':{$gt:0},'status':1},(err,docs)=>{
    pageCount=Math.ceil(docs.length/5)+1;
    res.render('usersList.hbs',{name,admin,output:docs,pageCount,'prevPage':pagenumber-1,'nextPage':pagenumber+1,'page':pagenumber})
  }).skip(skip).limit(limit);
}
if(deleteId){
  User.findOneAndDelete({'user_id':deleteId},{$set:{'status':0}},(err,doc)=>{
    res.redirect('/usersList?page=1');
  });
}
});
app.get('/custInfo',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  var user_id=req.query.id;
  User.findOne({user_id},(err,result)=>{
    res.render('custInfo',{'name1':result.name,'email':result.email,'phone':result.phone,name,admin});
  });
});
app.post('/custInfo',(req,res)=>{
  var user_id=req.query.id;
  
  User.findOneAndUpdate({user_id:user_id},{$set:{'email':req.body.email,'name':req.body.name,'phone':req.body.phone}},(err,result)=>{
    console.log(result);
    res.redirect('/usersList?page=1');
  })
});
app.get('/forgotpassword',(req,res)=>{
  res.render('forgotpassword.hbs');
});
app.post('/forgotpassword',(req,res)=>{
  var email=req.body.email;
  var pwd1=req.body.pwd1;
  var pwd2=req.body.pwd2;
  User.findOne({'email':email},(err,doc)=>{
    if(doc==null){
      var aler="<script type='text/javascript'>alert('email id doesn't exist);</script>";
      res.render('forgotpassword.hbs',{'aler':aler});
    }else{
      if(pwd1!=pwd2){
        console.log('password wrong');
        var aler="<script type='text/javascript'>alert('password doesnt match');</script>";
      res.render('forgotpassword.hbs',{'aler':aler});
      }else{
        let hash = bycrypt.hashSync(req.body.pwd1, 10);
        User.findOneAndUpdate({'email':email},{$set:{'password':hash}},(err,doc)=>{
          console.log('password changed successfully');
          res.render('index.hbs');
        });
      }
    }
  });
});
app.get('/editProfile',(req,res)=>{
  var name=req.session.sess_name;
          var admin=0;
          if(req.session.sess_userid==1){
            admin=1;
          }
  User.findOne({'user_id':req.session.sess_userid},(err,doc)=>{
    res.render('editProfile.hbs',{'email':doc.email,'phone':doc.phone,name,admin});

  });

});
app.post('/editProfile',(req,res)=>{
  
    User.findOneAndUpdate({'user_id':req.session.sess_userid},{$set:{'name':req.body.fname,'phone':req.body.phone}},(err,doc)=>{
      res.redirect('/home');
    }); 
});
app.get('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect('/');
  });
});
app.get('/validation',(req,res)=>{
User.find({},{email:1},(err,docs)=>{
  if(err) throw err;
  res.json(docs);
});
});
app.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
    
})