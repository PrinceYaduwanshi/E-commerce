const express = require("express");
const router = express.Router({mergeParams:true});

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");

const Product = require("../models/product.js");
const Review = require("../models/review.js");

const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware.js");

// post review
router.post("/" ,  isLoggedIn, validateReview  , wrapAsync(async(req, res)=>{
    let {id} = req.params;

    let product = await Product.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // console.log(newReview)
    product.reviews.push(newReview);

    await newReview.save();

    req.flash("success" , "Review Added");

    await product.save();
    // console.log("Review Added");
    res.redirect(`/products/${product._id}`);
}))

// delete review
router.delete("/:reviewId" , isLoggedIn, isReviewAuthor,wrapAsync( async(req,res)=>{
    let { id , reviewId } = req.params;
    await Product.findByIdAndUpdate( id , {$pull :{ reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success" , "Review Deleted");

    res.redirect(`/products/${id}`);
}))

module.exports = router;