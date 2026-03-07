const express = require("express");
const router = express.Router({mergeParams:true});

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");

const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviewController.js");
// post review
router.post("/" ,  isLoggedIn, validateReview  , wrapAsync(reviewController.addReview));

// delete review
router.delete("/:reviewId" , isLoggedIn, isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;