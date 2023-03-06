const orderModel = require("../models/order");

const { auth, isUser, isAdmin } = require("../middleware/auth");

const moment = require("moment");

const router = require("express").Router();

// get orders
router.get("/", isAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const order = query
      ? await orderModel.find().sort({ _id: -1 }).limit(4)
      : await orderModel.find().sort({ _id: -1 });
    return res.status(200).send(order);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// GET Orders Stats
router.get("/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const orders = await orderModel.aggregate([
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
    return res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// get Income Stats
router.get("/income/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const income = await orderModel.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    return res.status(200).send(income);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// get 1 Week sales Stats
router.get("/week-sales", isAdmin, async (req, res) => {
  const last7Days = moment()
    .day(moment().day() - 7)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const income = await orderModel.aggregate([
      {
        $match: { createdAt: { $gte: new Date(last7Days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);
    return res.status(200).send(income);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});



// updata order 
router.put("/:id" ,isAdmin, async (req , res)=> {
  try {
    const UpdataOrder = await orderModel.findByIdAndUpdate(req.params.id , {
      $set : req.body
    }, {new :true})
    return res.status(200).send(UpdataOrder)
  } catch (error) {
    return res.status(500).send(UpdataOrder)
    
  }
})


// findON order 

router.get("/findOne/:id" , auth , async(req , res)=> {
  try {
    const order = await orderModel.findById(req.params.id)
    if( req.user._id !== order.userId || !req.user.isAdmin  ) {
      return res.status(403).send("Access denied. not authorized ")
    }
    return res.status(200).send(order)
  } catch (error) {
    
  }
})








module.exports = router;
