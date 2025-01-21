const express = require("express");
const router = express.Router({mergeParams:true});

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Product = require("../models/product.js");
const Review = require("../models/review.js");
const {productSchema , reviewSchema } = require("../schema.js");

// handling errors
const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

// post review
router.post("/" ,  validateReview  , wrapAsync(async(req, res)=>{
    let {id} = req.params;

    let product = await Product.findById(id);
    let newReview = new Review(req.body.review);
    // console.log(newReview)
    product.reviews.push(newReview);

    await newReview.save();
    await product.save();
    // console.log("Review Added");
    res.redirect(`/products/${product._id}`);
}))

// delete review
router.delete("/:reviewId" , wrapAsync( async(req,res)=>{
    let { id , reviewId } = req.params;
    await Product.findByIdAndUpdate( id , {$pull :{ reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/products/${id}`);
}))

module.exports = router;