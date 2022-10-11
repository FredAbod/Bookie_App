const Wallets = require("../models/wallets");
const Transactions = require("../models/transactions");

exports.creditAccount = async ({
  amount,
  username,
  purpose,
  reference,
  walletUsername,
  summary,
  location,
  image,
  trnxSummary,
  session,
}) => {
  const wallet = await Wallets.findOne({ username });
  if (!wallet) {
    return {
      status: false,
      statusCode: 404,
      message: `User ${username} doesn\'t exist`,
    };
  }

  const updatedWallet = await Wallets.findOneAndUpdate(
    { username },
    { $inc: { balance: amount } },
    { session }
  );

  const transaction = await Transactions.create(
    [
      {
        trnxType: "CR",
        purpose,
        amount,
        location,
        image,
        username,
        reference,
        walletUsername,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance) + Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Credit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Credit successful",
    data: { updatedWallet, transaction },
  };
};

exports.debitAccount = async ({
  amount,
  username,
  purpose,
  location,
  image,
  reference,
  walletUsername,
  summary,
  trnxSummary,
  session,
}) => {
  const wallet = await Wallets.findOne({ username });
  if (!wallet) {
    return {
      status: false,
      statusCode: 404,
      message: `User ${username} doesn\'t exist`,
    };
  }

  if (Number(wallet.balance) < amount) {
    return {
      status: false,
      statusCode: 400,
      message: `User ${username} has insufficient balance`,
    };
  }

  const updatedWallet = await Wallets.findOneAndUpdate(
    { username },
    { $inc: { balance: -amount } },
    { session }
  );
  const transaction = await Transactions.create(
    [
      {
        trnxType: "DR",
        purpose,
        amount,
        username,
        location,
        image,
        reference,
        walletUsername,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance) - Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Debit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Debit successful",
    data: { updatedWallet, transaction },
  };
};
