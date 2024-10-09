// IMPORT SECTION
const jwt = require('jsonwebtoken')
const errorMessages = require('../util/error.messages')

/**
 * This method will check JWT token
 * @param {*} req
 * @param {*} res
 * @param {*} callback return decoded payload
 * @author Rajendra Singh
 */
const checkToken = (req, res, callback) => {

    // Express headers are auto converted to lowercase
    let token = req.headers['x-access-token'] || req.headers.authorization

    if (token != undefined && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length)
    }

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                delete err.stack
                console.error('[middleware.js]: checkToken(): jwt.verify(): error: %o', err)
                return res.status(401).json({
                    success: false,
                    message: errorMessages.AUTH_TOKEN_IS_NOT_VALID
                })
            } else {
                if (Object.prototype.hasOwnProperty.call(decoded, 'isVerifyOtp')) {
                    console.error('[middleware.js]: checkToken(): jwt.verify(): error: %s', errorMessages.VERIFY_OTP_TOKEN_IS_NOT_ALLOWED_FOR_ALL_REQUEST)
                    return res.status(401).json({
                        success: false,
                        message: errorMessages.AUTH_TOKEN_IS_NOT_VALID
                    })
                }

                console.info('[middleware.js]: checkToken(): jwt.verify(): success')
                req.decoded = decoded
                callback(decoded)
            }
        })
    } else {
        return res.status(401).json({
            success: false,
            message: errorMessages.AUTH_TOKEN_IS_NOT_SUPPLIED
        })
    }
}

/**
 * This method will validate the access token,
 * if it is not valid then it will give unauthorized
 * response to client otherwise allow to go next.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @author Rajendra Singh
 */
const checkAccessToken = (req, res, next) => {
    checkToken(req, res, function (decoded) {
        if (decoded.sub != 'access') {
            return res.status(401).json({
                success: false,
                message: errorMessages.AUTH_TOKEN_IS_NOT_ACCESS_TOKEN
            })
        } else {
            next()
        }
    })
}

module.exports = {
    checkAccessToken
}
