const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));

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


// index route
app.get( "/products" , async(req,res) =>{
    let products = await Product.find({});
    res.render("products/index.ejs" , {products});  
})

// CRUD OPERRATIONS

// create route
app.get("/products/new" , (req,res)=>{
    res.render("products/new.ejs");
})
app.post(("/products") , async(req,res)=>{
    // let{title , description , price} = req.body;
    // let newproduct = new Product({
    //     title:title,
    //     description:description,
    //     price:price
    // });
    let newproduct = new Product(req.body.product);
    await newproduct.save();
    res.redirect("/products");  
});


// show route
app.get("/products/:id" , async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);
    res.render("products/show.ejs" , {product});
});


// update route
app.get("/products/:id/edit" , async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);
    res.render("products/edit.ejs" , {product});
});
app.put("/products/:id", async(req,res)=>{
    let{id} = req.params;
    const editproduct = req.body.product;
    await Product.findByIdAndUpdate(id , {...editproduct});
    res.redirect(`/products/${id}`);
});

// destroy route
app.delete("/products/:id" , async(req,res)=>{
    let{id} = req.params;
    const deleteproduct = await Product.findByIdAndDelete(id);
    res.redirect("/products");
})



// app.get("/testproduct" , async (req,res)=>{
//     let sample = new Product({ 
//         title:"Lemon",
//         image:"https://unsplash.com/photos/sliced-lemon-on-white-background-enNffryKuQI",
//         description:"Khatta",
//         price:100,
//     });
//     await sample.save();
//     console.log("Sample added");
//     res.send("Successfully Added");
// })