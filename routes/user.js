const express = require("express");
const router = express.Router();

const User = require("../models/user.js");

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async(req,res)=>{
    try{
        let{email, username, password} = req.body;
        const newUser = new User({email, username});
        let registeredUser= await User.register(newUser, password);
    
        // console.log(registeredUser);
    
        req.flash("success", "User register Successfully");
        res.redirect("/products");
        // console.log("POST signup triggered");
    }catch(e){
        req.flash("error", e.message);
        console.log(e);
        res.redirect("/signup");
    }

}))

router.get("/login", (req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login", passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}),wrapAsync(async(req,res)=>{

    if(req.user.role.toLowerCase() === "admin"){
        return res.redirect("/products/new");
    }

    req.flash("success", "Welcome Back");
    res.redirect("/products");
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