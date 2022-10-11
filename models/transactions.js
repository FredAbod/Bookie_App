const mongoose =require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    trnxType: {
      type: String,
      required: true,
      enum: ['CR', 'DR']
    },
    purpose:{
      type: String,
      enum : ['deposit', 'transfer', 'reversal', 'withdrawal'],
      required: true
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.00
    },
    walletUsername: {
      type: String,
      ref: 'Wallets'
    },
    reference: { type: String, required: true },
    location: { type: String, required: true},
    image: { type: String},
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    commision: {type: mongoose.Decimal128},
    summary: { type: String, required: true },
    trnxSummary:{ type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transactions', transactionSchema);