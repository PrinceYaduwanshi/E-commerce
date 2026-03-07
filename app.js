const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const User = require("./models/user.js");

// require middlewares 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));
app.use(express.static(path.join(__dirname,"/public")));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(methodOverride("_method"));

app.engine("ejs" , ejsMate);

// configure dotenv
if(process.env.NODE_ENV != "production"){
    const dotenv = require("dotenv");
    dotenv.config();
}

const port = process.env.PORT;

main()
    .then(()=>{
        console.log("Connected to DB");
    }).catch((err)=>{
        console.log(err);
    });
async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}


app.listen( port , ()=>{
    console.log(`app is running on port ${port}`);
});

// config sessions
const sessionOptions = {
    secret: "secretcode" , 
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, //in ms
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}
app.use(session(sessionOptions));
app.use(flash());

// initializing passport
app.use(passport.initialize()); //to use Passport in an Express-based application
app.use(passport.session()); //if we require persistent login sessions

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req , res , next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "fakeUser@gmail.com",
//         role: "customer",
//         username: "fakeuser",
//     })

//     let newUser= await User.register(fakeUser, "password");
//     console.log(newUser);
//     res.send(newUser);
// })



// ROUTES
const productRoutes = require("./routes/product.js");
const reviewRoutes = require("./routes/review.js");
const cartRoutes = require("./routes/cart.js");
const userRoutes = require("./routes/user.js");

app.use("/products" , productRoutes);
app.use("/products/:id/review" , reviewRoutes);
app.use("/cart", cartRoutes);
app.use("/", userRoutes);


app.all("*" , (req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=500 , message="some error occured"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
})
