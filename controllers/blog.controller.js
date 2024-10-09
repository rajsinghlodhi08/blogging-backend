// Import Section
const Blog = require('../db/models/blog')
const User = require('../db/models/user')
const Joi = require('joi')
const formatJoiToForms = require('joi-errors-for-forms').form

module.exports.create = async function (req, res) {
    try {
        const blogSchema = Joi.object({
            title: Joi.string().trim().required(),
            content: Joi.string().required(),
            tags: Joi.array().items(Joi.string().trim()).default([]),
        })

        const { error, value } = blogSchema.validate(req.body, {
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

        const { title, content, tags } = value
        const blog = new Blog({
            title,
            content,
            author: req.decoded.userId,
            tags,
        })
        await blog.save()
        return res.status(200).json({
            success: true,
            message: 'Blog created successfully',
            response: blog
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

module.exports.get = async function (req, res) {
    try {
        const blogId = req.params.id

        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required'
            })
        }

        const blog = await Blog.findById({ _id: blogId })
        const user = await User.findById(blog.author).select('username')
        const blogWithUsername = {
            ...blog.toObject(),
            username: user.username
        }

        return res.status(200).json({
            success: true,
            message: 'Blog retrieved successfully',
            response: blogWithUsername
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

        const blogId = req.params.id
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required'
            })
        }

        const blogSchema = Joi.object({
            // id: Joi.string().required(),
            title: Joi.string().trim(),
            content: Joi.string(),
            tags: Joi.array().items(Joi.string().trim()).default([])
        }).or('title', 'content', 'tags')

        const { error, value } = blogSchema.validate(req.body, {
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

        const { title, content, tags } = value

        // Find the blog post by ID
        const blog = await Blog.findById(blogId)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            })
        }

        // Check if the user is the author
        if (req.decoded.role !== 'admin' && blog.author.toString() !== req.decoded.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this blog post'
            })
        }

        // Update fields only if they are provided
        if (title) blog.title = title
        if (content) blog.content = content
        if (tags) blog.tags = tags

        // Save the updated blog post
        await blog.save()

        return res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            response: blog
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
        const blogId = req.params.id

        // Check if the ID is provided
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required'
            })
        }

        // Find the blog post by ID
        const blog = await Blog.findById(blogId)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            })
        }

        // Check if the user is the author
        if (req.decoded.role !== 'admin' && blog.author.toString() !== req.decoded.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this blog post'
            })
        }

        // Delete the blog post
        await Blog.deleteOne({ _id: blogId})

        return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

module.exports.list = async function (req, res) {
    try {
        const blogSchema = Joi.object({
            limit: Joi.number().default(10),
            page: Joi.number().default(1),
            title: Joi.string().trim(),
            tags: Joi.string()
        })

        const { error, value } = blogSchema.validate(req.query, {
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

        const findBlogWhereOptions = {
            // author: req.decoded.userId
        }

        if (value.title) {
            findBlogWhereOptions.title = { $regex: value.title, $options: 'i' }
        }

        if (value.tags) {
            findBlogWhereOptions.tags = { $in: value.tags.split() }
        }
        const allBlogs = await Blog.find(findBlogWhereOptions)
        .skip((value.page - 1) * value.limit)
        .limit(value.limit)
        .sort({ updatedAt: -1 })

        const totalBlogs = await Blog.countDocuments(findBlogWhereOptions)

        const blogsWithUsernames = await Promise.all(allBlogs.map(async blog => {
            const user = await User.findById(blog.author).select('username')
            return {
                ...blog.toObject(),
                username: user ? user.username : 'Unknown'
            }
        }))

        const totalPages = Math.ceil(totalBlogs / value.limit)

        return res.status(200).json({
            success: true,
            message: 'Blog retrieved successfully',
            response: {
                totalBlogs,
                totalPages,
                currentPage: value.page,
                allBlogs: blogsWithUsernames,
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

module.exports.read = async function (req, res) {
    try {

        const blogId = req.params.id
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required'
            })
        }

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { views: 1 } },
            { new: true }
        )
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Blog views updated successfully',
            response: blog.views
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
