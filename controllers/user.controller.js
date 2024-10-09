// Import Section

const User = require('../db/models/user')
const Joi = require('joi')
const formatJoiToForms = require('joi-errors-for-forms').form
const md5 = require('md5')

module.exports.get = async function (req, res) {
    try {
        const userId = req.decoded.userId
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            response: user
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

module.exports.update = async function (req, res) {
    try {
        const userSchema = Joi.object({
            username: Joi.string().trim(),
            email: Joi.string().email(),
            password: Joi.string().min(6),
        }).or('username', 'email', 'password')

        const { error, value } = userSchema.validate(req.body, {
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

        const { username, email, password } = value
        const userId = req.decoded.userId

        // Check if the user exists
        const existingUser = await User.findById(userId)
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Update user fields only if they are provided
        if (username) existingUser.username = username
        if (email) existingUser.email = email
        if (password) existingUser.password = md5(password)

        // Save the updated user
        await existingUser.save()

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                username: existingUser.username
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

module.exports.delete = async function (req, res) {
    try {
        const userId = req.decoded.userId
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Delete the user
        await user.deleteOne()

        return res.status(200).json({
            success: true,
            message: 'Your account has been deleted successfully'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}