const mongoose=require('mongoose');
var HotelSchema=new mongoose.Schema({
    hotel_id:{
        type:Number,
        required:true
    },
    city:{
       type:String,
       required:true 
    },
    address:{
        type:String,
        required:true
    },
    zipcode:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true
    }
});
HotelSchema.statics.getHotel=function(){
var Hotel=this;
return Hotel.find({},{hotel_id:1,city:1}).then((hotel)=>{
    if(!hotel){
        return Promise.reject();
    }
    return new Promise((resolve,reject)=>{
        resolve(hotel);
    });
})
};
HotelSchema.statics.getHotel=function (callback){
    var Hotel=this;
    Hotel.find({},{hotel_id:1,city:1},(e,docs)=>{
      callback(docs);
  });};
var Hotel=mongoose.model('hotel',HotelSchema);
module.exports={Hotel};