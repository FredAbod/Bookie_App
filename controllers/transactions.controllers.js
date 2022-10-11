const Transactions = require("../models/transactions");
const mongoose = require("mongoose");
const Wallets = require("../models/wallets");
const { v4 } = require("uuid");
const cloudinary = require('../utils/cloudinary');
const { creditAccount, debitAccount } = require("../utils/transactions.utils");
const fs = require('fs');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const Flutterwave = require("flutterwave-node-v3");
const { info } = require("console");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { toUsername, fromUsername, amount, summary } = req.body;
    const reference = v4();
    if (!toUsername && !fromUsername && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          "Please provide the following details: toUsername, fromUsername, amount, summary",
      });
    }

    const transferResult = await Promise.all([
      debitAccount({
        amount,
        username: fromUsername,
        purpose: "transfer",
        reference,
        walletUsername: fromUsername,
        summary,
        trnxSummary: `TRFR TO: ${toUsername}. TRNX REF:${reference} `,
        session,
      }),
      creditAccount({
        amount,
        username: toUsername,
        purpose: "transfer",
        reference,
        walletUsername: toUsername,
        summary,
        trnxSummary: `TRFR FROM: ${fromUsername}. TRNX REF:${reference} `,
        session,
      }),
    ]);

    const failedTxns = transferResult.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "Transfer successful",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to find perform transfer. Please try again. \n Error: ${err}`,
    });
  }
};

exports.deposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { depositAccUsername, amount, summary, location, } = req.body;
    // const result = await cloudinary.uploader.upload(req.file.path);
    const reference = v4();
    if (!depositAccUsername && !amount && !summary && !location) {
      return res.status(400).json({
        status: false,
        message:
          "Please Fill All Fields",
      });
    };
    const depositTransfer = await Promise.all([
    creditAccount({
      amount,
      username: depositAccUsername,
      walletUsername: depositAccUsername,
      purpose: "deposit",
      reference,
      location,
      // image: result.secure_url,
      summary,
      trnxSummary: `TRFR To: ${depositAccUsername}. TRNX REF:${reference} `,
      session,
    })
  ]);
    const failedTxns = depositTransfer.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // read the html template inside the public folder
    const html = fs.readFileSync('views/deposit.ejs', 'utf8');
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
  
    // save the pdf to a file
    fs.writeFile('test2.pdf', pdf, (err) => {
      if (err) {
        console.log(err);
      }
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.USER_MAIL,
          pass: process.env.PASSWORD
      }
  });
  const mailOptions = {
    from: "boluwatifefred@gmail.com",
    to: "fredrickbolutife@gmail.com",
    subject: "Your Payment Reciept",
   html: `<h1>hello ${depositAccUsername}</h1>
   <p>Thank You For Saving With Bookie<br><br>
   Your Receipt is Attached In the pdf Below</p>
   <img src="https://res.cloudinary.com/del59phog/image/upload/v1665441239/zzaza76x3rgxaq5jvvuq.png" alt="image" height="100" width="150">`,
   attachments: [{
    filename: "your reciept.pdf", content: `<h1>hello ${depositAccUsername}</h1>
    <p>Thank You For Saving With Bookie<br><br>
    Your Receipt is Attached In the pdf Below</p>
    <img src="https://res.cloudinary.com/del59phog/image/upload/v1665441239/zzaza76x3rgxaq5jvvuq.png" alt="image" height="100" width="150">`, contentType: "pdf"}]
    
}
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.log(error);
  } else {
      res.status(200).json({message: "email Page"})
      console.log("Email Sent to " + info.accepted)
  }
  
});
    await session.commitTransaction();
    session.endSession();
 
    res.redirect('https://bookie.onrender.com/')
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(500).json({
      status: false,
      message: `Unable to perform deposit. Please try again. \n Error: ${err}`,
    });
  }
};

exports.withdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { withrawalAccUsername, amount, summary } = req.body;
    const reference = v4();
    if (!withrawalAccUsername && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          "Please provide the following details: withrawalAccUsername, amount, summary",
      });
    }
    const depositTransfer = await Promise.all([
    debitAccount({
      amount,
      username: withrawalAccUsername,
      walletUsername: withrawalAccUsername,
      purpose: "deposit",
      reference,
      summary,
      trnxSummary: `TRFR To: ${withrawalAccUsername}. TRNX REF:${reference} `,
      session,
    })
  ]);
    const failedTxns = depositTransfer.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    await session.commitTransaction();
    session.endSession();
 
    return res.status(201).json({
      status: true,
      message: "Transfer successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to find perform debit. Please try again. \n Error: ${err}`,
    });
  }
};

exports.save = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, amount, phonenumber, email, currency, summary } = req.body;
    const tx_ref = v4();
    if (!name && !amount && !summary && !phonenumber && !email && !currency ) {
      return res.status(400).json({
        status: false,
        message:
          "Please Fill All Fields",
      });
    }
    if (amount< 10000) {
      const chargeAmount = 0.1 * amount;
    amount = chargeAmount + amount;
    } else {
      let chargeAmount = 0.15 * amount;
      amount = chargeAmount + amount;
    }
    const got = require("got");
    const response = await got
      .post("https://api.flutterwave.com/v3/payments", {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
        json: {
          tx_ref,
          amount: amount,
          currency: currency,
          redirect_url: "https://bookie.onrender.com/deposit",
         
          customer: {
            email,
            phonenumber,
            name,
          },

          customizations: {
            title: "Bookie Savings",
            logo: "https://res.cloudinary.com/del59phog/image/upload/v1664666233/oh8ux3abpado9xpxdzxt.jpg",
          },
        },
      })
      .json();
    console.log(response);
    if (req.query.status === "successful") {
      const transactionDetails = await Transaction.find({
        ref: req.query.tx_ref,
      });
      const response = await flw.Transaction.verify({
        id: req.query.transaction_id,
      });
      if (
        response.data.status === "successful" &&
        response.data.amount === transactionDetails.amount &&
        response.data.currency === "NGN"
      ) {
        // Success! Confirm the customer's payment
      } else {
        // Inform the customer their payment was unsuccessful
        console.log(error);
        await session.abortTransaction();
      }
    }
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== secretHash) {
    // console.log("request not from flutterwave");
    }
    const payload = req.body;
    console.log(payload);
    await session.commitTransaction();
    session.endSession();

    res.redirect(response.data.link)
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to find perform deposit. Please try again. \n Error: ${err}`,
    });
  }
  };
