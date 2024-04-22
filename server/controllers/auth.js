import * as config from "../config.js";
import jwt from "jsonwebtoken";
import { emailTemplate } from "../helpers/email.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import { nanoid } from "nanoid";
import User from "../models/user.js";
import validator from "email-validator";

export const welcome = (req, res) => {
  res.json({
    data: "hello from the api routes",
  });
};

const tokenAndUserResponse = (user, req, res) => {
  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  // since we will send the user as response, we do not want to expose our password
  user.password = undefined;
  user.resetCode = undefined;

  return res.json({
    token,
    refreshToken,
    user,
  });
};

export const preRegister = async (req, res) => {
  // create jwt with email and password, then email a clickable link only when user clicks on
  // the email link, then registration complete
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    // validation
    if (!validator.validate(email)) {
      return res.json({ error: "A valid email is required." });
    }

    if (!password) {
      return res.json({ error: "Password is required." });
    }

    if (password && password.length < 6) {
      return res.json({ error: "Password should be at least 6 characters." });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        error: "Email is taken.",
      });
    }

    const token = jwt.sign({ email, password }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    config.AWSSES.sendEmail(
      emailTemplate(
        email,
        `
        <p>Please click the link below to activate your account.</p>
        <a href="${config.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
        `,
        config.REPLY_TO,
        "Activate your Account"
      ),
      (err, data) => {
        if (err) {
          return res.json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.json({
      data: "Something went wrong, try again!",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = jwt.verify(req.body.token, config.JWT_SECRET);
    const hashedPassword = await hashPassword(password);
    const user = await new User({
      username: nanoid(6),
      email,
      password: hashedPassword,
    }).save();

    tokenAndUserResponse(user, req, res);
  } catch (err) {
    console.log(err);
    return res.json({
      data: "Something went wrong, try again!",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "User doesn't exist.",
      });
    }
    const savedPassword = user.password;
    const match = await comparePassword(password, savedPassword);
    if (!match) {
      return res.json({
        error: "Password isn't correct.",
      });
    }

    tokenAndUserResponse(user, req, res);
  } catch (err) {
    console.log(err);
    return res.json({
      data: "Something went wrong, try again!",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "Could not find a user with that email" });
    }

    const resetCode = nanoid();
    user.resetCode = resetCode;
    user.save();

    const token = jwt.sign({ resetCode }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    config.AWSSES.sendEmail(
      emailTemplate(
        email,
        `
        <p>Please click the link below to access your account.</p>
        <a href="${config.CLIENT_URL}/auth/access-account/${token}">Access My Account</a>
      `,
        config.REPLY_TO,
        "Access your Account"
      ),
      (err, data) => {
        if (err) {
          return res.json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.json({
      data: "Something went wrong, try again!",
    });
  }
};

export const accessAccount = async (req, res) => {
  try {
    const { resetCode } = jwt.verify(req.body.resetCode, config.JWT_SECRET);
    const user = await User.findOneAndUpdate({ resetCode }, { resetCode: "" });
    if (!user) {
      return res.json({
        error: "Something went wrong, try again!",
      });
    }
    tokenAndUserResponse(user, req, res);
    console.log("return -2")
  } catch (err) {
    console.log(err);
    return res.json({
      error: "Something went wrong, try again!",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { _id } = jwt.verify(req.headers.refresh_token, config.JWT_SECRET);
    const user = await User.findById(_id);

    tokenAndUserResponse(user, req, res);
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Refresh token failed" });
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Unauthorized" });
  }
};

export const publicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "User not found" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.json({ error: "Password is required" });
    }
    if (password && password.length < 6) {
      return res.json({ error: "Password should be at least 6 characters" });
    }

    console.log(req.user);

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        password: await hashPassword(password),
      }
    );

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Unauthorized" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  } catch (err) {
    console.log(err);
    if (err.codeName === "DuplicateKey") {
      return res.json({ error: "Username or email is taken" });
    }
    return res.status(403).json({ error: "Unauthorized" });
  }
};
