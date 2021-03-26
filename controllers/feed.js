const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.count()
    .then(count => {
      totalItems = count;
      return Post.findAll({
        offset: (currentPage - 1) * perPage,
        limit: perPage
      })
    })
    .then(posts => {
      res.status(200).json({message: 'Posts found', posts: posts, totalItems: totalItems});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  console.log(req.body);
  Post.create({
    title: title,
    content: content, 
    imageUrl: imageUrl,
    userId: req.userId,
    creator: {
      name: req.email.split('@')[0]
    }
  })
  .then(result => {
    console.log(result);
    return res.status(201).json({
      message: 'Post created successfully!',
      post: result
    });
    
  })
  .then(() => {
    res.redirect('/feed/posts');
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(req.params.postId);
  Post.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post unavailable');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({message: 'Post fetched', post: post});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = '';//req.file.path.replace("\\", "/");
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error('no file picked');
    error.statusCode = 422;
    throw error;
  }
  Post.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post unavailable');
        error.statusCode = 404;
        throw error;
      }
      if(post.userId !== req.userId) {
        const error = new Error('Not Authorized');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({message: 'Post updated', post: result});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  console.log('reqparam');
  console.log(req.params.postId);
  Post.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post unavailable');
        error.statusCode = 404;
        throw error;
      }
      if(post.userId !== req.userId) {
        const error = new Error('Not Authorized');
        error.statusCode = 403;
        throw error;
      }
      // checkthe user
      clearImage(post.imageUrl);
      return post.destroy();
    })
    .then(result => {
      res.status(200).json({message: 'Deleted Post'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    console.log(err);
  })
}
