const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");

const getAuthToken = require("../utils/genAuthToken");
const userModel = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(30),
});
const { error } = schema.validate(req.body);
if (error) return res.status(400).send(error.details[0].message);


let user = await userModel.findOne({email: req.body.email})
if (user) return res.status(400).send("eamil already exist..");

user = new userModel({
  name: req.body.name,
  email: req.body.email,
  password: req.body.password,
});


const salt = await bcrypt.genSalt(5);
user.password = await bcrypt.hash(user.password, salt);

 user =  await user.save();
const token = getAuthToken(user);
return  res.send(token);
});

module.exports = router;




// const { name, email, password } = req.body;
// const user = await userModel.findOne({ email });
// if (user) return res.json({ message: "Account already exists " });
// bcrypt.hash(password, 4, async function (err, hash) {
//   await userModel.insertMany({ name, email, password: hash });
//   const secretKey = process.env.JWT_SECRET_KEY;
//   var token = jwt.sign(
//     { _id: user._id, name: user.name, email: user.email },
//     secretKey
//   );
//   res.send(token);
// });