const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        return userData = User.create({
            email: email,
            password: hashedPassword,
            name: name
        });
    })
    .then(result => {
        res.status(201).json({message: 'USer created', userId: result.id});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({
        where: {
            email: email
        }
    })
    .then(user => {
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
        if(!isEqual) {
            err = new Error('wrong password');
            error.statusCode = 401;
            throw err;
        }
        // Generating json webToken
        const token =jwt.sign({
            email: loadedUser.email,
            userId: loadedUser.id
        }, 'secretKey', { expiresIn: '1h'});
        res.status(200).json({token: token, userId: loadedUser.id})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
};

exports.getUSerStatus = (req, res, next) => {
    User.findByPk(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('USer Not found');
                error.status = 404;
                throw error;
            }
            res.status(200).json({message: 'Status Found', status: user.status});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        });
};

exports.updateStatus = (req, res, next) => {
    const newStatus = req.body.status;
    User.findByPk(req.userId)
    .then(user => {
        if (!user) {
            const error = new Error('USer Not found');
            error.status = 404;
            throw error;
        }
        user.status = newStatus;
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'Status updated', status: result});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    });
}