const mongoose = require("mongoose");
const initData = require("./data.js");
const Product = require("../models/product.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/ecommerce";

main()
    .then(()=>{
        console.log("Connected to DB");
    }).catch((err)=>{
        console.log(err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async()=>{
    await Product.deleteMany({});
    console.log("data initialized");
    // console.log("before :", initData.data);
    initData.data = initData.data.map((obj)=>({...obj, owner: "69a67c56d59d54117bad6a41"}))
    await Product.insertMany(initData.data);
    console.log("data :", initData.data);
}
initDB();