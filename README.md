# CoTime
CoTime 是基于 Web3 的共学打卡平台，支持组队打卡、NFT 奖励

项目结构大致如下
```
cotime/
├── .github/                # GitHub配置（可选，用于CI/CD、贡献指南）
│   └── workflows/          # GitHub Actions自动化部署配置
├── contracts/              # 智能合约源码
│   ├── CoTime.sol          # 核心合约（打卡+NFT）
│   └── interfaces/         # 接口文件（可选，如VRF接口）
├── scripts/                # 部署脚本（Hardhat/Truffle）
│   └── deploy.js           # 合约部署脚本
├── test/                   # 合约测试用例
│   └── CoTime.test.js      # 核心合约测试
├── frontend/               # 前端代码（React/Vue）
│   ├── public/             # 前端静态资源
│   ├── src/                # 前端源码
│   │   ├── components/     # UI组件（如ProjectCard、CheckInForm）
│   │   ├── hooks/          # 自定义Hooks（如useContract、useIPFS）
│   │   ├── contexts/       # 钱包上下文（如Web3Context）
│   │   ├── utils/          # 工具函数（如签名、IPFS上传）
│   │   ├── App.js          # 前端入口组件
│   │   └── index.js        # 前端渲染入口
│   ├── package.json        # 前端依赖
│   └── .env.example        # 前端环境变量示例（合约地址、Pinata API）
├── hardhat.config.js       # Hardhat配置（合约编译、部署网络）
├── package.json            # 根项目依赖（合约开发相关）
├── README.md               # 项目说明文档（必选）
├── LICENSE                 # 开源许可证（可选，如MIT）
└── .gitignore              # Git忽略文件（node_modules、env等）
```

前端结构大概如下

```
src/
├── components/       # UI组件
│   ├── ConnectWallet.js  # 钱包连接
│   ├── ProjectCard.js    # 项目卡片
│   ├── PublishProject.js # 发布项目
│   ├── JoinProject.js    # 加入项目
│   └── CheckInForm.js    # 打卡表单
├── contexts/         # 钱包上下文
│   └── Web3Context.js    # 全局钱包状态
├── utils/            # 工具函数
│   ├── contract.js       # 合约ABI和地址
│   ├── ipfs.js           # IPFS上传
│   └── signature.js      # 签名工具
├── pages/            # 页面
│   ├── Home.js           # 首页（广场）
│   ├── ProjectDetail.js  # 项目详情
│   └── MyProjects.js     # 我的项目
├── App.js            # 路由入口
└── index.js          # 渲染入口
```