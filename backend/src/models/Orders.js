import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  userEmail: {
    type: String,
    required: true,
  },
  products: [{
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String
    }
  }],
  totalAmount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'fabricando', 'concluído', 'cancelado'],
    default: 'pendente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = model("Order", orderSchema);

export default Order;