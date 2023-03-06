const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
   name: {
    type: String,
    required: [true, "product name required"],
    trim: true,
    minlength: [2, "too short product name"],
  },
  desc: {
    type: String,
    required: [true, "product description required"],
    trim: true,
    minlength: [2, "too short product description"],
  },
  brand: {
    type: String,
    required: [true, "Brand name required"],
    trim: true,
    minlength: [2, "too short product description"],
  },
  price: {
    type: Number,
    required: [true, "product price required"],
  },
  image: {
    type : Object,
    required :  [true, "product image required"]
  }
});

module.exports = model("Product", schema);
