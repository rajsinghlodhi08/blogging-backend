// IMPORT SECTION
const express = require('express')
const router = express.Router()

const middleware = require('../middleware/middleware')
const blogController = require('../controllers/blog.controller')
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

// User Controller Routes
router.get('/user', [middleware.checkAccessToken], userController.get)
router.put('/user', [middleware.checkAccessToken], userController.update)
router.delete('/user', [middleware.checkAccessToken], userController.delete)

// Blog Controller Routes
router.post('/blogs', [middleware.checkAccessToken], blogController.create)
router.get('/blogs/:id', blogController.get)
router.put('/blogs/:id', [middleware.checkAccessToken], blogController.update)
router.delete('/blogs/:id', [middleware.checkAccessToken], blogController.delete)
router.get('/blogs', blogController.list)
router.put('/blogs/read/:id', blogController.read)

// Auth Controller Routes
router.post('/auth/register', authController.register)
router.post('/login', authController.login)

module.exports = router
