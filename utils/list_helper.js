const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const maxLikes = Math.max(...likes)
    const ans = blogs.find(blog => blog.likes === maxLikes)
    return {title: ans.title, author: ans.author, likes: ans.likes}
}

const mostBlogs = (blogs) => {
    // Use _.countBy to count the blogs for each author
    const authorCounts = _.countBy(blogs, 'author');
    // Use _.maxBy to find the author with the most blogs
    const maxAuthor = _.maxBy(_.keys(authorCounts), (author) => authorCounts[author]);
    return { author: maxAuthor, blogs: authorCounts[maxAuthor] };
};

const mostLikes = (blogs) => {
    // Use _.groupBy to group the blogs by author
    const blogsByAuthor = _.groupBy(blogs, 'author');
    // Use _.map to iterate through the groups
    const likesByAuthor = _.map(blogsByAuthor, (blogs, author) => {
        // Use _.sumBy to sum the likes for the current author
        const likes = _.sumBy(blogs, 'likes');
        return { author, likes };
    })
    // Use _.maxBy to find the author with the most likes
    return _.maxBy(likesByAuthor, 'likes');
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}