import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { uploadToPinata } from '../utils/ipfs';
import { ethers } from 'ethers';

const CheckInForm = ({ projectId }) => {
  const { signer, address } = useContext(Web3Context);
  const [file, setFile] = useState(null);

  // 生成签名
  const getSignature = async (proofHash) => {
    const timestamp = Math.floor(Date.now() / 1000);
    // 构造消息哈希（与合约一致）
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "string", "uint256", "address"],
      [projectId, proofHash, timestamp, address]
    );
    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
    return { timestamp, signature };
  };

  const checkIn = async () => {
    if (!signer || !file) return alert("请连接钱包并上传凭证");
    // 1. 上传文件到IPFS
    const proofHash = await uploadToPinata(file);
    // 2. 生成签名
    const { timestamp, signature } = await getSignature(proofHash);
    // 3. 调用合约打卡
    const contract = getContract(signer);
    try {
      const tx = await contract.checkIn(
        projectId,
        proofHash,
        timestamp,
        signature
      );
      await tx.wait();
      alert("打卡成功！");
    } catch (err) {
      console.error(err);
      alert("打卡失败：" + err.reason);
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