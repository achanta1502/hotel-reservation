const mongoose=require('mongoose');
var  WishlistSchema= new mongoose.Schema({
   
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
    }
   
   
});

var Wishlist=mongoose.model('wishlist',WishlistSchema);
module.exports={Wishlist};