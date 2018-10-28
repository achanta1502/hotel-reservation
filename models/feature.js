const mongoose=require('mongoose');
var FeatureSchema=new mongoose.Schema({
    feature_id:{
        type:Number,
        required:true
    },
   
    feature_name:{
        type:String
    }
    
});

var Feature=mongoose.model('feature',FeatureSchema);
module.exports={Feature};