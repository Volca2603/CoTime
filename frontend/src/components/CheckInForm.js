import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { uploadToPinata } from '../utils/ipfs';
import { ethers } from 'ethers';

const CheckInForm = ({ projectId }) => {
  const { signer, address } = useContext(Web3Context);
  const [file, setFile] = useState(null);

  // 生成签名
  // 修改签名生成函数中的API调用
  const getSignature = async (proofHash) => {
    const timestamp = Math.floor(Date.now() / 1000);
    // 修改这里 - ethers v6 中 solidityKeccak256 改为 solidityPackedKeccak256
    // arrayify 改为 toBeArray
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "uint256", "address"],
      [projectId, proofHash, timestamp, address]
    );
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    return { timestamp, signature };
  };

  const checkIn = async () => {
    if (!signer || !file) return alert("请连接钱包并上传凭证");
    try {
      // 1. 上传文件到IPFS
      const proofHash = await uploadToPinata(file);
      // 2. 生成签名
      const { timestamp, signature } = await getSignature(proofHash);
      // 3. 调用合约打卡
      const contract = getContract(signer);
      
      const tx = await contract.checkIn(
        projectId,
        proofHash,
        timestamp,
        signature
      );
      
      // 等待交易确认并获取交易回执
      const receipt = await tx.wait();
      console.log('打卡交易回执:', receipt);
      
      // 尝试从事件中获取打卡成功信息
      let streakDays = 1; // 默认值

      contract.on("CheckInSuccess", (projectId, member, streakDays, event) => {
        console.log("捕获到CheckInSuccess事件:", {
          projectId,
          member,
          streakDays,
          event
        });
        // 提取projectId
        projectId = event.args.projectId.toString();
        console.log("从事件中提取到的projectId:", projectId);
        if (projectId === projectId) {
          alert(`打卡成功！连续打卡天数: ${streakDays}`);
        }
      });
      
      // 重置文件选择
      setFile(null);
      
    } catch (err) {
      console.error('打卡失败:', err);
      alert("打卡失败：" + (err.reason || '未知错误'));
    }
  };

  return (
    <div className="check-in-form">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={checkIn}>今日打卡</button>
    </div>
  );
};

export default CheckInForm;