const express = require("express");
const router = express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js")

const {isLoggedIn, validateCart} = require("../middleware.js");

const cartController = require("../controllers/cartController.js");

router.get("/" ,isLoggedIn ,wrapAsync(cartController.showCart)); 

router.post("/add/:id", isLoggedIn, validateCart, wrapAsync(cartController.addToCart));

router.delete("/:cartId/:id" , isLoggedIn, wrapAsync(cartController.deleteFromCart));

module.exports = router;
