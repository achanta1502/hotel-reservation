const mongoose=require('mongoose');
var  BookingSchema= new mongoose.Schema({
    booking_id:{
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
        type:Date       
    },
    check_out:{
        type:Date
    },
    amount_paid:{
        type:Number,
        required:true
    },
    status:{
        type:Number,
        required:true
    }
});

var Booking=mongoose.model('booking',BookingSchema);
module.exports={Booking};