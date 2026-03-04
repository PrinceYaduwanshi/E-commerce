const express = require("express");
const router = express.Router();

const User = require("../models/user.js");

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const {saveRedirectUrl} = require("../middleware.js");

router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async(req,res)=>{
    try{
        let{email, username, password} = req.body;
        const newUser = new User({email, username});
        let registeredUser= await User.register(newUser, password);
        
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "User register Successfully");
            res.redirect("/products");
        })

    }catch(e){
        req.flash("error", e.message);
        console.log(e);
        res.redirect("/signup");
    }

}))

router.get("/login", (req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}),wrapAsync(async(req,res)=>{

    req.flash("success", "Welcome Back");
    console.log(res.local)
    const redirectUrl = res.locals.redirectUrl || "/products";
    res.redirect(redirectUrl);


}))

router.get("/logout", (req,res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged Out Successfully");
        res.redirect("/products");
    })
})

module.exports = router;