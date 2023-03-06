const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. not Authentication");
  try {
    const secret = process.env.JWT_SECRET_KEY;
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).send("Access denied. Invalid auth token");
  }
};



const isAdmin = (req, res, next) => {
    auth(req ,res , ()=> {
        if(req.user.isAdmin) {
            next()
        }else {
            res.status(403).send("Asccess denied. not Authorized  ")
        }
    })
};

const isUser = (req , res , next)=> {
  auth(req , res , ()=> {
    if(req.user._id === req.params.id || req.user.isAdmin) {
      next()
    }else {
      res.status(403).send("Asccess denied. not Authorized  ")
    }
  })
}


module.exports = {auth ,  isUser , isAdmin }