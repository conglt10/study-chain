const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
let secretJWT = require('../configs/secret').secret;
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const passport = require('passport');
const passportOauth = require('../configs/passport-oauth');
const signJWT = require('../middlewares/sign-jwt');
const OAUTH_TYPES = require('../configs/constant').OAUTH_TYPES;
const sgMail = require('@sendgrid/mail');

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Register
router.post(
  '/register',
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('password')
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 6 }),
    body('fullname')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isLength({ min: 6 }),
    body('email').isEmail()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ username: req.body.username });

      if (user) {
        return res.status(409).json({
          success: false,
          msg: 'Account already exist'
        });
      }

      let createdUser = {
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password,
        oauthType: OAUTH_TYPES.NO
      };

      const response = await network.registerStudentOnBlockchain(createdUser);
      if (response.success) {
        return res.json({
          success: true,
          msg: response.msg
        });
      }

      return res.status(500).json({
        success: false,
        msg: 'Network Error'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: 'Internal Server Error'
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body('password')
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 6 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ username: req.body.username });

      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'Account is not exist'
        });
      }

      let validPassword = await bcrypt.compare(req.body.password, user.password);

      if (!validPassword) {
        return res.status(403).json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      }

      let token = jwt.sign(
        {
          user: user
        },
        secretJWT
      );

      return res.json({
        success: true,
        fullname: user.fullname,
        msg: 'Login success',
        token: token,
        role: user.role
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: 'Internal Server Error'
      });
    }
  }
);

router.post('/forgotPassword', body('email').isEmail(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        msg: 'User does not exists'
      });
    }

    //Generate and set password reset token
    user.generatePasswordReset();

    await user.save();

    let link = `${process.env.SITE_URL}/getTokenResetPassword/${user.resetPasswordToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Password change request',
      text: `Hi ${user.username} \n 
            Please click on the following link ${link} to reset your password. \n\n 
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    let rel = await sgMail.send(mailOptions);
    console.log(`-------------${rel}`);

    return res.status(200).json({ msg: 'A reset email has been sent to ' + user.email + '.' });
  } catch (error) {
    return res.status(500).json({
      msg: 'Internal server error'
    });
  }
});

router.get('/resetPassword/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ msg: 'Password reset token is invalid or has expired.' });
    }

    return res.json({
      msg: user
    });
  } catch (error) {
    return res.status(500).json({
      msg: 'Internal server error'
    });
  }
});

router.post(
  '/resetPassword/:token',
  body('password')
    .not()
    .isEmpty()
    .isLength({ min: 6 }),
  body('confirmPassword', 'Passwords do not match').custom(
    (value, { req }) => value === req.body.password
  ),
  async (req, res) => {
    try {
      let user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      const mailOptions = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: 'Your password has been changed',
        text: `Hi ${user.username} \n 
              This is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };

      await sgMail.send(mailOptions);
      res.status(200).json({ msg: 'Your password has been updated.' });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal server error'
      });
    }
  }
);

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })
);

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  signJWT.signToken(req, res);
});

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    signJWT.signToken(req, res);
  }
);

module.exports = router;
