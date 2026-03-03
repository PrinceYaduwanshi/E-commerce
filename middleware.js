module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "Login First");
        // console.log("Inside logged in");
        // console.log(req.isAuthenticated());
        // console.log(req);
        return res.redirect("/login");
    }
    next();
}

module.exports.isAdmin = (req, res, next) =>{
    if(req.user.role.toLowerCase() != "admin"){
        req.flash("error", "Only admin can perform this action");
        return res.redirect("/products");
    }
    next();
}