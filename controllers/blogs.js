const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const { userExtractor, tokenExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const { id } = request.params
    const blog = await Blog.findById(id)
    if (!blog) {
        return response.status(400).json({ error: 'malformatted id' })
    }
    response.json(blog)
})

blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    if (!body.title || !body.url)
        return response.status(400).json({ error: 'Title and URL are required' })
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id,
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', tokenExtractor, userExtractor, async (request, response) => {
    const { id } = request.params
    const body = request.body
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    // Find the blog post by its ID
    const blog = await Blog.findById(id)
    // Check if the blog post exists
    if (!blog) {
        return response.status(404).json({ error: 'Blog not found' })
    }
    if (blog.user.toString() !== decodedToken.id.toString()) {
        return response.status(403).json({ error: 'Permission denied' })
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { likes: body.likes },
    )
    response.json(updatedBlog)
})

blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response) => {
    const { id } = request.params
    // Check if the request has a valid token for authentication
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'Token invalid' })
    }
    // Find the blog post by its ID
    const blog = await Blog.findById(id)
    // Check if the blog post exists
    if (!blog) {
        return response.status(404).json({ error: 'Blog not found' })
    }
    // Check if the user making the request is the owner of the blog
    if (blog.user.toString() !== decodedToken.id.toString()) {
        return response.status(403).json({ error: 'Permission denied' })
    }
    // Remove the blog post from the database
    await Blog.findByIdAndRemove(id)
    // Remove the blog post from the user's blogs array
    const user = request.user
    user.blogs = user.blogs.filter((userBlogId) => userBlogId.toString() !== id.toString())
    await user.save()
    response.status(204).end()
})

module.exports = blogsRouter