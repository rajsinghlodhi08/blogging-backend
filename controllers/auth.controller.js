const User = require('../db/models/user')
const Joi = require('joi')
const formatJoiToForms = require('joi-errors-for-forms').form
const md5 = require('md5')
const errorMessages = require('../util/error.messages')
const utils = require('../util/utils')

/**
 * Register a new user
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @Author Rajendra Singh
 */

module.exports.register = async function (req, res) {
    try {
        const userSchema = Joi.object({
            username: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('author', 'admin').default('author')
        })

        const { error, value} = userSchema.validate(req.body, {
            abortEarly: false
        })
        if (error) {
            const convertErrors = formatJoiToForms()
            const validationError = convertErrors(error)
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                response: validationError
            })
        }

        const { username, email, password, role } = value

        // Check if the user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        // Hash the password
        const hashedPassword = md5(password)

        // Create a new user
        const user = await User.create({ username, email, password: hashedPassword, role })
        const jwtToken = utils.generateAuthToken(username, user.email, user._id, role)
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                userId: user._id,
                username: user.username,
                // email: user.email,
                role: user.role,
                accessToken: jwtToken.access,
                refreshToken: jwtToken.refresh
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

/**
 * @function login
 * @description This API is used to authenticate and authorize a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing the error or success message.
 * @throws {Error} - If there is a validation error or invalid username or password.
 * @Author Rajendra Singh
 */
module.exports.login = async function (req, res) {
    const userSchema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().min(6).required()
    })

    const { error, value} = userSchema.validate(req.body, {
        abortEarly: false
    })

    if (error) {
        const convertErrors = formatJoiToForms()
        const validationError = convertErrors(error)
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            response: validationError
        })
    }

    const username = value.username
    const password = md5(value.password)

    const user = await User.findOne({ username })

    if (!user) {
        return res.status(401).json({
            success: false,
            message: errorMessages.INVALID_USERNAME_OR_PASSWORD
        })
    }

    if (user.username) {
        if (username != user.username && password != user.password) {
            return res.status(401).json({
                success: false,
                message: errorMessages.INVALID_USERNAME_OR_PASSWORD
            })
        }
    }

    const jwtToken = utils.generateAuthToken(username, user.email, user._id, user.role)
    return res.status(201).json({
        success: true,
        message: 'Login Successful',
        user: {
            userId: user._id,
            username: user.username,
            role: user.role,
            accessToken: jwtToken.access,
            refreshToken: jwtToken.refresh
        }
    })
}
