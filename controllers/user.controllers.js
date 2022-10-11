const User = require('../models/user.models');
const ourServices = require('../models/savings.services.models');
const Wallets = require('../models/wallets')

exports.allServices = async (req, res, next) => {
    try {
        const {page, limit } = req.query;
        const theServices = await ourServices.find()
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit) // 0 * 5 // skip 0
        .limit(limit * 1);
      return res.status(200).json({ count: theServices.length, data: theServices });
    } catch (error) {
        console.log(error);
        next();
    }
}
exports.getUserWallets = async (req, res, next) => {
    
        // const id = req.params.id;
    //   const username = req.query;
      const allWallets = await Wallets.find().then(data=>{
        res.send(data)
      })
      .catch(err=>{
        res.status(500).send({message: err.message})
      })
    //   res.send(allWallets)
    //   return res.status(200).json({
    //     allWalletsData: allWallets.length,
    //     data: allWallets,
    //   });
    
    //   console.log(err);
    //   res.send({
    //     message:err.message});
    //   return res.status(500).json({
    //     message: "Internal Server Error",
    //   });
    
  }