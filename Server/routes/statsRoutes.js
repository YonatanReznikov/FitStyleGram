const express = require('express');
const router = express.Router();
const { getMonthlyStats } = require('../controllers/statsController');

router.get('/monthly', getMonthlyStats);

module.exports = router;

