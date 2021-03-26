const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Post = sequelize.define('post', {
    title: {
        type: Sequelize.STRING,
        required: true
    },
    imageUrl: {
        type: Sequelize.STRING,
        required: true
    },
    content: {
        type: Sequelize.STRING,
        required: true
    },
    creator: {
        type: Sequelize.JSON,
        required: true
    }
});

module.exports = Post;