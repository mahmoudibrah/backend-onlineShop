const express = require("express");

const cloudinary = require("../utils/cloudinary");
const router = express.Router();
const productModel = require("../models/product");
const { auth, isAdmin } = require("../middleware/auth");

// create
router.post("/", isAdmin, async (req, res) => {
  const { name, brand, price, desc, image } = req.body;
  try {
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        upload_preset: "onlineShop",
      });
      if (uploadRes) {
        const product = new productModel({
          name,
          brand,
          price,
          desc,
          image: uploadRes,
        });
        const saveProduct = await product.save();
       return res.status(200).send(saveProduct);
      }
    }
  } catch (error) {
    console.log(error);
   return res.status(500).send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const product = await productModel.find({});
    res.status(200).send(product);
  } catch (error) {
    console.log(error);
   return res.status(500).send(error);
  }
});

router.get("/find/:id", isAdmin, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
   return res.status(200).send(product);
  } catch (error) {
   return res.status(500).send(error);
    console.log(error);
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) return res.status(404).send("Product not found");

    if (product.image.public_id) {
      const destroyResponse = await cloudinary.uploader.destroy(
        product.image.public_id
      );
      if (destroyResponse) {
        const deletedProduct = await productModel.findByIdAndDelete(
          req.params.id
        );
       return res.status(200).send(deletedProduct);
      }
    } else {
      console.log("Action terminated. Failed to deleted product image ...");
    }
  } catch (error) {
   return res.status(500).send(error);
    console.log(error);
  }
});

// Edit product

router.put("/:id", isAdmin, async (req, res) => {
  if (req.body.productImage) {
    try {
      const destroyResponse = await cloudinary.uploader.destroy(
        req.body.product.image.public_id
      );
      if (destroyResponse) {
        const UploadedRespons = await cloudinary.uploader.upload(req.body.productImage, {
          upload_preset: "onlineShop",
        });
        if (UploadedRespons) {
          const updataProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                ...req.body.product,
                image: UploadedRespons,
              },
            },
            { new: true }
          );
         return res.status(200).send(updataProduct);
        }
      }
    } catch (error) {
      console.log(error);
     return res.status(500).send(error)
    }
  } else {
    try {
      const updataProduct = await productModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body.product },
        { new: true }
      )
     return res.status(200).send(updataProduct)
    } catch (error) {
      console.log(error);
     return res.status(500).send(error)
    }
  }
});

module.exports = router;
