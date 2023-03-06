const userModel = require("../models/user");

const { auth, isUser, isAdmin } = require("../middleware/auth");

const moment = require("moment");

const router = require("express").Router();
const bcrypt = require('bcrypt')


// GEt all user
router.get("/" , isAdmin , async(req, res)=> {
  try {
    const users = await userModel.find().sort({_id: -1})
   return res.status(200).send(users)
  } catch (error) {
   return res.status(500).send(error)
    
  }
})
//Get user 
router.get("/find/:id" , isUser,async(req , res)=> {
  try {
    const user = await userModel.findById(req.params.id)
   return res.status(200).send({
      _id : user._id,
      name : user.name,
      eamil : user.email,
      isAdmin : user.isAdmin
    })
  } catch (error) {
   return res.status(500).send(error)
  }
})

//Update user 
router.put("/:id" , isUser , async(req, res)=> {
  try {
    const user = await userModel.findById(req.params.id)
    //// mido@yahoo.com | ahmed@yahoo.com      
    if(!(user.email === req.body.email)) {
      const emailInUser =  await userModel.findOne({email: req.body.email})
      if(emailInUser) {
        console.log("That email is already tokenn...." );
        return res.status(400).send("That email is already tokenn....")
      }
    }
    if(req.body.password && user) {
      const salt = await bcrypt.genSalt(5)
      const hashedPassword = await bcrypt.hash(req.body.password  , salt)
      user.password = hashedPassword
    }
    const upadatedUser = await userModel.findByIdAndUpdate(req.params.id , {
      name : req.body.name,
      email : req.body.email,
      isAdmin : req.body.isAdmin,
      password: user.password
    }, {
      new: true
    })

   return res.status(200).send({
      _id : upadatedUser._id,
      name : upadatedUser.name,
      email : upadatedUser.email,
      isAdmin : upadatedUser.isAdmin,
    })
  } catch (error) {
    
  }
})



// Deleted 
router.delete("/:id" , isAdmin , async(req ,res)=> {
  try {
    const deletedUsers = await userModel.findByIdAndDelete(req.params.id)
   return res.status(200).send(deletedUsers)
  } catch (error) {
   return res.status(500).send(error)
  }
})



// GET user Stats
router.get("/stats", isAdmin ,  async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const users = await userModel.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
   return res.status(200).send(users)
  } catch (error) {
    console.log(error);
   return res.status(500).send(error);
  }
});

module.exports = router;
