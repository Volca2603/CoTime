// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CoTime is ERC721, ReentrancyGuard {
    uint256 private _tokenIdCounter = 1;
    // 项目信息结构体
    struct CoProject {
        string name;       // 项目名称
        string theme;      // 打卡主题
        address initiator; // 发起人
        uint16 allStreakDays;  // 总打卡天数
        uint8 maxMembers;       // 成员上限
        uint8 memberCount;          // 当前成员数量
        mapping(address => bool) isMember;
    }

    mapping(address => uint256[]) private userCreatedProjects;

    // 打卡记录：用户地址 → 项目ID → 打卡日期（时间戳）→ 是否已打卡
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) public userCheckInRecord;
    // 用户连续打卡天数：地址 → 项目ID → 连续天数
    mapping(address => mapping(uint256 => uint256)) public checkInStreak;
    // 用户NFT等级：地址 → 项目ID → 等级（0=无，1=元气，2=闪耀，3=限定）
    mapping(address => mapping(uint256 => uint256)) public userNftLevel;
    
    mapping(address => mapping(uint256 => bool)) public globalUserCheckInRecord;  
    mapping(address => uint256) public userGlobalTotalCheckInDays;               
    
    mapping(uint256 => CoProject) public projects; // 项目ID→信息
    uint256 public projectCounter; // 项目计数器

    // NFT元数据URI（IPFS CID）
    string[] public nftUris = [
        "ipfs://bafybeibi4j4idqadkg6idbg3hunlm6c62fvtn3jxqceo74gdhouu6fw2aa", // 占位
        "ipfs://bafybeib4jpn24mggrg4u4utihqppeqvtrs44xvr6uwt5oxkt4khp3obd4q",
        "ipfs://bafybeia32s57qcmoorqfr5mkipsvzez3qvx75hpwd4jnujaiymq4ulqlze", 
        "ipfs://bafybeigotfdpsfmat7emiffbaiigdcdehhux66vtqtr6zchdinxh4rlyoi"
        "ipfs://bafybeiemwgcu4e6bw4xjggtojfl3bx47gxtsp5wgftr72qclytwtvoeyfe"
        "ipfs://bafybeiflulj37qol5yaqui5waezhnrjh3aibashej7gmn23b2oswtrfthm"
        "ipfs://bafybeib4jpn24mggrg4u4utihqppeqvtrs44xvr6uwt5oxkt4khp3obd4q"
        "ipfs://bafybeicqig2dsub2er2kxtmnwoboqrwchslaz7ucvtgijbagieqvyu45xm"
        "ipfs://bafybeia32s57qcmoorqfr5mkipsvzez3qvx75hpwd4jnujaiymq4ulqlze"
    ];

    // 项目创建事件
    event ProjectCreated(uint256 indexed projectId,address indexed initiator,string name,string theme,uint16 allStreakDays,uint8 maxMembers);
    // 加入项目事件
    event ProjectJoined(uint256 indexed projectId,address indexed member);
    // 打卡成功事件
    event CheckInSuccess(uint256 indexed projectId,address indexed user,string proofHash,uint256 streakDays);
    // NFT铸造事件
    event NftMinted(uint256 indexed projectId,address indexed user,uint256 indexed tokenId,uint256 level);
    // 项目结束事件
    event ProjectFinished(uint256 indexed projectId,uint256 finishTime);

    constructor() ERC721("CoTime", "CT") {
        projectCounter = 1;
    }

    // 发布项目
    function publishProject(
        string memory  _name, 
        string memory  _theme, 
        uint16 _allStreakDays,
        uint8 _maxMembers
    ) external {
        require(_maxMembers >= 1, "Min 1 member"); // 至少1人（发起人自己）
        require(_maxMembers <= 255, "Max 255 members"); 
         // 逐字段赋值，避免直接赋值整个结构体
        CoProject storage newProject = projects[projectCounter];
        newProject.name = _name;
        newProject.theme = _theme;
        newProject.initiator = msg.sender;
        newProject.allStreakDays = _allStreakDays;
        newProject.maxMembers = _maxMembers;
        newProject.memberCount = 1;  // 发起人自动加入

        // 标记发起人为成员（mapping 不能在构造中初始化，需单独赋值）
        newProject.isMember[msg.sender] = true;

        emit ProjectCreated(projectCounter, msg.sender, _name, _theme, _allStreakDays, _maxMembers);
        userCreatedProjects[msg.sender].push(projectCounter);
        projectCounter++;
    }

    // 加入项目
    function joinProject(uint256 _projectId) external {
        require(_projectId < projectCounter, "Project not exist");
        CoProject storage project = projects[_projectId];
        require(project.memberCount < project.maxMembers, "Team is full");
        require(project.isMember[msg.sender] != true,"Already in");
        
    
        project.isMember[msg.sender] = true;
        project.memberCount++;

        emit ProjectJoined(_projectId, msg.sender);
    }

    // 打卡（带签名验证）
    function checkIn(
        uint256 _projectId,
        string calldata _proofHash, // 打卡凭证IPFS哈希
        uint256 _timestamp,         // 打卡时间戳（前端生成）
        bytes calldata _signature    // 钱包签名
    ) external nonReentrant {
        // 1. 验证项目存在且用户是成员
        require(_projectId < projectCounter, "Project not exist");
        
        require(projects[_projectId].isMember[msg.sender] == true, "Not project member");

        // 2. 验证签名（防止伪造打卡）
        bytes32 messageHash = getMessageHash(_projectId, _proofHash, _timestamp, msg.sender);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        require(recoverSigner(ethSignedMessageHash, _signature) == msg.sender, "Invalid signature");

        // 3. 验证时间戳（防止跨天/过期打卡，±1小时容错）
        require(block.timestamp - _timestamp < 3600, "Timestamp expired");

        // 4. 验证今日未打卡（按日期戳判断，取当天0点时间戳）
        uint256 today = block.timestamp - (block.timestamp % 86400);
        if(!globalUserCheckInRecord[msg.sender][today]){
            globalUserCheckInRecord[msg.sender][today] = true;
            userGlobalTotalCheckInDays[msg.sender]++;
        }
        require(!userCheckInRecord[msg.sender][_projectId][today], "Already checked in today");

        // 5. 更新打卡记录和连续天数
        userCheckInRecord[msg.sender][_projectId][today] = true;
        // 检查昨天是否打卡（判断连续）
        uint256 yesterday = today - 86400;
        if (userCheckInRecord[msg.sender][_projectId][yesterday]) {
            checkInStreak[msg.sender][_projectId]++;
        } else {
            checkInStreak[msg.sender][_projectId] = 1; // 断签重置
        }

        uint256 currentStreak = checkInStreak[msg.sender][_projectId];
        // 更新打卡记录后触发事件
        emit CheckInSuccess(_projectId, msg.sender, _proofHash, currentStreak);

        // 6. 发放NFT
        issueNftByStreak(msg.sender, _projectId);
    }

    // 生成消息哈希（用于签名）
    function getMessageHash(
        uint256 _projectId,
        string calldata _proofHash,
        uint256 _timestamp,
        address _user
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_projectId, _proofHash, _timestamp, _user));
    }

    // 生成以太坊签名消息哈希（EIP-191标准）
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    // 恢复签名者地址
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    // 拆分签名（r/s/v）
    function splitSignature(bytes memory _signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_signature.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
    }

    // 根据连续天数发NFT
    function issueNftByStreak(address _user, uint256 _projectId) internal {
        uint256 streak = checkInStreak[_user][_projectId];
        uint256 currentLevel = userNftLevel[_user][_projectId];

        if (streak >= 3 && currentLevel < 1) {
            mintNft(_user, _projectId, 1);
        } else if (streak >= 7 && currentLevel < 2) {
            mintNft(_user, _projectId, 2);
        } else if (streak >= 10 && currentLevel < 3) {
            mintNft(_user, _projectId, 3);
        }
    }

    // 铸造NFT
    function mintNft(address _to, uint256 _projectId, uint256 _level) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(_to, tokenId);
        userNftLevel[_to][_projectId] = _level;

        emit NftMinted(_projectId, _to, tokenId, _level);
    }

    // 重写tokenURI
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        address owner = ownerOf(_tokenId);
        // 简化：取用户最高等级NFT的URI（实际可加映射关联tokenId和项目ID）
        uint256 maxLevel = 0;
        for (uint256 i = 0; i < projectCounter; i++) {
            if (userNftLevel[owner][i] > maxLevel) {
                maxLevel = userNftLevel[owner][i];
            }
        }
        return nftUris[maxLevel];
    }

    function getProject(uint256 _projectId) external view returns (
        string memory name,
        string memory theme,
        address initiator,
        uint16 allStreakDays,
        uint8 maxMembers,
        uint8 memberCount
    ) {
        CoProject storage project = projects[_projectId];
        return (
            project.name,
            project.theme,
            project.initiator,
            project.allStreakDays,
            project.maxMembers,
            project.memberCount
        );
    }

    // 分页获取用户创建的项目 ID 列表
    function getMyProjects(uint256 _startIndex, uint256 _limit) external view returns (uint256[] memory) {
        require(_limit <= 50, "Max 50 projects per query");  // 防止 Gas 超限
        uint256[] memory projectIds = userCreatedProjects[msg.sender];
        uint256 endIndex = _startIndex + _limit;
        if (endIndex > projectIds.length) endIndex = projectIds.length;

        uint256[] memory result = new uint256[](endIndex - _startIndex);
        for (uint256 i = _startIndex; i < endIndex; i++) {
            result[i - _startIndex] = projectIds[i];
        }
        return result;
    }


    function isMemberOfProject(uint256 _projectId, address _user) public view returns (bool) {
        return projects[_projectId].isMember[_user];
    }

    function getTotalCheckInDays(uint256 _projectId) external view returns (uint256) {
        return userGlobalTotalCheckInDays[msg.sender];
    }

    function getUserStreak(address _user, uint256 _projectId) external view returns (uint256) {
        return checkInStreak[_user][_projectId];
    }

}