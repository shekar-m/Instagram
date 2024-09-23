const { type } = require("express/lib/response");
const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const profileSchema=new Schema({
    userId: {
        type:String,
        unique: true, 
        required: true,
      },
   
    Bio:{
        type:String,
        required:true,
    },
    Gender:{
        type:String,
        required:true,
    },
    ProfileImageURL:
    { 
        type: String,
        required: true
    },
    timestamp:
     { 
        type: Date,
        default: Date.now    
    }
})
const profileDB=mongoose.model("profileModel",profileSchema);
module.exports=profileDB;
