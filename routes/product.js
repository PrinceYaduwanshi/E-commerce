const express = require("express");
const router = express.Router();

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

//require schema
const Product = require("../models/product.js");

const {isLoggedIn, isOwner, validateProduct} = require("../middleware.js");

// CRUD OPERRATIONS

// index route
router.get( "/" , wrapAsync(async(req,res) =>{
    let products = await Product.find({});
    res.render("products/index.ejs" , {products});  
}))

// create route
// new route
router.get("/new" , isLoggedIn, (req,res)=>{
    res.render("products/new.ejs");
})
// add route
router.post("/" , isLoggedIn, validateProduct, wrapAsync(async(req,res)=>{
    let newproduct = new Product(req.body.product);
    newproduct.owner= req.user._id;
    await newproduct.save();
    req.flash("success" , "Product added Successfully");
    res.redirect("/products");  
}));

// show route
router.get("/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    // nested populate
    const product = await Product.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
    if(!product){
        req.flash("error" , "Product not found");
        res.redirect("/products");
    }

    res.render("products/show.ejs" , {product});
}));

// update route
router.get("/:id/edit" , isLoggedIn, isOwner ,wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);

    if(!product){
        req.flash("error" , "Product not found");
        res.redirect("/products");
    }
    
    res.render("products/edit.ejs" , {product});
}));
router.put("/:id", isLoggedIn, isOwner, validateProduct, wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const editproduct = req.body.product;
    if(!editproduct){
        throw new ExpressError(404 , "Body Empty");
    }
    await Product.findByIdAndUpdate(id , editproduct);

    req.flash("success" , "Product Updated");

    res.redirect(`/products/${id}`);
}));

// destroy route
router.delete("/:id" , isLoggedIn, isOwner, wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const deleteproduct = await Product.findByIdAndDelete(id);

    req.flash("success" , "Product Deleted");

    res.redirect("/products");
}));

module.exports = router;