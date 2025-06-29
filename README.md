# OroSwap Auto Bot 🚀

Automated trading bot for OroSwap DEX on Zig Network. This bot performs automated swaps and liquidity operations to earn points and potential airdrops.

## 🌟 Features

- **Automated Swapping**: Performs 10 swaps per cycle alternating between ORO/ZIG tokens
- **Liquidity Management**: Automatically adds and withdraws liquidity from pools
- **Multi-Wallet Support**: Process multiple wallets simultaneously
- **Point Tracking**: Monitors and displays earned points after each cycle
- **24-Hour Cycles**: Runs continuously with 24-hour intervals

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Private keys or mnemonic phrases for your wallets
- ZIG and ORO tokens in your wallets

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vikitoshi/Oroswap-Auto-Bot.git
   cd Oroswap-Auto-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit the `.env` file**
   ```env
   # Add your private keys or mnemonic phrases
   PRIVATE_KEY_1=your_private_key_here_or_mnemonic_phrase
   PRIVATE_KEY_2=your_second_private_key_here
   PRIVATE_KEY_3=your_third_private_key_here
   # Add more as needed...
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PRIVATE_KEY_1` | First wallet private key or mnemonic | `0x1234...` or `word1 word2 ...` |
| `PRIVATE_KEY_2` | Second wallet private key or mnemonic | `0x5678...` or `word1 word2 ...` |
| `PRIVATE_KEY_N` | Additional wallets | Continue numbering |

### Bot Parameters

- **Swap Amount**: Random between 0.001 - 0.002 tokens per swap
- **Liquidity Amount**: 1 ORO + 0.495169 ZIG per cycle
- **Swaps per Cycle**: 10 swaps (5 ORO→ZIG, 5 ZIG→ORO)
- **Cycle Interval**: 24 hours
- **Max Spread**: 10%
- **Slippage Tolerance**: 10%

## 🏃‍♂️ Usage

1. **Start the bot**
   ```bash
   npm start
   ```

2. **Enter number of transactions**
   ```
   Enter number of transactions to execute: 5
   ```

3. **Monitor the output**
   The bot will display:
   - Swap transactions with explorer links
   - Liquidity operations
   - Points earned
   - 24-hour countdown timer

## 📊 Transaction Flow

Each cycle performs the following operations:

1. **10 Swaps** (alternating ORO↔ZIG)
   - Swap 1: ORO → ZIG
   - Swap 2: ZIG → ORO
   - ... (continues alternating)

2. **Add Liquidity**
   - Adds ORO/ZIG to liquidity pool
   - Receives LP tokens

3. **Remove Liquidity**
   - Withdraws all LP tokens
   - Receives back ORO/ZIG tokens

4. **Point Tracking**
   - Displays current points balance
   - Shows swap and pool join counts

## 🔧 Technical Details

### Network Information
- **RPC URL**: `https://rpc.zigscan.net/`
- **API URL**: `https://testnet-api.oroswap.org/api/`
- **Explorer**: `https://zigscan.org/tx/`
- **Gas Price**: `0.025uzig`

### Contract Addresses
- **ORO/ZIG Pool**: `zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg`
- **ORO Token**: `zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr`

### Token Denominations
- **ZIG**: `uzig` (6 decimals)
- **ORO**: `coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro` (6 decimals)

## 📈 Points System

The bot tracks various metrics that contribute to airdrop eligibility:

- **Swap Count**: Number of successful swaps performed
- **Pool Joins**: Number of times liquidity was added
- **Total Points**: Combined score from all activities

## 🛡️ Safety Features

- **Belief Price Protection**: Dynamic pricing prevents unfavorable swaps
- **Max Spread Limit**: 10% maximum spread protection
- **Error Recovery**: Continues operation even if individual transactions fail
- **Gas Optimization**: Uses 'auto' gas estimation

## 🐛 Troubleshooting

### Common Issues

1. **"Insufficient funds" error**
   - Ensure wallets have enough ZIG and ORO tokens
   - Check gas fee requirements

2. **"Invalid private key" error**
   - Verify private key format (64 hex characters)
   - Or ensure mnemonic has 12-24 words

3. **Network connection issues**
   - Check internet connection
   - RPC endpoint might be temporarily down

4. **Transaction failures**
   - Pool might be temporarily unavailable
   - Try reducing transaction frequency

### Debug Mode

For detailed logging, you can modify the logger functions in the code or add additional console.log statements.

## 🤝 Community

Join our Telegram channel for updates, support, and discussions:

**📢 [Join Airdrop Insider ID](https://t.me/AirdropInsiderID)**

Get the latest updates on:
- Bot improvements and new features
- Airdrop opportunities and strategies
- Technical support and troubleshooting
- Community tips and tricks

## ⚠️ Disclaimer

- This bot is for educational and research purposes
- Use at your own risk and responsibility
- Always test with small amounts first
- Not financial advice - DYOR (Do Your Own Research)
- The developers are not responsible for any losses

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Updates

- **v1.0.0**: Initial release with basic swapping and liquidity features
- Check [Releases](https://github.com/vikitoshi/Oroswap-Auto-Bot/releases) for latest updates

## 💡 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you need help or have questions:

1. Check the [Issues](https://github.com/vikitoshi/Oroswap-Auto-Bot/issues) page
2. Join our [Telegram channel](https://t.me/AirdropInsiderID)
3. Create a new issue if you found a bug

---

**⭐ If this bot helps you, please give it a star on GitHub!**

Made with ❤️ by [Airdrop Insider ID](https://t.me/AirdropInsiderID)