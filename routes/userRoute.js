import express from "express";
const router = express();

import User from "../models/userModel.js";
import Kyc from "../models/kycModel.js";
import Wallet from "../models/walletModel.js";

router.post("/check-wallet", async (req, res) => {
  await Wallet.find({ address: req.body.address })
    .then(async (data) => {
      if (data.length !== 0) {
        return res.send({ connected: true });
      } else {
        return res.send({ connected: false });
      }
    })
    .catch((err) => {
      return res.send(err);
    });
});

router.post("/sign-up", async (req, res) => {
  const wallet = new Wallet({
    address: req.body.walletAddress,
    isPrimary: true,
  });

  const user = new User({
    displayName: req.body.displayName,
    wallets: [wallet],
  });
  user
    .save()
    .then((data) => {
      wallet.user = user;
      wallet
        .save()
        .then(() => {
          return res.send(data);
        })
        .catch((err) => {
          return res.send(err);
        });
    })
    .catch((err) => {
      return res.send(err);
    });
});

router.get("/sign-in/:address", async (req, res) => {
  await Wallet.find({ address: req.params.address })
    .populate("user")
    .then((data) => {
      return res.send(data);
    })
    .catch((err) => {
      return res.send(err);
    });
});

router.post("/link-wallet", async (req, res) => {
  const existingWallet = await Wallet.find({ address: req.body.walletAddress });
  const user = await User.findById(req.body.userId).catch((err) => {
    return res.send(err);
  });

  if (user) {
    if (existingWallet.length === 0) {
      const newWallet = new Wallet({
        address: req.body.walletAddress,
        isPrimary: false,
        user: user,
      });
      user.wallets.push(newWallet);
      user.save();
      newWallet
        .save()
        .then((data) => {
          return res.send(data);
        })
        .catch((err) => {
          return res.send(err);
        });
    } else {
      return res.send("This wallet already exists");
    }
  } else {
    return res.send("User does not exist");
  }
});

router.post("/kyc", async (req, res) => {
  const {
    userId,
    fname,
    lname,
    dob,
    email,
    phone,
    address,
    country,
    identity,
  } = req.body;

  let user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "no user found" });
  let kyc = await Kyc.create({
    userId,
    fname,
    lname,
    dob,
    email,
    phone,
    address,
    country,
    identity,
  });

  res.send(kyc);
});

router.get("/kyc/:wallet", async (req, res) => {
  const { wallet } = req.params;

  let user = await User.findOne({ wallet });
  console.log({ wallet });
  console.log({ user });
  if (!user) return res.status(404).send({ error: "Cannot Find The User" });

  res.send(user);
});

export default router;
