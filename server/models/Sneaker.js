const mongoose = require('mongoose');

const SneakerSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  colorway: { type: String, required: true },
  imgUrl: { type: String, required: true },
  brand: { type: String, required: true }
}, { 
  collection: 'items',
  timestamps: true
});

module.exports = mongoose.model('Sneaker', SneakerSchema);
