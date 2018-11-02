const mongoose=require('mongoose');
var SearchSchema=new mongoose.Schema({
    room_id:{
        type:Number,
        required:true
    },
    feature_id:{
        type:Array,
        required:true
    },
    feature_name:{
type:Array,required:true
    },
    image_url:{
type:String
    },
    hotel_id:{
       type:Number,
       required:true 
    },
    booking_id:{
        type:Number
       
    },
    max_occupancy:{
        type:Number,

    },
    check_in:{
        type:Date
    },
    room_desc:{
        type:String
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
    user_id:{
        type:Number
    }
});



var Search=mongoose.model('search',SearchSchema);
module.exports={Search};