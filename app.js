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
const {productSchema , reviewSchema , cartSchema} = require("./schema.js");

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

// ROUTES
const productRoutes = require("./routes/product.js");
const reviewRoutes = require("./routes/review.js");

app.use("/products" , productRoutes);
app.use("/products/:id/review" , reviewRoutes);

const validateCart = (req,res,next)=>{
    let{error} = cartSchema.validate(req.body);
    console.log(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404 , errMsg);
    }else{
        next();
    }
}

app.get("/cart" ,wrapAsync(async(req,res)=>{
    
    let cart = await Cart.findOne({}).populate("items.product");
    if(cart){
        if(cart.items.length > 0){
            res.render("cart/cartShow.ejs" , {cart});
        }else{
            await Cart.findByIdAndDelete(cart._id);
            res.render("cart/continueShopping.ejs");
        }
    }else{
        res.render("cart/continueShopping.ejs");
    }
})) 

app.post("/cart/:id",validateCart, wrapAsync(async (req, res) => {
    
    const { id } = req.params;
    let quantity  = req.body.items[0].quantity;

    quantity = parseInt(quantity, 10);

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send("Invalid quantity");
    }

    const product = await Product.findById(id);
    if (!product) {
        throw new ExpressError(404, "Product not found");
    }

    const cart = await Cart.findOne({});

    if (cart) {
        const itemIndex = cart.items.findIndex(item => item.product.toString() === id);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: id, quantity: quantity });
        }
        await cart.save();
    } else {
        const newCart = new Cart({ items: [{ product: id, quantity: quantity }] });
        await newCart.save();
    }

    res.redirect("/products");
}));


app.delete("/cart/:cartId/:id" , (wrapAsync(async (req, res)=>{
    let { cartId , id } = req.params;

    const cart = await Cart.findByIdAndUpdate( cartId , {$pull :{ items : {product : id}}});

    if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cartId);
    }
    res.redirect("/cart");

})));



app.all("*" , (req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=500 , message="some error occured"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})
