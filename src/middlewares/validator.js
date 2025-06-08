const responseLib = require('../libs/responseLib');
const Joi = require('joi').extend(require('@joi/date'));

// New
const registerUserVaidatorSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required()
})

const loginUserValidatorSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
})

const addToDoValidatorSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.string().required(),
    priority: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).default([])
})

const registerUserValidate = async (req, res, next) => {
    try {
        const value = await registerUserVaidatorSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            throw new Error(value.error);
        }
        else {
            next();
        }
    } catch (error) {
        let apiResponse = responseLib.generate(true, ` ${error.message}`, null);
        res.status(400);
        res.send(apiResponse)
    }
}

const loginUserValidate = async (req, res, next) => {
    try {
        const value = await loginUserValidatorSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            throw new Error(value.error);
        }
        else {
            next();
        }
    } catch (error) {
        let apiResponse = responseLib.generate(true, ` ${error.message}`, null);
        res.status(400);
        res.send(apiResponse)
    }
}

const addToDoValidate = async (req, res, next) => {
    try {
        const value = await addToDoValidatorSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            throw new Error(value.error);
        }
        else {
            next();
        }
    } catch (error) {
        let apiResponse = responseLib.generate(true, ` ${error.message}`, null);
        res.status(400);
        res.send(apiResponse)
    }
}

// New

module.exports = {
    // new
    registerUserValidate: registerUserValidate,
    loginUserValidate: loginUserValidate,
    addToDoValidate: addToDoValidate
}