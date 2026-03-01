const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

// require middlewares 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));
app.use(express.static(path.join(__dirname,"/public")));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(methodOverride("_method"));

app.engine("ejs" , ejsMate);

// configure dotenv
const dotenv = require("dotenv");
dotenv.config();

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

app.use((req , res , next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


// ROUTES
const productRoutes = require("./routes/product.js");
const reviewRoutes = require("./routes/review.js");
const cartRoutes = require("./routes/cart.js");

app.use("/products" , productRoutes);
app.use("/products/:id/review" , reviewRoutes);
app.use("/cart", cartRoutes);


app.all("*" , (req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=500 , message="some error occured"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
})
