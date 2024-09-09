const SECRET_KEY = process.env.SECRET_KEY;
const md5 = require("md5");
const jwt = require('jsonwebtoken');
const User = require("../Models/user.model");
const ForgotPassword = require("../Models/forgot-password.model");

const generateHelper = require("../../../helper/generate.helper");
const sendMailHelper = require("../../../helper/sendMail.helper");

// [POST] /api/v1/user/register
module.exports.register = async (req, res) => {
  req.body.password = md5(req.body.password);

  const existEmail = await User.findOne(
    {
      email: req.body.email,
    },
    {
      deteled: false,
    }
  );

  if (existEmail) {
    res.json({
      code: 400,
      message: "Email already exists!",
    });
  } else {
    const tokenJWT = jwt.sign(
      { email: req.body.email }, // Payload
      SECRET_KEY, // Khóa bí mật
      { expiresIn: "10s" } // Thời gian hết hạn của token
    );

    const user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      token: tokenJWT,
    });

    user.save();

    const token = user.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Register new user successfully!",
      token: token,
    });
  }
};

// [POST] /api/v1/user/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne(
    {
      email: email,
    },
    {
      deleted: false,
    }
  );

  if (!user) {
    res.json({
      code: 400,
      message: "Email do not exist!",
    });
    return;
  }

  if (md5(password) !== user.password) {
    res.json({
      code: 400,
      message: "Wrong password!",
    });
    return;
  }

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Login Successfully!",
    token: token,
  });
};

// [POST] /api/v1/user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({email: email,},{deteled: false,}
  );

  if (!user) {
    res.json({
      code: 400,
      message: "Email do not already exists!",
    });
    return;
  }

  const otp = generateHelper.generateRandomNumber(6);
  const timeExpire = 3;

  // Store data
  const objForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire * 1000 * 60,
  };
  const forgotPassword = new ForgotPassword(objForgotPassword);
  await forgotPassword.save();

  // Send OTP
  const subject = "OTP code to verify and retrieve password";
  const html = `The OTP code to retrieve your password is <b>${otp}</b> (Use within ${timeExpire} minutes)`;

  sendMailHelper.sendEmail(email, subject, html);

  res.json({
    code: 200,
    message: "OTP code sent via Email!",
  });
};

module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    res.json({
      code: 400,
      message: "OTP do not valid",
    });
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Authentication successful!",
    token: token,
  });
};

module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token,
  });

  if (md5(password) === user.password) {
    res.json({
      code: 400,
      message: "Please enter a new password!",
      token: token,
    });
    return;
  }

  await User.updateOne(
    {
      token: token,
    },
    {
      password: md5(password),
    }
  );

  res.json({
    code: 200,
    message: "Reset password successful!",
  });
};

module.exports.detail = async (req, res) => {
  res.json({
    code: 200,
    message: "Successfully!!!",
    info: req.user
  });
}
