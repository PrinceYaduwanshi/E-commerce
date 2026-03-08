const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");



const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");

const userController = require("../controllers/userController.js");

router.get("/signup", userController.renderSignUpForm);

router.post("/signup", wrapAsync(userController.signUp));

router.get("/login", userController.renderLoginForm);

router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}),wrapAsync(userController.login))

router.get("/logout", userController.logout);

// delete user 
router.get("/users/delete", isLoggedIn , userController.renderDeleteForm);
router.delete("/users/:userId/delete", isLoggedIn, wrapAsync(userController.deleteUser));

module.exports = router;