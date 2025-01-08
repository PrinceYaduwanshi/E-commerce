const Joi = require("joi");

module.exports.productSchema = Joi.object({
    product : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        image : Joi.string().allow("",null),
        price : Joi.number().required().min(0)
    }).required()
})