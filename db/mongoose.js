var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost:27017/hotel_reservation",{useNewUrlParser: true},(err)=>{
    if(err){
        console.log('database connection failed');
    }
    console.log('database connection successful');
});
module.exports={mongoose};