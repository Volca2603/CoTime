# CoTime

## 项目简介
CoTime是一个基于区块链技术的协作打卡平台，旨在帮助用户通过智能合约建立可信任的打卡项目，促进团队或个人之间的协作与坚持。

## Project Introduction
CoTime is a blockchain-based collaborative check-in platform designed to help users establish trustworthy check-in projects through smart contracts, promoting collaboration and persistence among teams or individuals.

## 核心功能

### 1. 项目管理
- **创建打卡项目**：用户可以设置项目名称、主题、打卡天数和成员上限
- **项目列表查看**：浏览所有参与或创建的打卡项目
- **项目详情**：查看项目进度、成员列表和打卡记录

### Core Features

### 1. Project Management
- **Create Check-in Projects**: Users can set project name, theme, check-in days, and member limit
- **Project List View**: Browse all participated or created check-in projects
- **Project Details**: View project progress, member list, and check-in records

### 2. 打卡功能
- **每日打卡**：项目成员可以在规定时间内进行打卡
- **打卡记录**：记录每次打卡的时间和相关信息
- **连续打卡统计**：追踪用户的连续打卡天数

### 2. Check-in Features
- **Daily Check-in**: Project members can check in within the specified time
- **Check-in Records**: Record the time and relevant information of each check-in
- **Streak Statistics**: Track users' consecutive check-in days

### 3. 区块链特性
- **智能合约**：所有项目和打卡数据存储在区块链上
- **钱包集成**：支持通过加密钱包登录和交互
- **透明可信**：打卡记录不可篡改，确保公平性

### 3. Blockchain Features
- **Smart Contracts**: All project and check-in data is stored on the blockchain
- **Wallet Integration**: Support login and interaction through cryptocurrency wallets
- **Transparency and Trust**: Check-in records are immutable, ensuring fairness

## 技术栈

### 前端
- **框架**：React.js
- **状态管理**：React Context API
- **样式**：Tailwind CSS
- **区块链交互**：ethers.js

## Technology Stack

### Frontend
- **Framework**: React.js
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: ethers.js

### 后端
- **智能合约**：Solidity
- **开发框架**：Hardhat
- **测试网络**：支持本地开发网络和测试网部署

### Backend
- **Smart Contracts**: Solidity
- **Development Framework**: Hardhat
- **Test Networks**: Support for local development network and testnet deployment

## 安装与部署

### 前置要求
- Node.js v14+ 或更高版本
- npm 或 yarn 包管理器
- MetaMask 或其他以太坊钱包

## Installation and Deployment

### Prerequisites
- Node.js v14+ or higher
- npm or yarn package manager
- MetaMask or other Ethereum wallet

### 本地开发

#### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd CoTime
```

#### 2. 安装依赖
```bash
# 安装智能合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

#### 3. 启动本地开发网络
```bash
npx hardhat node
```

#### 4. 部署智能合约到本地网络
```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### 5. 启动前端应用
```bash
cd frontend
npm start
```

前端应用将在 http://localhost:3000 上运行

### Local Development

#### 1. Clone the Project
```bash
git clone <repository-url>
cd CoTime
```

#### 2. Install Dependencies
```bash
# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### 3. Start Local Development Network
```bash
npx hardhat node
```

#### 4. Deploy Smart Contracts to Local Network
```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### 5. Start Frontend Application
```bash
cd frontend
npm start
```

The frontend application will run on http://localhost:3000

### 构建生产版本
```bash
cd frontend
npm run build
```
构建产物将生成在 `frontend/build` 目录中

### Build Production Version
```bash
cd frontend
npm run build
```
The build artifacts will be generated in the `frontend/build` directory

## 使用说明

### 1. 连接钱包
- 访问应用首页，点击"连接钱包"按钮
- 选择您的钱包（如MetaMask）并授权连接

## Usage Instructions

### 1. Connect Wallet
- Visit the application homepage and click the "Connect Wallet" button
- Select your wallet (e.g., MetaMask) and authorize the connection

### 2. 创建项目
- 在"我的项目"页面，点击"创建新项目"按钮
- 填写项目名称、主题、打卡天数和成员上限
- 点击"发布项目"按钮，确认钱包交易

### 2. Create Project
- On the "My Projects" page, click the "Create New Project" button
- Fill in the project name, theme, check-in days, and member limit
- Click the "Publish Project" button and confirm the wallet transaction

### 3. 加入项目
- 在首页浏览可加入的项目
- 点击感兴趣的项目卡片，进入详情页面
- 点击"加入项目"按钮，确认钱包交易

### 3. Join Project
- Browse joinable projects on the homepage
- Click on an interesting project card to enter the details page
- Click the "Join Project" button and confirm the wallet transaction

### 4. 每日打卡
- 在项目详情页面，点击"今日打卡"按钮
- 确认打卡内容并提交
- 交易确认后，打卡成功

### 4. Daily Check-in
- On the project details page, click the "Today's Check-in" button
- Confirm the check-in content and submit
- After transaction confirmation, the check-in is successful

## 智能合约

主要合约文件位于 `contracts/CoTime.sol`，提供以下核心功能：

- `publishProject`：创建新的打卡项目
- `joinProject`：加入现有项目
- `checkIn`：执行打卡操作
- `endProject`：结束项目（仅项目创建者可操作）

## Smart Contracts

The main contract file is located at `contracts/CoTime.sol`, providing the following core functions:

- `publishProject`: Create a new check-in project
- `joinProject`: Join an existing project
- `checkIn`: Perform check-in operation
- `endProject`: End a project (only operable by the project creator)

## 项目结构

项目结构大致如下：
```
CoTime/
├── contracts/
│   └── CoTime.sol
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
├── scripts/
│   └── deploy.js
├── test/
│   └── CoTime.test.js
├── hardhat.config.js
├── package.json
├── README.md
```