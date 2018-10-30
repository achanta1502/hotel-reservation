const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const port=3000;
const {mongoose} =require('./db/mongoose');
const hbs=require('hbs');
const multer=require('multer');

//var popup = require('popups');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const bycrypt=require('bcryptjs');
const session=require('express-session');
const {Hotel}=require('./models/hotel');
const {User}=require('./models/user');
const {Room}=require('./models/room');
const {Search}=require('./models/search');
const {Wishlist}=require('./models/wishlist');
const {Feature}=require('./models/feature');
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
app.set('view engine','hbs');
app.use(express.static(__dirname + '/public'));

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
app.get('/',(req,resp)=>{
 resp.render('index.hbs');
  });
 
  app.get('/addCity',(req,res)=>{
    res.status(200).render('addCity.hbs');
  });
  app.get('updateCity',(req,res)=>{
    res.render('updateCity.hbs');
  })
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
               User.findOne({},(err,result1)=>{
                 if(err) throw err;
                 var user_id;
                 if(result1==null){
                   user_id=1;
                 }else{
                  user_id=result1.user_id+1;
                 }
                let hash = bycrypt.hashSync(body.password, 10);
                
                console.log('password',hash);
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
  var feature_id=req.query.feature;
  var hotel_id=app.locals.obj2.hotel_id;
  app.locals.feature_id=feature_id;
  app.locals.pagenumber=pagenumber;
  var check_in=app.locals.obj2.check_in;
var check_out=app.locals.obj2.check_out;
var noOfPersons=app.locals.obj2.noOfPersons;
if(feature_id){
  features(feature_id,hotel_id,noOfPersons,check_in,check_out,5,(result3)=>{
    res.render('search.hbs',{output:result3,len:result3.length});
  });}
  else{
  nofeatures(hotel_id,noOfPersons,check_in,check_out,5,(result)=>{
    res.render('search.hbs',{output:result,len:result.length});
  });
}
});
app.post('/search',(req,res)=>{
  var feature_id=req.query.feature;
var feature_id=app.locals.feature_id;
var hotel_id=app.locals.obj2.hotel_id;
var check_in=app.locals.obj2.check_in;
var check_out=app.locals.obj2.check_out;
var noOfPersons=app.locals.obj2.noOfPersons;
var pagenumber=req.query.page;
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
var limit=end-start;
// if(name_filter_flag && feature_id!=null){
//   bothfeatures(feature_id,hotel_id,noOfPersons,check_in,check_out,name_filter,limit,(result1)=>{
//     res.render('search.hbs',{output:result1,len:result.length});
//   });
// }else 
if(name_filter_flag){
filters(hotel_id,noOfPersons,check_in,check_out,name_filter,limit,(result2)=>{
  res.render('search.hbs',{output:result2});
});
}else if(feature_id){
  features(feature_id,hotel_id,noOfPersons,check_in,check_out,limit,(result3)=>{
    res.render('search.hbs',{output:result3});
  });
}else{
  console.log('no features');
  nofeatures(hotel_id,noOfPersons,check_in,check_out,limit,(result4)=>{
    res.render('search.hbs',{output:result4});
  });
}

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
          'user_id':2,
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
          var aler="<script type='text/javascript'>alert('New room added to wishlist');</script>";
              res.status(200).render('search.hbs',{output:aler});
        }).catch((err)=>{
          console.log(err);
        });
      });
       
        
       
      }).sort({'wishlist_id':-1})
     
     
    }
  });
  
});

app.get('/single',(req,res)=>{
  var room_id=req.query.roomId;
  var src=req.query.src;
  var wishlist_id=req.query.wishlist_id
    if(src=='search' && room_id!=null)
    Search.find({'room_id':room_id,'status':1,},(err,docs)=>{
      res.render('single.hbs',{output:docs});
    });
    if(src=='wishlist' && wishlist_id!=null){
      var flag=false;
      Wishlist.findOne({'wishlist_id':wishlist_id},(err,doc)=>{
        var room_id=doc.room_id;
        var noOfPersons=doc.numberOfPeople;
        var check_in=doc.check_in;
        var check_out=doc.check_out;
        Search.findOne({'room_id':room_id,'max_occupancy':{$gte:noOfPersons}},(err,result)=>{
          if(result.length>0){
            flag=true;
          }
        });
      });
    }
  
});





//admin pages go down from here
app.get('/wishlists',(req,res)=>{
  var room_delete=req.query.delete;
  var room_id=req.query.room_id;
  var user_id=2;
  if(room_delete==1){
    Wishlist.findOneAndDelete({'room_id':room_id,"user_id":user_id},(err,resul)=>{
      res.redirect('/wishlists');
     // res.end();
    })
  }
  if(room_delete!=1){
  Wishlist.find({'user_id':user_id,'status':1},(err,docs)=>{
    
    res.render('wishlist.hbs',{name:'pavan',docs,len:docs.length});
  });
}
});
app.get('/manageHotel',(req,res)=>{
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
res.status(200).render('manageHotel.hbs',{output:results});
}
});
});

});
app.post('/addCityDetails',(req,res)=>{
  var body=_.pick(req.body,['name','address','zipcode']);
  if(!body.name || !body.address || !body.zipcode){
    res.status(401).render(addCity.hbs);
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
  var hotel_id=req.query.cityId;
  app.locals.updateId=hotel_id;
  Hotel.findOne({'hotel_id':hotel_id,'status':1},(err,result)=>{
    res.status(200).render('updateCity.hbs',{"city":result.city,'address':result.address,'zipcode':result.zipcode});
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
  var hotelId=req.query.city;
  var page=req.query.page;
  var search=req.query.search;
  var featurenames=[];
  var start=page*5-5;
  var end=page*5;
  
  if(search=='search' && hotelId!=null){
 
    Search.find({'hotel_id':hotelId,'status':1},(err,result)=>{
      
        if(err) console.log('error');   
        var count=result.length;
        var noOfPages=Math.ceil(count/5);
        res.statusCode=200;
        previous=parseInt(page)-1;
        next=parseInt(page)+1;
        if(result!=null){
          console.log(typeof(hotelId));
          res.render('roomInfo.hbs',{'result':result,'hotelId':hotelId,'noOfPages':noOfPages,'previous':previous,'next':next});
        }
    }).limit(end).skip(start);
  }
  if(hotelId==null && search!='search'){
  Hotel.find({'status':1},(err,docs)=>{
    app.locals.cities=docs;
    if(err) console.log('error');  
    res.setHeader('Content-Type','text/html');
    res.render('roomInfo.hbs',{output:docs});
       
  });}
  if(hotelId!=null && search!='search'){
  Hotel.findOne({'hotel_id':hotelId},(err,docs1)=>{
    if(err) console.log('error');
    res.render('roomInfo.hbs',{id:hotelId,cityname:docs1.city,output:app.locals.cities});
    
  });}


});
app.get('/addRoom',(req,res)=>{
  app.locals.hotelId=req.query.hotelId;
console.log('hotelId'+req.query.hotelId.length);
  if(req.query.hotelId.length<1){
    res.render('roomInfo.hbs',{aler:"<script type='text/javascript'>alert('Select Hotel');</script>"});
  }else{
  Feature.find({},(err,docs)=>{
    res.render('addRoom.hbs',{docs});
  });
}
});
app.post('/addRoomDetails',(req,res)=>{
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
    var search=new Search(obj);
    search.save().then(()=>{
      res.status(200).redirect('/roomInfo?city='+hotelId+'&search=search');
    })   
    
   });
 }).sort({'room_id':-1});
});
app.get('/roomUpdate',(req,res)=>{
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
    res.status(200).render('roomUpdate.hbs',{'image_url':result.image_url,'room_desc':result.room_desc,'price':result.price,'room_type':result.room_type,'max_occupancy':result.max_occupancy,featureid,docs,featurenames,result}); 
  });
  });
});
app.post('/roomUpdateDetails',(req,res)=>{
var image_url=app.locals.image_url;
var room_id=app.locals.roomId;
var city=app.locals.city;
var body=_.pick(req.body,['desc','price','roomType','max_occupancy','features[]']);
var namesArray=[];

for(var i=0;i<body["features[]"].length;i++){
     
  if(body["features[]"][i]==1){
   namesArray.push('Roll-in shower');
  }else if(body["features[]"][i]==2){namesArray.push("Free infant/kid's bed");}
  else if(body["features[]"][i]==3){namesArray.push("Wifi-Facility");}
  else if(body["features[]"][i]==4){namesArray.push("Gym");}
}
Room.findOneAndUpdate({'room_id':room_id,'hotel_id':city},{$set:{'image_url':image_url,'room_desc':body.desc,'price':body.price,'room_type':body.roomType,'max_occupancy':body.max_occupancy,'feature_id':body["features[]"],'feature_name':namesArray}},(err,results)=>{
Search.findOneAndUpdate({'room_id':room_id,'hotel_id':city},{$set:{'image_url':image_url,'room_desc':body.desc,'price':body.price,'room_type':body.roomType,'max_occupancy':body.max_occupancy,'feature_id':body["features[]"],'feature_name':namesArray}},(err,docs)=>{
  res.status(200).redirect('/roomInfo?city=2&search=search');
});
});
});
app.post('/uploadScripts',upload.single('upload_file'),(req,res)=>{
  app.locals.imageName=req.file.filename;
 res.send("<img id='imgsrc' class='imgsrc' src='"+req.file.filename+"' width='192px' height='192px'></img> <input type='hidden' name='imgsrc' form='addRoom' value='"+req.file.filename+"'/>");
});
app.post('/uploadScripts1',upload.single('upload_file'),(req,res)=>{
  app.locals.image_url=req.file.filename;
  //res.send("<img id='imgsrc' class='imgsrc' src='"+req.file.filename+"' width='192px' height='192px'></img> <input type='hidden' name='imgsrc' form='roomUpdate' value='"+req.file.filename+"'/>");
 res.status(200).render('roomUpdate.hbs',{'image_url':req.file.filename});
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
function bothfeatures(feature_id,hotel_id,occupancy,check_in,check_out,room_type,limit,callback){
Search.find({'feature_id':feature_id,'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},'room_type':room_type},(err,result)=>{
  if(result.check_in==null && result.check_out==null){
    
    callback(result);
    }else{
      
      callback([]);
    }
}).limit(limit);
};
function filters(hotel_id,occupancy,check_in,check_out,room_type,limit,callback){
    Search.find({'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},'room_type':room_type},(err,result)=>{
      if(!result.check_in && !result.check_out){
    
        callback(result);
        }else{
          
          callback([]);
        }
    }
      ).limit(limit);
};
function features(feature_id,hotel_id,occupancy,check_in,check_out,limit,callback){
  console.log(feature_id);
    Search.find({'feature_id':feature_id,'hotel_id':hotel_id,'max_occupancy':{$gte:parseInt(occupancy)},'status':1},(err,result)=>{
     
        if(!result.check_in && !result.check_out){
          console.log('entered');
        callback(result); 
        }
    }
      ).limit(limit);
};

function nofeatures(hotel_id,occupancy,check_in,check_out,limit,callback){
  var count=parseInt(occupancy);
 
  Search.find({'status':1,'hotel_id':hotel_id,'max_occupancy':{$gte:count}},(err,result)=>{
    if(result.check_in==null && result.check_out==null){
    
    callback(result);
    }else{
      
      callback([]);
    }
  }).limit(limit);
};
app.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
    
})