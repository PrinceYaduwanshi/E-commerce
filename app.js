const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

//require schema
const Product = require("./models/product.js");
const Review = require("./models/review.js");
const Cart = require("./models/cart.js");
const {productSchema , reviewSchema } = require("./schema.js");



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

// handling errors
const validateProduct = (req,res,next)=>{
    let{error} = productSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
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

app.get("/products/cart/" , wrapAsync(async(req,res)=>{
    
    let cart = await Cart.findOne({}).populate("items.product");
    console.log(cart);
    if(cart){
        let cartItems = cart.items;
        console.log(cartItems);
        let length = cartItems.length;
        console.log(length);
        res.render("cart.ejs" , {cartItems});
    }else{
        res.send("no cart exists");
    }
      
    // console.log(...cartItems);
    
}))

// show route
app.get("/products/:id" , wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id).populate("reviews");
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

// Review route

// post review
app.post("/products/:id/review" , validateReview , wrapAsync(async(req, res)=>{
    let {id} = req.params;
    // console.log(id);
    let product = await Product.findById(id);
    let newReview = new Review(req.body.review);
    product.reviews.push(newReview);

    await newReview.save();
    await product.save();
    // console.log("Review Added");
    res.redirect(`/products/${product._id}`);
}))

// delete review
app.delete("/products/:id/review/:reviewId" , wrapAsync( async(req,res)=>{
    let { id , reviewId } = req.params;
    await Product.findByIdAndUpdate( id , {$pull :{ reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/products/${id}`);
}))


app.post("/cart/add/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const cart = await Cart.findOne({}); // Assuming a single cart for simplicity
    if (cart) {
        cart.items.push({ product: id });
        await cart.save();
    }else{
        const newCart = new Cart({ items: [{product : id}] });
        await newCart.save();
    }
    
    res.redirect("/products");
}));


app.all("*" , (req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=500 , message="some error occured"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})
