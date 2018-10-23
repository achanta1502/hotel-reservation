const mongoose=require('mongoose');
const validator=require('validator');
const jwt=require('jsonwebtoken');
const _=require('lodash');
const bcrypt=require('bcryptjs');
var  UserSchema= new mongoose.Schema({
   user_id:{
    type:Number,
    required:true
   },
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
           
    },
    password:{
        type:String,
        required:true,
        minlength:6},
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true
    }
    // },
    // tokens:[{
    //     access:{
    //         type:String,
    //         required:true
    //     },
    //     token:{
    //         type:String,
    //         required:true
    //     }
    // }]
});

// UserSchema.methods.toJSON=function(){
//     var user=this;
//     var userObject=user.toObject();
//     return _.pick(userObject,['_id','email'])
// };
// UserSchema.methods.generateAuthToken=function(){
// var user=this;
// var access='auth';
// var token=jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();
// user.tokens=user.tokens.concat([{access,token}]);
// return user.save().then(()=>{
//     return token;
// });
// };
// UserSchema.statics.findByToken=function(token){
// var User=this;
// var decoded;
// try{
// decoded=jwt.verify(token,'abc123');

// }catch(e){
// return new Promise((resolve,reject)=>{
//     reject();
// });
// }
// return User.findOne({
//     '_id':decoded._id,
//     'tokens.token':token,
//     'tokens.access':'auth'
// });
// };
// UserSchema.statics.findByCredentials=function(email,password){
// var User=this;
// return User.findOne({email}).then((user)=>{
//     if(!user){
//         return Promise.reject();
//     }
//     return new Promise((resolve,reject)=>{
//         user.password=bycrypt.hash(user.password,10,(err,hash)=>{
//             if(e){
      
//             }
//             user.password=hash;
//           });
//         bycrypt.compare(password,user.password,(err,res)=>{
//             if(res){
//                 resolve(user);
//             }else{
//                 reject();
//             }
//         });
//     });
// });
// };
var User=mongoose.model('user',UserSchema);
module.exports={User};