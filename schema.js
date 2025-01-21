const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

module.exports.productSchema = Joi.object({
    product : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        image : Joi.string().allow("",null),
        price : Joi.number().required().min(0)
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().default(1),
        comment : Joi.string().required()
    }).required()
})

module.exports.cartSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().required(), // Assuming product ID is a string
            quantity: Joi.number().integer().min(1).required() // Quantity must be a positive integer
        })
    ).required()
});
