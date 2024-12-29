const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

});

const Product = mongoose.model("Product" , productSchema);
module.exports=Product;

