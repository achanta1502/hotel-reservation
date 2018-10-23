const mongoose=require('mongoose');
var RoomSchema=new mongoose.Schema({
    room_id:{
        type:Number,
        required:true
    },
    hotel_id:{
        type:Number,
        required:true
    },
    room_desc:{
       type:String,
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
    max_occupancy:{
        type:Number,
        required:true
    },
    image_url:{
        type:String
        
    },
    status:{
        type:Number,
        required:true
    }
});

var Room=mongoose.model('room',RoomSchema);
module.exports={Room};