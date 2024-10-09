// Import Section

const jwt = require('jsonwebtoken')

module.exports.generateAuthToken = function (username, email, userId, role) {
    const user = {
        username,
        email,
        userId,
        role
    }
    const atoken = jwt.sign(user,
        process.env.JWT_SECRET_KEY,
        { subject: 'access', expiresIn: String(process.env.JWT_ACCESS_TOKEN_TIME) }
    )
    const adecoded = jwt.verify(atoken, process.env.JWT_SECRET_KEY)

    // Generate Refresh Token
    const rtoken = jwt.sign(user,
        process.env.JWT_SECRET_KEY,
        { subject: 'refresh', expiresIn: String(process.env.JWT_REFRESH_TOKEN_TIME) }
    )

    const authToken = {
        access: atoken,
        access_expire_time: adecoded.exp,
        refresh: rtoken
    }

    return authToken
}
