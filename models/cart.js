const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product.js");

const cartSchema = new Schema({
    items : [{
        product : {
            type : Schema.Types.ObjectId,
            ref : "Product",
        },
    }]
})

const Cart = mongoose.model("Cart" , cartSchema);
module.exports = Cart;