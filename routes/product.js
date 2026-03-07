const express = require("express");
const router = express.Router();

// require middlewares 
const wrapAsync = require("../utils/wrapAsync.js");

const {isLoggedIn, isOwner, validateProduct} = require("../middleware.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


const productController = require("../controllers/productController.js");
// CRUD OPERRATIONS

// index route
router.get( "/" , wrapAsync(productController.index));

/**        CREATE PRODUCTS        */
// new route 
router.get("/new" , isLoggedIn, productController.renderNewForm);
// add route 
router.post("/" , isLoggedIn, upload.single('product[image]'), validateProduct, wrapAsync(productController.createProduct));

// show route
router.get("/:id" , wrapAsync(productController.showProduct));

// update route
router.get("/:id/edit" , isLoggedIn, isOwner ,wrapAsync(productController.renderEditForm));
router.put("/:id", isLoggedIn, isOwner, upload.single('product[image]'), validateProduct, wrapAsync(productController.updateProduct));


// destroy route
router.delete("/:id" , isLoggedIn, isOwner, wrapAsync(productController.destroyProduct));

module.exports = router;