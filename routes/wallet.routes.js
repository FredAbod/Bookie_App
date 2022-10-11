const express = require('express');
const { createWallet, deposit, withdrawal } = require('../controllers/wallet.controllers');
const router = express.Router();



router.post('/', createWallet);


module.exports = router;