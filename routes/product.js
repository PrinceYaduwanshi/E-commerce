const express = require("express");
const router = express.Router();

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

//require schema
const Product = require("../models/product.js");
const {productSchema} = require("../schema.js");

// handling errors
const validateProduct = (req,res,next)=>{
    let{error} = productSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

// CRUD OPERRATIONS

// index route
router.get( "/" , wrapAsync(async(req,res) =>{
    let products = await Product.find({});
    res.render("products/index.ejs" , {products});  
}))

// create route
// new route
router.get("/new" , (req,res)=>{
    res.render("products/new.ejs");
})
// add route
router.post("/" , validateProduct, wrapAsync(async(req,res)=>{
    let newproduct = new Product(req.body.product);
    await newproduct.save();
    req.flash("success" , "Product added Successfully");
    res.redirect("/products");  
}));

// show route
router.get("/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id).populate("reviews");

    if(!product){
        req.flash("error" , "Product not found");
        res.redirect("/products");
    }

    res.render("products/show.ejs" , {product});
}));

// update route
router.get("/:id/edit" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);

    if(!product){
        req.flash("error" , "Product not found");
        res.redirect("/products");
    }
    
    res.render("products/edit.ejs" , {product});
}));
router.put("/:id", validateProduct, wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const editproduct = req.body.product;
    if(!editproduct){
        throw new ExpressError(404 , "Body Empty");
    }
    await Product.findByIdAndUpdate(id , {...editproduct});

    req.flash("success" , "Product Updated");

    res.redirect(`/products/${id}`);
}));

// destroy route
router.delete("/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const deleteproduct = await Product.findByIdAndDelete(id);

    req.flash("success" , "Product Deleted");

    res.redirect("/products");
}));

module.exports = router;