require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { GasPrice, coins } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');
const { Secp256k1 } = require('@cosmjs/crypto');

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log('-----------------------------------------------');
    console.log('  OroSwap Auto Bot - Airdrop Insiders  ');
    console.log('-----------------------------------------------');
    console.log(`${colors.reset}`);
  },
};

const RPC_URL = 'https://rpc.zigscan.net/';
const API_URL = 'https://testnet-api.oroswap.org/api/';
const EXPLORER_URL = 'https://zigscan.org/tx/';
const GAS_PRICE = GasPrice.fromString('0.025uzig');

const ORO_ZIG_CONTRACT = 'zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg';

const TOKEN_DECIMALS = {
  'uzig': 6,
  'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro': 6,
};

const DENOM_ORO = 'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro';
const DENOM_ZIG = 'uzig';

const ORO_CONTRACT = 'zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr';

const LIQUIDITY_ORO_AMOUNT = 1; 
const LIQUIDITY_ZIG_AMOUNT = 0.495169; 

const BELIEF_PRICE_ORO_TO_ZIG = "1.982160555004955471"; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function isValidNumber(input) {
  const num = parseInt(input);
  return !isNaN(num) && num > 0;
}

function toMicroUnits(amount, denom) {
  const decimals = TOKEN_DECIMALS[denom] || 6;
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

function isMnemonic(input) {
  const words = input.trim().split(/\s+/);
  return words.length >= 12 && words.length <= 24 && words.every(word => /^[a-z]+$/.test(word));
}

async function getWallet(key) {
  try {
    if (isMnemonic(key)) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(key, { prefix: 'zig' });
      return wallet;
    } else if (/^[0-9a-fA-F]{64}$/.test(key.trim())) {
      const privateKeyBytes = Buffer.from(key.trim(), 'hex');
      const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, 'zig');
      return wallet;
    } else {
      throw new Error('Invalid input: neither a valid mnemonic nor a 64-character hex private key');
    }
  } catch (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

async function getAccountAddress(wallet) {
  const [account] = await wallet.getAccounts();
  return account.address;
}

function getRandomSwapAmount() {
  const min = 0.001;
  const max = 0.002;
  return Math.random() * (max - min) + min;
}

async function getPoolInfo(contractAddress) {
  try {
    const client = await SigningCosmWasmClient.connect(RPC_URL);
    const poolInfo = await client.queryContractSmart(contractAddress, { pool: {} });
    return poolInfo;
  } catch (error) {
    logger.error(`Failed to get pool info: ${error.message}`);
    return null;
  }
}

function calculateBeliefPrice(poolInfo, fromDenom) {
  try {
    if (!poolInfo || !poolInfo.assets || poolInfo.assets.length !== 2) {
      
      return fromDenom === DENOM_ZIG ? "0.5" : BELIEF_PRICE_ORO_TO_ZIG;
    }

    const asset1 = poolInfo.assets[0];
    const asset2 = poolInfo.assets[1];

    const asset1Denom = asset1.info.native_token?.denom || asset1.info.token?.contract_addr;
    const asset2Denom = asset2.info.native_token?.denom || asset2.info.token?.contract_addr;

    let zigAmount, oroAmount;

    if (asset1Denom === 'uzig') {
      zigAmount = parseFloat(asset1.amount) / 1_000_000;
      oroAmount = parseFloat(asset2.amount) / 1_000_000;
    } else if (asset2Denom === 'uzig') {
      zigAmount = parseFloat(asset2.amount) / 1_000_000;
      oroAmount = parseFloat(asset1.amount) / 1_000_000;
    } else {
      const oroIdentifiers = [ORO_CONTRACT, DENOM_ORO];
      if (oroIdentifiers.includes(asset1Denom)) {
        oroAmount = parseFloat(asset1.amount) / 1_000_000;
        zigAmount = parseFloat(asset2.amount) / 1_000_000;
      } else {
        oroAmount = parseFloat(asset2.amount) / 1_000_000;
        zigAmount = parseFloat(asset1.amount) / 1_000_000;
      }
    }

    if (zigAmount <= 0 || oroAmount <= 0) {
      logger.warn('Invalid pool amounts, using default belief price');
      return fromDenom === DENOM_ZIG ? "0.5" : BELIEF_PRICE_ORO_TO_ZIG;
    }

    let beliefPrice;
    if (fromDenom === DENOM_ZIG) {
      
      const rawPrice = oroAmount / zigAmount;
      beliefPrice = (rawPrice * 0.90).toFixed(18); 
    } else {
      
      beliefPrice = BELIEF_PRICE_ORO_TO_ZIG;
    }

    return beliefPrice;
  } catch (error) {
    logger.error(`Failed to calculate belief price: ${error.message}`);
    return fromDenom === DENOM_ZIG ? "0.5" : BELIEF_PRICE_ORO_TO_ZIG;
  }
}

async function performSwap(wallet, address, amount, fromDenom, swapNumber) {
  try {
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
    const microAmount = toMicroUnits(amount, fromDenom);
    const fromSymbol = fromDenom === DENOM_ZIG ? 'ZIG' : 'ORO';
    const toSymbol = fromDenom === DENOM_ZIG ? 'ORO' : 'ZIG';

    const poolInfo = await getPoolInfo(ORO_ZIG_CONTRACT);
    const beliefPrice = calculateBeliefPrice(poolInfo, fromDenom);

    let msg, funds, contractAddr;

    if (fromDenom === DENOM_ZIG) {
      
      msg = {
        swap: {
          belief_price: beliefPrice,
          max_spread: "0.1", 
          offer_asset: {
            amount: microAmount.toString(),
            info: { native_token: { denom: fromDenom } },
          },
        },
      };
      funds = coins(microAmount, fromDenom);
      contractAddr = ORO_ZIG_CONTRACT;
    } else {
      
      msg = {
        swap: {
          belief_price: beliefPrice,
          max_spread: "0.1", 
          offer_asset: {
            amount: microAmount.toString(),
            info: { native_token: { denom: fromDenom } },
          },
        },
      };
      funds = coins(microAmount, fromDenom);
      contractAddr = ORO_ZIG_CONTRACT;
    }

    logger.loading(`Swap ${swapNumber}/10: ${amount.toFixed(5)} ${fromSymbol} -> ${toSymbol}`);
    const result = await client.execute(address, contractAddr, msg, 'auto', 'Swap', funds);
    logger.success(`Swap ${swapNumber} completed! Tx: ${EXPLORER_URL}${result.transactionHash}`);
    return result;
  } catch (error) {
    logger.error(`Swap ${swapNumber} failed: ${error.message}`);
    return null;
  }
}

async function addLiquidity(wallet, address) {
  try {
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
    const microAmountORO = toMicroUnits(LIQUIDITY_ORO_AMOUNT, DENOM_ORO);
    const microAmountZIG = toMicroUnits(LIQUIDITY_ZIG_AMOUNT, DENOM_ZIG);

    const msg = {
      provide_liquidity: {
        assets: [
          { amount: microAmountORO.toString(), info: { native_token: { denom: DENOM_ORO } } },
          { amount: microAmountZIG.toString(), info: { native_token: { denom: DENOM_ZIG } } },
        ],
        slippage_tolerance: "0.1",
      },
    };

    const funds = [
      { denom: DENOM_ORO, amount: microAmountORO.toString() },
      { denom: DENOM_ZIG, amount: microAmountZIG.toString() }
    ];

    logger.loading(`Adding liquidity: ${LIQUIDITY_ORO_AMOUNT} ORO + ${LIQUIDITY_ZIG_AMOUNT} ZIG`);
    const result = await client.execute(address, ORO_ZIG_CONTRACT, msg, 'auto', 'Adding pool Liquidity', funds);
    logger.success(`Liquidity added! Tx: ${EXPLORER_URL}${result.transactionHash}`);
    return result;
  } catch (error) {
    logger.error(`Add liquidity failed: ${error.message}`);
    return null;
  }
}

async function getPoolTokenBalance(address) {
  try {
    const response = await axios.get(`${API_URL}portfolio/${address}`, {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://testnet.oroswap.org/',
      },
    });

    const poolTokens = response.data.pool_tokens;
    const oroZigPool = poolTokens.find(pool =>
      pool.pair_contract_address === ORO_ZIG_CONTRACT ||
      pool.name === 'ORO/ZIG'
    );

    if (oroZigPool) {
      return {
        amount: oroZigPool.amount,
        denom: oroZigPool.denom
      };
    }

    return null;
  } catch (error) {
    logger.error(`Failed to get pool token balance: ${error.message}`);
    return null;
  }
}

async function withdrawLiquidity(wallet, address) {
  try {
    const poolToken = await getPoolTokenBalance(address);
    if (!poolToken) {
      logger.warn('No pool tokens found to withdraw');
      return null;
    }

    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });

    const msg = {
      withdraw_liquidity: {}
    };

    const funds = coins(poolToken.amount, poolToken.denom);

    logger.loading(`Withdrawing liquidity: ${poolToken.amount} LP tokens`);
    const result = await client.execute(address, ORO_ZIG_CONTRACT, msg, 'auto', 'Removing pool Liquidity', funds);
    logger.success(`Liquidity withdrawn! Tx: ${EXPLORER_URL}${result.transactionHash}`);
    return result;
  } catch (error) {
    logger.error(`Withdraw liquidity failed: ${error.message}`);
    return null;
  }
}

async function getPoints(address) {
  try {
    const response = await axios.get(`${API_URL}portfolio/${address}/points`, {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://testnet.oroswap.org/',
      },
    });
    return response.data.points[0];
  } catch (error) {
    logger.error(`Failed to fetch points for ${address}: ${error.message}`);
    return null;
  }
}

function displayCountdown(hours, minutes, seconds) {
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  process.stdout.write(`\r${colors.cyan}[⏰] Next execution in: ${timeStr}${colors.reset}`);
}

async function startDailyCountdown(keys, numTransactions) {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; 

  while (true) {

    const startTime = Date.now();
    const endTime = startTime + TWENTY_FOUR_HOURS;

    while (Date.now() < endTime) {
      const remaining = endTime - Date.now();
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      displayCountdown(hours, minutes, seconds);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n');
    logger.success('⏰ 24 hours completed! Starting new transaction cycle...\n');

    await executeAllWallets(keys, numTransactions);
  }
}

async function executeAllWallets(keys, numTransactions) {
  for (let walletIndex = 0; walletIndex < keys.length; walletIndex++) {
    const key = keys[walletIndex];
    try {
      const wallet = await getWallet(key);
      const address = await getAccountAddress(wallet);
      logger.step(`Processing wallet: ${address} (wallet ${walletIndex + 1})`);

      for (let cycle = 1; cycle <= numTransactions; cycle++) {
        await executeTransactionCycle(wallet, address, cycle, walletIndex + 1);

        if (cycle < numTransactions) {
          logger.info(`Waiting 3 seconds before next cycle...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      logger.success(`All ${numTransactions} transaction cycles completed for wallet ${walletIndex + 1}!`);

      if (walletIndex < keys.length - 1) {
        console.log();
      }

    } catch (error) {
      logger.error(`Error processing wallet ${walletIndex + 1}: ${error.message}`);
    }
  }
}

async function executeTransactionCycle(wallet, address, cycleNumber, walletNumber) {
  logger.step(`--- Transaction For Wallet ${walletNumber} (Cycle ${cycleNumber}) ---`);

  for (let i = 1; i <= 10; i++) {
    const swapAmount = getRandomSwapAmount();
    const fromDenom = i % 2 === 1 ? DENOM_ORO : DENOM_ZIG;

    await performSwap(wallet, address, swapAmount, fromDenom);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await addLiquidity(wallet, address);

  await new Promise(resolve => setTimeout(resolve, 2000));

  await withdrawLiquidity(wallet, address);

  const points = await getNewPromise(resolve => setTimeout(resolve, 1000));
}

async function executeTransactionCycle(wallet, address, cycleNumber, walletNumber) {
  logger.step(`--- Transaction For Wallet ${walletNumber} (Cycle ${cycleNumber}) ---`);

  for (let i = 1; i <= 10; i++) {
    const swapAmount = getRandomSwapAmount();
    const fromDenom = i % 2 === 1 ? DENOM_ORO : DENOM_ZIG;

    await performSwap(wallet, address, swapAmount, fromDenom, i);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await addLiquidity(wallet, address);

  await new Promise(resolve => setTimeout(resolve, 2000));

  await withdrawLiquidity(wallet, address);

  const points = await getPoints(address);
  if (points) {
    logger.info(`Points: ${points.points} (Swaps: ${points.swaps_count}, Pools: ${points.join_pool_count})`);
  }

  console.log();
}

async function main() {
  logger.banner();

  const keys = Object.keys(process.env)
    .filter((key) => key.startsWith('PRIVATE_KEY_'))
    .map((key) => process.env[key]);

  if (keys.length === 0) {
    logger.error('No private keys orMnemonic found in .env file');
    rl.close();
    return;
  }

  let numTransactions;
  while (true) {
    const input = await prompt('Enter number of transactions to execute: ');
    if (isValidNumber(input)) {
      numTransactions = parseInt(input);
      break;
    }
    logger.error('Invalid input. Please enter a positive number.');
  }

  console.log();

  await executeAllWallets(keys, numTransactions);


  await startDailyCountdown(keys, numTransactions);
}

main().catch((error) => {
  logger.error(`Bot failed: ${error.message}`);
  rl.close();
});