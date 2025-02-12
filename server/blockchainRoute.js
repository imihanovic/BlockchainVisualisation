var express = require("express");

const {
  getBlocks,
  getBlockWithTransactions,
  getTxInfo,
} = require("./blockchainController");

const router = express.Router();

router.get("/getBlocks", getBlocks);
router.get("/block/:blockHeight", getBlockWithTransactions);
router.get("/tx/:txid", getTxInfo);

module.exports = router;
