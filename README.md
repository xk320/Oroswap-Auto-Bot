# OroSwap 自动机器人 🚀

本项目是 Zig Network 上 OroSwap DEX 的自动化交易机器人。该机器人可自动执行兑换和流动性操作，以赚取积分和潜在空投。

## 🌟 功能特色

- **自动兑换**：每轮执行 10 次兑换，ORO/ZIG 代币交替兑换
- **流动性管理**：自动为流动性池添加和提取流动性
- **多钱包支持**：可同时处理多个钱包
- **积分追踪**：每轮结束后监控并显示已获得的积分
- **24 小时循环**：持续运行，每 24 小时为一个周期

## 📋 前置条件

- Node.js（v16 或更高版本）
- npm 或 yarn
- 钱包的私钥或助记词
- 钱包中需有 ZIG 和 ORO 代币

## 🚀 安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/vikitoshi/Oroswap-Auto-Bot.git
   cd Oroswap-Auto-Bot
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

4. **编辑 `.env` 文件**
   ```env
   # 添加你的私钥或助记词
   PRIVATE_KEY_1=your_private_key_here_or_mnemonic_phrase
   PRIVATE_KEY_2=your_second_private_key_here
   PRIVATE_KEY_3=your_third_private_key_here
   # 如需更多钱包，继续添加...
   ```

## ⚙️ 配置说明

### 环境变量

| 变量 | 描述 | 示例 |
|------|------|------|
| `PRIVATE_KEY_1` | 第一个钱包私钥或助记词 | `0x1234...` 或 `word1 word2 ...` |
| `PRIVATE_KEY_2` | 第二个钱包私钥或助记词 | `0x5678...` 或 `word1 word2 ...` |
| `PRIVATE_KEY_N` | 其他钱包 | 继续编号 |

### 机器人参数

- **兑换数量**：每次兑换随机 0.001 - 0.002 代币
- **流动性数量**：每轮 1 ORO + 0.495169 ZIG
- **每轮兑换次数**：10 次（5 次 ORO→ZIG，5 次 ZIG→ORO）
- **周期间隔**：24 小时
- **最大价差**：10%
- **滑点容忍度**：10%

## 🏃‍♂️ 使用方法

1. **启动机器人**
   ```bash
   npm start
   ```

2. **输入交易次数**
   ```
   输入要执行的交易次数：5
   ```

3. **监控输出**
   机器人将显示：
   - 兑换交易及区块链浏览器链接
   - 流动性操作
   - 获得的积分
   - 24 小时倒计时

## 📊 交易流程

每个周期执行以下操作：

1. **10 次兑换**（ORO↔ZIG 交替）
   - 兑换 1：ORO → ZIG
   - 兑换 2：ZIG → ORO
   - ...（依次交替）

2. **添加流动性**
   - 向流动性池添加 ORO/ZIG
   - 获得 LP 代币

3. **移除流动性**
   - 提取所有 LP 代币
   - 收回 ORO/ZIG 代币

4. **积分追踪**
   - 显示当前积分余额
   - 显示兑换和流动性加入次数

## 🔧 技术细节

### 网络信息
- **RPC URL**：`https://rpc.zigscan.net/`
- **API URL**：`https://testnet-api.oroswap.org/api/`
- **区块浏览器**：`https://zigscan.org/tx/`
- **Gas 价格**：`0.025uzig`

### 合约地址
- **ORO/ZIG 流动性池**：`zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg`
- **ORO 代币**：`zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr`

### 代币单位
- **ZIG**：`uzig`（6 位小数）
- **ORO**：`coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro`（6 位小数）

## 📈 积分系统

机器人会追踪多项有助于空投资格的指标：

- **兑换次数**：已成功执行的兑换次数
- **流动性加入次数**：添加流动性的次数
- **总积分**：所有活动的综合得分

## 🛡️ 安全特性

- **信仰价格保护**：动态定价防止不利兑换
- **最大价差限制**：最大 10% 价差保护
- **错误恢复**：即使单笔交易失败也会继续运行
- **Gas 优化**：使用 'auto' 自动估算 gas

## 🐛 故障排查

### 常见问题

1. **“资金不足”错误**
   - 确保钱包中有足够的 ZIG 和 ORO 代币
   - 检查 gas 费用要求

2. **“私钥无效”错误**
   - 检查私钥格式（64 位十六进制字符）
   - 或确保助记词为 12-24 个单词

3. **网络连接问题**
   - 检查网络连接
   - RPC 节点可能暂时不可用

4. **交易失败**
   - 流动性池可能暂时不可用
   - 尝试降低交易频率


## ⚠️ 免责声明

- 本机器人仅供学习和研究用途
- 使用风险自负
- 请务必先用小额测试
- 非投资建议 - 请自行研究（DYOR）
- 开发者不对任何损失负责

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。
