const ListHelper = require('../utils/list_helper')

describe('favorite blog', () => {
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyleft_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        },
        {
            _id: '5a422aa71b54a676234d17f9',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyleft_violations/Go_To_Considered_Harmful.html',
            likes: 6,
            __v: 0
        }
    ]
    test('Blog with the most likes', () => {
        const result = ListHelper.favoriteBlog(listWithOneBlog)
        expect(result).toEqual({ title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 6 })
    })
})