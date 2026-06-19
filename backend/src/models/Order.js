const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

const orderItemSchema = new mongoose.Schema(
  {
    design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    fileName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    payment: {
      provider: { type: String, enum: ['stripe', 'mock'], default: 'mock' },
      sessionId: { type: String, default: '' },
      paymentIntentId: { type: String, default: '' },
      paidAt: { type: Date, default: null },
    },
    shipping: { type: shippingSchema, default: () => ({}) },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
