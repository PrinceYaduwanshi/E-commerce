const express = require("express");
const router = express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");

const Product = require("../models/product.js");
const Cart = require("../models/cart.js");
const {cartSchema} = require("../schema.js");

const validateCart = (req,res,next)=>{
    let{error} = cartSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }

    // if(req.params.id != req.body.items[0].product){
    //     throw new ExpressError(400 , "Product ID in the URL does not match the Product ID in the request body");
    // }

    next();
}

router.get("/" ,wrapAsync(async(req,res)=>{
    
    let cart = await Cart.findOne({}).populate("items.product");

    // handling null items ie items which have been deleted from the products collection but are still present in the cart
    // handled by the post middleware in product model which deletes the items from the cart when a product is deleted
    // cart.items = cart.items.filter(item => item.product !== null);
    // await cart.save();
    
    if(cart){
        if(cart.items.length > 0){
            res.render("cart/cartShow.ejs" , {cart});
        }else{
            await Cart.findByIdAndDelete(cart._id);
            res.render("cart/continueShopping.ejs");
        }
    }else{
        res.render("cart/continueShopping.ejs");
    }
})) 

router.post("/add/:id", validateCart, wrapAsync(async (req, res) => {
    
    const { id } = req.params;
    const product = await Product.findById(id);

    if(!product){
        const err = new ExpressError(404, "Product Not Found");
        return res.status(404).render("error.ejs",{err});
    }

    let quantity  = Number(req.body.quantity) || 1;

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send("Invalid quantity");
    }

    const cart = await Cart.findOne({});

    if (cart) {
        
        if(cart.items.length >= 12){
            let err = new ExpressError(400 , "Cart Limit Exceeded! You can only add 12 items to the cart.");
            return res.status(400).render("error.ejs",{err});
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === id);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: id, quantity: quantity });
        }
        await cart.save();
    } else {
        const newCart = new Cart({ items: [{ product: id, quantity: quantity }] });
        await newCart.save();
    }
    req.flash("success" , "Item Added to Cart");

    res.redirect("/products");
}));

router.delete("/:cartId/:id" , (wrapAsync(async (req, res)=>{
    let { cartId , id } = req.params;

    const cart = await Cart.findByIdAndUpdate( cartId , {$pull :{ items : {product : id}}});

    if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cartId);
    }

    req.flash("success" , "Item Removed");

    res.redirect("/cart");

})));

module.exports = router;
