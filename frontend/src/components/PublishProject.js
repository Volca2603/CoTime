import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';

const PublishProject = () => {
  const { signer } = useContext(Web3Context);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [days, setDays] = useState(30);
  const [maxMembers, setMaxMembers] = useState(3);

  const publish = async () => {
    if (!signer) return alert("请连接钱包");
    const contract = getContract(signer);
    // 将字符串转为bytes32
    const nameBytes32 = ethers.utils.formatBytes32String(name);
    const themeBytes32 = ethers.utils.formatBytes32String(theme);
    
    try {
      const tx = await contract.publishProject(
        nameBytes32,
        themeBytes32,
        days,
        maxMembers
      );
      await tx.wait();
      alert("项目发布成功！");
    } catch (err) {
      console.error(err);
      alert("发布失败：" + err.reason);
    }
  };

  return (
    <div className="publish-project">
      <h3>发布共学项目</h3>
      <input
        type="text"
        placeholder="项目名称（最多16字）"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="打卡主题"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />
      <input
        type="number"
        placeholder="总打卡天数"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />
      <input
        type="number"
        placeholder="最大成员数"
        value={maxMembers}
        onChange={(e) => setMaxMembers(e.target.value)}
      />
      <button onClick={publish}>发布</button>
    </div>
  );
};

export default PublishProject;