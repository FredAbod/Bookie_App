const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const {transfer, deposit, withdrawal, save} = require('../controllers/transactions.controllers');

router.post('/transfer', transfer);
router.post('/deposit',upload.single('image'), deposit);
router.post('/save', save);
router.put('/withdrawal', withdrawal);

module.exports = router;