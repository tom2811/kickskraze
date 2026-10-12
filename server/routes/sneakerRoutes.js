const express = require('express');
const sneakerController = require('../controllers/sneakerController');

const router = express.Router();

// Sneaker routes
router.get('/brands', sneakerController.getBrands);
router.get('/featured', sneakerController.getFeaturedSneaker);
router.get('/', sneakerController.getAllSneakers);
router.get('/:id', sneakerController.getSneakerById);

module.exports = router;
