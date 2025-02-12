const pLimit = require("p-limit");
const limit = pLimit(5);
require("dotenv-safe").config();

const Client = require("bitcoin-core");

const client = new Client({
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT,
  username: process.env.RPC_USER,
  password: process.env.RPC_PASS,
  timeout: 60000,
});
const getBlockHeightForDate = async (date) => {
  const blockCount = await client.getBlockCount();
  const blockIntervalSeconds = 600;

  const currentDate = new Date();
  const targetDate = new Date(date);

  const timeDifferenceInMillis = currentDate - targetDate;

  const timeDifferenceInSeconds = timeDifferenceInMillis / 1000;

  const blocksPassed = Math.floor(
    timeDifferenceInSeconds / blockIntervalSeconds
  );

  const blockHeightForDate = blockCount - blocksPassed;
  return blockHeightForDate;
};

const getBlocks = async (req, res) => {
  try {
    const { date, count } = req.query;

    let blocksToFetch = [];
    let blockCount = await client.getBlockCount();
    let numBlocksToFetch = 0;
    let blockHeights = [];
    if (date) {
      blockCount = await getBlockHeightForDate(date);
      numBlocksToFetch = count ? parseInt(count) : 144;
      blockHeights = Array.from(
        { length: numBlocksToFetch },
        (_, index) => blockCount - numBlocksToFetch + index
      );
    } else {
      blockCount = await client.getBlockCount();
      numBlocksToFetch = count ? parseInt(count) : 100;
      blockHeights = Array.from(
        { length: numBlocksToFetch },
        (_, index) => blockCount - numBlocksToFetch + index
      );
    }
    const blocks = await Promise.all(
      blockHeights.map((blockHeight) =>
        limit(async () => {
          const blockHash = await client.getBlockHash(blockHeight);
          const blockInfo = await client.getBlock(blockHash);
          return {
            blockConfirmations: blockInfo.confirmations,
            blockHeight,
            blockHash,
            txCount: blockInfo.nTx,
          };
        })
      )
    );
    blocksToFetch = blocks;
    res.json(blocksToFetch);
  } catch (error) {
    console.error("Greška prilikom dohvaćanja blokova:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      customMessage: "Greška u komunikaciji sa blockchain klijentom",
    });
    res
      .status(500)
      .json({ error: "Dogodila se greška prilikom dohvaćanja podataka." });
  }
};

const getTxInfo = async (req, res) => {
  try {
    const { txid } = req.params;
    const txInfo = await client.getRawTransaction(txid, true);
    let valIn = 0;
    let valOut = 0;

    let valInHashes = [];
    let valOutTypes = [];
    for (let i of txInfo.vin) {
      if (typeof txInfo.vin[0].txid !== "undefined") {
        let test = await client.getRawTransaction(i.txid, true);
        valInHashes.push(i.txid + ":" + i.vout);
        valIn += test.vout[i.vout].value;
      }
    }
    for (let j of txInfo.vout) {
      valOutTypes.push(j.scriptPubKey.type);
      valOut += j.value;
    }
    valIn = Number(valIn).toFixed(8);
    valOut = Number(valOut).toFixed(8);

    let fee = Number(valIn - valOut).toFixed(8);

    let blockHeight = await client.getBlock(txInfo.blockhash);
    blockHeight = blockHeight.height;
    res.json({
      txid: txInfo.txid,
      valIn,
      valOut,
      fee,
      valInHashes,
      valOutTypes,
      blockHeight,
    });
  } catch (error) {
    console.error("Greška prilikom dohvaćanja transakcije:", error);
    res
      .status(500)
      .json({ error: "Dogodila se greška prilikom dohvaćanja podataka." });
  }
};

const getBlockWithTransactions = async (req, res) => {
  try {
    const { blockHeight } = req.params;
    const { page = 1, limit: limitParam = 20 } = req.query;

    const blockHash = await client.getBlockHash(Number(blockHeight));
    const blockInfo = await client.getBlock(blockHash);

    const transactions = blockInfo.tx;
    const totalTransactions = transactions.length;

    const start = (page - 1) * limitParam;
    const end = start + parseInt(limitParam);

    let transactionsPage = transactions.slice(start, end);

    if (page === "1") {
      transactionsPage = transactions.slice(1, end);
    }

    const transactionDetails = await Promise.all(
      transactionsPage.map((txid) =>
        limit(async () => {
          let valIn = 0;
          let valOut = 0;
          const rawTx = await client.getRawTransaction(txid, true);
          for (let i of rawTx.vin) {
            if (typeof rawTx.vin[0].txid !== "undefined") {
              let test = await client.getRawTransaction(i.txid, true);
              valIn += test.vout[i.vout].value;
            }
          }
          for (let j of rawTx.vout) {
            valOut += j.value;
          }
          valIn = Number(valIn).toFixed(8);
          valOut = Number(valOut).toFixed(8);

          let fee = Number(valIn - valOut).toFixed(8);
          return {
            txid,
            valIn,
            valOut,
            fee,
          };
        })
      )
    );

    res.json({
      blockHeight,
      blockHash,
      transactions: transactionDetails,
      totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limitParam),
    });
  } catch (error) {
    console.error("Greška prilikom dohvaćanja bloka:", error);
    res
      .status(500)
      .json({ error: "Dogodila se greška prilikom dohvaćanja podataka." });
  }
};

module.exports = {
  getBlocks,
  getBlockWithTransactions,
  getTxInfo,
};
