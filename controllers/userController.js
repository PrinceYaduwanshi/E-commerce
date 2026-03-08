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

module.exports.renderDeleteForm = (req, res)=>{
    res.render("users/delete.ejs");
}

module.exports.deleteUser = async(req, res, next)=>{
    let {userId}= req.params;
    let {password} = req.body;

    let user= await User.findById(userId);
    
    if(!user){
        req.flash("error", "User Not Found");
        res.redirect("/products");
    }

    let result = await User.authenticate()(user.username, password);
    
    // user does not exists or password is incorrect
    if(!result.user){
        req.flash("error", "Invalid Password Entered");
        return res.redirect("/users/delete");
    }

    await User.findByIdAndDelete(userId);

    req.logout((err)=>{
        if(err) return next(err);
    })
    req.flash("success", "Account Deleted SuccessFully");
    res.redirect("/products");
}