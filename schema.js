const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

module.exports.productSchema = Joi.object({
    product : Joi.object({
        title : Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        description : Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        image : Joi.string().allow("",null),
        price : Joi.number().required().min(1)
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().default(1),
        comment : Joi.string().required()
    }).required()
})

module.exports.cartSchema = Joi.object({
    quantity: Joi.number().integer().min(1).max(15).required() // Quantity must be a positive integer
});
