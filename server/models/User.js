const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      required: [true, 'Your username is required']
    },
    email: {
      type: String,
      trim: true,
      default: null
    },
    password: {
      type: String
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    oauthType: {
      type: Number
    },
    role: {
      type: Number,
      required: [true, 'Your role is required']
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', function(next) {
  const SALTROUNDS = 10; // or another integer in that ballpark
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALTROUNDS, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, SALTROUNDS, (error, hash) => {
      if (error) {
        return next(error);
      }

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 600000; //expires in 10min
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
