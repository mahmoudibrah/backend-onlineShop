// process.on("uncaughtException", (err)=> {
//     console.log("uncaughtException" ,err );
// })

require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const port =  5000
const Url = process.env.DB_URI
const cors = require('cors')

const products  = require('./product')
const register =  require('./routes/register')
const login =  require('./routes/login')
const stripe = require('./routes/stripe')
const productsRouter = require('./routes/products')
const users = require('./routes/user')
const orders = require('./routes/order')

app.use(express.json())
app.use(cors())

app.use("/api/register" , register)
app.use("/api/login" , login)
app.use("/api/stripe" , stripe)
app.use('/api/products' , productsRouter)
app.use('/api/users' , users)
app.use('/api/orders' , orders)

app.get("/products" , (req , res)=> {
    res.json(products)
} )
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

mongoose.connect(Url).then(()=> console.log('MongoDB connection success...')).catch((error)=> console.log("MongoDB connetion failed..", error.message))


// any error outside express 
// process.on("unhandledRejection" , (err)=> {
//     console.log("unhandledRejection" , err);
// })