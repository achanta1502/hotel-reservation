const mongoose=require('mongoose');
var SearchSchema=new mongoose.Schema({
    room_id:{
        type:Number,
        required:true
    },
    feature_id:{
        type:Number,
        required:true
    },
    hotel_id:{
       type:Number,
       required:true 
    },
    booking_id:{
        type:Number,
        required:true
    },
    max_occupancy:{
        type:Number,

    },
    check_in:{
        type:Date
    },
    check_out:{
        type:Date,
    },
    status:{
        type:Number
    },
    room_type:{
        type:String
    },
    price:{
        type:String
    },
    feature_name:{
        type:String
    }
});



var Search=mongoose.model('search',SearchSchema);
module.exports={Search};