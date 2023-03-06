const express = require("express");
const Stripe = require("stripe");
const orderModel = require('../models/order')
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
    },
  });
  const line_items = req.body.cartItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.desc,
          images: [item.image.url],
          metadata: {
            id: item.id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.cartQuantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: { allowed_countries: ["US", "CA", "EG"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 150 * 100, currency: "usd" },
          display_name: "Next day air",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    customer: customer.id,
    line_items,
    phone_number_collection: {
      enabled: true,
    },
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
  });

  return res.send({ URL: session.url });
});

// Create order

const createOrder = async (customer, data , lineItems) => {
  const newOrder = new orderModel({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: lineItems.data,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    shipping: data.customer_details,
    payment_status: data.payment_status,
  });
  try {
  const saveOrder =  await  newOrder.save()
  console.log("processed order:",saveOrder);
  } catch (error) {
    console.log(error)
  }
};

// Stripe webhooke

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;

// endpointSecret= "whsec_5c95d9970d86e737ee31d76b22ab64e0e42410d56b2b67f0e452226bbb0c90f4";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let data;
    let eventType;

    if (endpointSecret) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("webHook verified ");
      } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    //Handler the event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          stripe.checkout.sessions.listLineItems(
            data.id,
            { },
            function(err, lineItems) {
              createOrder(customer, data , lineItems);
              console.log("lineItems" , lineItems);
            }
          );

          console.log(customer);
          console.log("data:", data);
        })
        .catch((err) => console.log(err));
    }
    // Return a 200 res to acknowledge receipt of the event
    return res.send().end();
  }
);

module.exports = router;
