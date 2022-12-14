const router = require("express").Router();
const wallets = require("../models/wallets");
const { allServices, getUserWallets, getSingleUserWallets } = require('../controllers/user.controllers');
// const Wallet = require('../models/wallets')

const authCheck = (req, res, next) =>{
    if (!req.user) {
        res.redirect('auth/login')
    } else{
        next();
    }
}

router.get('/',authCheck,  (req, res)=> {
    res.render('profile');
})
router.get('/getservices', allServices)
router.get('/wallet', getUserWallets)
router.get('/singlewallet', getSingleUserWallets)

module.exports = router;