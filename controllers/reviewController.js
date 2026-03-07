const Product = require("../models/product.js");
const Review = require("../models/review.js");

module.exports.addReview = async(req, res)=>{
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
}


module.exports.destroyReview = async(req,res)=>{
    let { id , reviewId } = req.params;
    await Product.findByIdAndUpdate( id , {$pull :{ reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success" , "Review Deleted");

    res.redirect(`/products/${id}`);
}