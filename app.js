const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {productSchema} = require("./schema.js");

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

//require schema
const Product = require("./models/product.js");

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

const validateProduct = (req,res,next)=>{
    let{error} = productSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

// index route
app.get( "/products" , wrapAsync(async(req,res) =>{
    let products = await Product.find({});
    res.render("products/index.ejs" , {products});  
}))

// CRUD OPERRATIONS

// create route
// new route
app.get("/products/new" , (req,res)=>{
    res.render("products/new.ejs");
})
// add route
app.post(("/products") , validateProduct, wrapAsync(async(req,res)=>{
    let newproduct = new Product(req.body.product);
    await newproduct.save();
    res.redirect("/products");  
}));


// show route
app.get("/products/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);
    res.render("products/show.ejs" , {product});
}));


// update route
app.get("/products/:id/edit" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);
    res.render("products/edit.ejs" , {product});
}));
app.put("/products/:id", validateProduct, wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const editproduct = req.body.product;
    if(!editproduct){
        throw new ExpressError(404 , "Body Empty");
    }
    await Product.findByIdAndUpdate(id , {...editproduct});
    res.redirect(`/products/${id}`);
}));

// destroy route
app.delete("/products/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const deleteproduct = await Product.findByIdAndDelete(id);
    res.redirect("/products");
}));

app.get("/cart/add/:id" , (req , res)=>{
    res.send("Added to cart");
})

app.all("*" , (req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=500 , message="some error occured"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})
