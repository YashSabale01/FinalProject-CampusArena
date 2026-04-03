const Event = require("../models/Event");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ status: "error", message: "Event not found" });
    }

    if (event.fees === 0) {
      return res.status(400).json({ status: "error", message: "This is a free event" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.fees * 100), // amount in cents
      currency: 'usd',
      metadata: {
        eventId: eventId,
        userId: req.user._id.toString()
      }
    });

    res.json({
      status: "success",
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: event.fees * 100,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { paymentIntentId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ status: "error", message: "Event not found" });
    }

    // Verify payment with Stripe (skip for mock payments)
    if (!paymentIntentId.startsWith('mock_payment_')) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ status: "error", message: "Payment not completed" });
      }
    }

    // Add user to event
    event.registeredUsers.push({
      user: userId,
      paymentStatus: "completed",
      paymentId: paymentIntentId,
      amountPaid: event.fees,
    });

    await event.save();

    res.json({
      status: "success",
      message: "Payment confirmed and registered for event",
      data: { paymentId: paymentIntentId }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent, confirmPayment };