const mongoose= require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const Product = require("./product.js");
const Review = require("./review.js");
const Cart = require("./cart.js");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    }, 
    role:{
        type: "String",
        enum: ["admin", "customer"],
        default: "customer",
    }
})

userSchema.plugin(passportLocalMongoose.default);

userSchema.post("findOneAndDelete" , async(user)=>{
    
    if(user){
        let products = await Product.find({owner: user._id});

        for(let product of products){
            await Product.findOneAndDelete(product._id);
        }

        await Review.deleteMany({author: user._id});
    }
})

module.exports = mongoose.model("User", userSchema);