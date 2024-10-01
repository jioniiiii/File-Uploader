const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.signUpGet = (req, res) => {
    res.render('sign-up', { title: 'Sign-up' });
};

exports.logInGet = (req, res) => {
    res.render('log-in', { title: 'Log-in'});
};

exports.signUpPost = [
    //validation checks
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one digit.'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if(value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }
        return true;
      }),
    body('email')
      .custom(async (value) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: value },
        });
        if(existingUser) {
          throw new Error('email is already in use.');
        }
        return true;
      }),
  
    async (req, res, next) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.render('sign-up', { title: 'Sing-up' });//add error
      }
      
      //hash and store the password
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        await prisma.user.create({
          data: {
            email: req.body.email,
            password: hashedPassword,
          },
        });
  
        res.render('log-in', { title: 'Log-in' });
      } catch(err) {
        return next(err);
      }
    }
];

exports.logInPost = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if(err) {
        return next(err); 
      }
      if(!user) {
        
        return res.render('log-in', {
          title: 'Log In',
          error: info.message 
        });
      }
      req.logIn(user, (err) => {
        if(err) {
          return next(err); 
        }
        req.session.userId = user.id;
        return res.redirect('/dashboard'); 
      });
    })(req, res, next); 
};

exports.logOut = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/log-in'); 
    });
  });
};