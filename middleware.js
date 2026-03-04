const Product = require("./models/product.js");
const Review = require("./models/review.js");
const {productSchema, cartSchema, reviewSchema} = require("./schema.js");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


// schema verification
// handling errors
module.exports.validateProduct = (req,res,next)=>{
    let{error} = productSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

// validate cart- joi schema
module.exports.validateCart = (req,res,next)=>{
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

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

module.exports.isLoggedIn = (req, res, next)=>{
    // console.log(req.path, "   " ,req.originalUrl);
    if(!req.isAuthenticated()){
        req.flash("error", "Login First");

        if(req.method == "GET"){
            req.session.redirectUrl = req.originalUrl;
        }

        // console.log(req.session.redirectUrl)
        // console.log(req); 
        // console.log("Inside logged in");
        // console.log(req.isAuthenticated());
        // console.log(req);
        return res.redirect("/login");
    }
    next();
}

module.exports.isOwner = wrapAsync(async(req, res, next) =>{
    let {id}= req.params;
    let product= await Product.findById(id);
    // console.log(product.owner);
    if(!product.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You can't perform this action");
        return res.redirect(`/products/${id}`)
    }

    next();
})
module.exports.isReviewAuthor = wrapAsync(async(req, res, next) =>{
    let {id, reviewId}= req.params;
    let review= await Review.findById(reviewId);
    // console.log(product.owner);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You can't perform this action");
        return res.redirect(`/products/${id}`)
    }

    next();
})

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}