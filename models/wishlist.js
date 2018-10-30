const mongoose=require('mongoose');
var  WishlistSchema= new mongoose.Schema({
    wishlist_id:{
        type:Number,
        required:true,       
    },
    room_id:{
        type:Number,
        required:true,
           
    },
    user_id:{
        type:Number,
        required:true
        },
    check_in:{
        type:Date,
        required:true
    },
    check_out:{
        type:Date,
        required:true
    },
    numberOfPeople:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    room_type:{
        type:String,
        required:true
    },
    image_url:{
        type:String
        
    },
    status:{
        type:Number,
        required:true
    },
    room_desc:{
        type:String,
        required:true
    }
   
   
});

var Wishlist=mongoose.model('wishlist',WishlistSchema);
module.exports={Wishlist};