export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress"; // 需要替换为实际地址

export const CONTRACT_ABI = [
  // 复制合约ABI（从artifacts/contracts/CoTime.sol/CoTime.json中取abi字段）
  "function publishProject(bytes32 _name, bytes32 _theme, uint16 _allStreakDays, uint8 _maxMembers) external",
  "function joinProject(uint256 _projectId) external",
  "function checkIn(uint256 _projectId, string calldata _proofHash, uint256 _timestamp, bytes calldata _signature) external",
  "function projects(uint256 _projectId) external view returns (bytes32 name, bytes32 theme, address initiator, uint16 allStreakDays, uint8 maxMembers, address[] members)",
  "function projectCounter() external view returns (uint256)",
  // 其他函数和事件...
];

// 创建合约实例
export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};