const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    
    items : [{
        product : {
            type : Schema.Types.ObjectId,
            ref : "Product",
        },
        _id:false,
        
        quantity :{
            type:Number,
            default:1,
        }
    }],

})

const Cart = mongoose.model("Cart" , cartSchema);
module.exports = Cart;