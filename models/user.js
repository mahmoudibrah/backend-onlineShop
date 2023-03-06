const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  name: {
    type: String,
    required: [true, "user name required"],
    trim: true,
    minlength: [3, "too short user name"],
    maxlength : [30 , "too long username" ]
  },
  email: {
    type: String,
    required: [true, "email required"],
    trim: true,
    unique: [true, "email must be unique"],
  },
  password: {
    type: String,
    required: [true, "password required"],
    minlength: [6, "minlength 6 characters"],
  },
  isAdmin : {
    type : Boolean,
    default : false
  }
}, {
  timestamps: true
});

module.exports = model("User", schema);
