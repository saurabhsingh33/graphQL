const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const Post = require('../models/post');
const { clearImage } = require('../util/image');

module.exports = {
    createUser: async function( { userInput }, req) {
        // const email = args.userInput.email
        const errors = []
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is Invalid' });
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})) {
            errors.push({ message: 'Password too short'});
        }
        if(errors.length > 0) {
            const error = new Error('Invalid input');
            throw error;
        }
        const existingUser = await User.findOne({
            where: { email: userInput.email}
        });
        if (existingUser) {
            const error = new Error('User already exists');
            throw error;
        }
        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = await User.create({
            email: userInput.email,
            name: userInput.name,
            password: hashedPw
        });
        console.log(user);
        return { ...user, id: user.id, email: user.email };
    },
    login: async function({email, password}) {
        const user = await User.findOne({
            where: {email: email}
        });
        if(!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, 'somesupersecret', {expiresIn: '1h'});
        return {token: token, userId: user.id.toString()};
    },
    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title)) {
            errors.push({ message: 'ENter a title'});
        }
        if (validator.isEmpty(postInput.content)) {
            errors.push({ message: 'Enter some content'});
        }
        if(errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findByPk(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }
        const post = await Post.create({
            title: postInput.title,
            content: postInput.content,
            image: postInput.imageUrl,
            userId: req.userId,
            creator: req.email
        });
        return {...post, id: post.id, title: post.title, content: post.content}
    },
    posts: async function(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const totalPosts = await Post.count();

        const posts = await Post.findAll();

        return {posts: posts.map(p => {
            return {...p, id: p.id}
        }), totalPosts: totalPosts};
    },
    post: async function({ postId }) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            const error = new Error('No post found');
            error.code = 404;
            throw error;
        }
        return {
            ...post,
            id: post.id
        }
    },
    updatePost: async function ({id, postInput}, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const post = await Post.findByPk(id);
        if (!post) {
            const error = new Error('No post found');
            error.code = 404;
            throw error;
        }
        if (post.userId.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized');
            error.code = 403;
            throw error;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title)) {
            errors.push({ message: 'ENter a title'});
        }
        if (validator.isEmpty(postInput.content)) {
            errors.push({ message: 'Enter some content'});
        }
        if(errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        post.title = postInput.title;
        post.content = postInput.content;
        if (postInpu.imageUrl !== 'undefined') {
            post.imageUrl = postInput.imageUrl;
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost,
            id: updatedPost.id
        };
    },
    deletePost: async function({id}, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const post = await Post.findByPk(id);
        if (!post) {
            const error = new Error('No post found');
            error.code = 404;
            throw error;
        }
        if (post.userId.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized');
            error.code = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        await post.destroy();
        return true;
    },
    user: async function(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const user = await await User.findByPk(req.userId);
        if (!user) {
            const error = new Error('No user found');
            error.code = 404;
            throw error;
        }
        return {...user, id: user.id };
    },
    updateStatus: async function({status}, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated');
            error.code = 401;
            throw error;
        }
        const user = await User.findByPk(req.userId);
        if (!user) {
            const error = new Error('No user found');
            error.code = 404;
            throw error;
        }
        user.status = status;
        await user.save();
        return {...user, id: user.id};
    }
}