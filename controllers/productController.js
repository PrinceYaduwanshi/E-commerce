const Product = require("../models/product.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index = async(req,res) =>{
    let products = await Product.find({});
    res.render("products/index.ejs" , {products});  
}


module.exports.renderNewForm = (req,res)=>{
    res.render("products/new.ejs");
}


module.exports.createProduct = async(req,res)=>{
    let url= req.file.path;
    let filename= req.file.filename;

    let newproduct = new Product(req.body.product);

    newproduct.owner= req.user._id;
    newproduct.image= {url, filename};
    
    await newproduct.save();
    req.flash("success" , "Product added Successfully");
    res.redirect("/products");  
}


module.exports.showProduct = async(req,res)=>{
    let{id} = req.params;

    // nested populate
    const product = await Product.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
    if(!product){
        req.flash("error" , "Product not found");
        return res.redirect("/products");
    }

    res.render("products/show.ejs" , {product});
}


module.exports.renderEditForm = async(req,res)=>{
    let{id} = req.params;
    const product = await Product.findById(id);

    if(!product){
        req.flash("error" , "Product not found");
        return res.redirect("/products");
    }
    
    let originalImageUrl= product.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/e_pixelate:5/h_150,w_200");
    res.render("products/edit.ejs" , {product, originalImageUrl});
}


module.exports.updateProduct = async(req,res)=>{
    let{id} = req.params;
    const editproduct = req.body.product;

    if(!editproduct){
        throw new ExpressError(404 , "Body Empty");
    }

    let updatedProduct= await Product.findByIdAndUpdate(id , editproduct, { new: true, runValidators: true });

    if(typeof req.file !== "undefined"){
        let newUrl= req.file.path;
        let newFilename= req.file.filename;
        updatedProduct.image= {url: newUrl, filename: newFilename};    
        await updatedProduct.save();
    }
    
    req.flash("success" , "Product Updated");

    res.redirect(`/products/${id}`);
}

module.exports.destroyProduct = async(req,res)=>{
    let{id} = req.params;
    const deleteproduct = await Product.findByIdAndDelete(id);

    req.flash("success" , "Product Deleted");

    res.redirect("/products");
}