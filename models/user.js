const mongoose= require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    }, 
    role:{
        type: "String",
        enum: ["admin", "customer"],
        default: "customer",
    }
})

userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model("User", userSchema);