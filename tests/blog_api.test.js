const app = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb } = require('../utils/api_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

describe('Checking the http get all request', () => {

    let response
    // Define response variable outside of the test cases

    beforeAll(async () => {
        // Perform the asynchronous GET request before running the tests
        response = await api.get('/api/blogs')
    })

    test('Checking the status code', () => {expect(response.status).toBe(200)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking the length of the response', () => {expect(response.body).toHaveLength(initialBlogs.length)})
    test('Checking the name of the id attribute', () => {response.body.forEach(blog => {expect(blog.id).toBeDefined()})})

})

describe('Checking the http get single valid request', () => {

    let blogsAtStart
    let blogToView
    let response

    beforeAll(async () => {
        // Perform the asynchronous operations before running the tests
        blogsAtStart = await blogsInDb()
        blogToView = blogsAtStart[0]
        response = await api.get(`/api/blogs/${blogToView.id}`)
    })

    test('Checking the status code', () => {expect(response.status).toBe(200)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking the response', () => {expect(response.body).toEqual(blogToView)})

})

describe('Checking the http get single invalid request', () => {

    let response
    const invalidId = '5a3d5da59070081a82a3445'

    beforeAll(async () => {
        // Perform the asynchronous GET request before running the tests
        response = await api.get(`/api/blogs/${invalidId}`)
    })

    test('Checking the status code', () => {expect(response.status).toBe(400)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking the response', () => {expect(response.body.error).toEqual('malformatted id')})

})

describe('Checking the successful http post request', () => {

    let response
    let blogsAtEnd
    const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'https://reactpatterns.com/',
        likes: 2
    }

    beforeAll(async () => {
        // Perform the asynchronous POST request and get the updated blogs before running the tests
        response = await api.post('/api/blogs').send(newBlog)
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code', () => {expect(response.status).toBe(201)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the blog is added to the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)})

})

describe('Checking the unsuccessful http post request', () => {

    let response1
    let response2
    let blogsAtEnd
    const newBlog1 = {
        author: 'Robert C. Martin',
        url: 'https://reactpatterns.com/',
        likes: 2
    }
    const newBlog2 = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        likes: 2
    }

    beforeAll(async () => {
        // Perform the asynchronous POST requests and get the updated blogs before running the tests
        response1 = await api.post('/api/blogs').send(newBlog1)
        response2 = await api.post('/api/blogs').send(newBlog2)
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code for the blog without title', () => {expect(response1.status).toBe(400)})
    test('Checking the content type for the blog without url', () => {expect(response1.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the blog without title is added to the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length)})
    test('Checking the status code for the blog without url', () => {expect(response2.status).toBe(400)})
    test('Checking the content type for the blog without url', () => {expect(response2.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the blog without url is added to the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length)})

})

describe('Checking the default functionality of the likes attribute', () => {

    let response

    beforeAll(async () => {
        // Perform the asynchronous POST request before running the test
        const newBlog = {
            title: 'Type wars',
            author: 'Robert C. Martin',
            url: 'https://reactpatterns.com/'
        }
        response = await api.post('/api/blogs').send(newBlog)
    })

    test('Checking the status code', () => {expect(response.status).toBe(201)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the default likes value is 0', () => {expect(response.body.likes).toBe(0)})

})


describe('Checking successful HTTP PUT request', () => {

    let blogsAtStart
    let blogToUpdate
    let updatedLikes
    let response
    let blogsAtEnd

    beforeAll(async () => {
        // Perform the asynchronous operations before running the tests
        blogsAtStart = await blogsInDb()
        blogToUpdate = blogsAtStart[0]
        updatedLikes = blogToUpdate.likes + 1
        response = await api.put(`/api/blogs/${blogToUpdate.id}`).send({ likes: updatedLikes })
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code', () => {expect(response.status).toBe(200)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the likes are updated in the database', () => {
        expect(blogsAtEnd).toHaveLength(initialBlogs.length)
        const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
        expect(updatedBlog.likes).toBe(updatedLikes)
    })

})

describe('Checking unsuccessful HTTP PUT request', () => {

    let response
    let blogsAtEnd
    const invalidId = '5a3d5da59070081a82a3445'

    beforeAll(async () => {
        // Perform the asynchronous operations before running the tests
        response = await api.put(`/api/blogs/${invalidId}`).send({ likes: 10 })
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code', () => {expect(response.status).toBe(400)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the likes are updated in the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length)})

})


describe('Checking the successful http delete request', () => {

    let blogsAtStart
    let blogToDelete
    let response
    let blogsAtEnd

    beforeAll(async () => {
        // Perform the asynchronous operations before running the tests
        blogsAtStart = await blogsInDb()
        blogToDelete = blogsAtStart[0]
        response = await api.delete(`/api/blogs/${blogToDelete.id}`)
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code', () => {expect(response.status).toBe(204)})
    test('Checking whether the blog is deleted from the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)})

})

describe('Checking the unsuccessful http delete request', () => {

    let response
    let blogsAtEnd
    const invalidId = '5a3d5da59070081a82a3445'

    beforeAll(async () => {
        // Perform the asynchronous operations before running the tests
        response = await api.delete(`/api/blogs/${invalidId}`)
        blogsAtEnd = await blogsInDb()
    })

    test('Checking the status code', () => {expect(response.status).toBe(400)})
    test('Checking the content type', () => {expect(response.headers['content-type']).toMatch(/application\/json/)})
    test('Checking whether the blog is deleted from the database', () => {expect(blogsAtEnd).toHaveLength(initialBlogs.length)})

})

afterAll(() => {
    mongoose.connection.close()
})