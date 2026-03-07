const User = require("../models/user.js");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}


module.exports.signUp = async(req,res)=>{
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

}


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}


module.exports.login = async(req,res)=>{

    req.flash("success", "Welcome Back");
    const redirectUrl = res.locals.redirectUrl || "/products";
    res.redirect(redirectUrl);


}

module.exports.logout = (req,res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged Out Successfully");
        res.redirect("/products");
    })
}