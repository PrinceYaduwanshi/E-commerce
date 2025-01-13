const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const productSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        set:(v) => v ==="" ? "https://www.huber-online.com/daisy_website_files/_processed_/8/0/csm_no-image_d5c4ab1322.jpg" : v,
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
    }]

});

productSchema.post("findOneAndDelete" , async(product)=>{
    console.log(product.reviews);
    console.log(product.reviews.length);
    if(product){
        let res = await Review.deleteMany({_id : {$in : product.reviews}});
        console.log(res);
    }
})

const Product = mongoose.model("Product" , productSchema);
module.exports=Product;

