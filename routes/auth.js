// const express = require('express');
// const { body } = require('express-validator/check');
// const router = express.Router();
// const User = require('../models/user');
// const authController = require('../controllers/auth');
// const isAuth = require('../middleware/isAuth');

// router.put('/signup', [
//     body('email')
//         .isEmail()
//         .withMessage('Please Enter a valid Email').custom((value, { req }) => {
//             return User.findOne({
//                 where: {
//                     email: value
//                 }})
//                 .then(user => {
//                     if (user) {
//                         return Promise.reject('Email already exists!');
//                     }
//                 })
//         })
//         .normalizeEmail(),
//     body('password').trim().isLength({min: 5}),
//     body('name').trim().notEmpty()
// ],
// authController.signup
// );

// router.post('/login', authController.login);

// router.get('/status', isAuth, authController.getUSerStatus);

// router.put('/status', isAuth, authController.updateStatus);

// module.exports = router;