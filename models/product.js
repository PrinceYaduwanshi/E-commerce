const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const Cart= require("./cart.js");

const productSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    image:{
        url: String,
        filename: String,
    },
    description:{
        type:String,

    },
    price:{
        type:Number,
    },

    reviews : [{
        type : Schema.Types.ObjectId,
        ref : "Review",
    }],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }

});

productSchema.post("findOneAndDelete" , async(product)=>{
    
    if(product){
        let res = await Review.deleteMany({_id : {$in : product.reviews}});
        let resCart= await Cart.updateMany({}, {$pull : {items : {product : product._id}}});
    }
})

const Product = mongoose.model("Product" , productSchema);
module.exports=Product;

