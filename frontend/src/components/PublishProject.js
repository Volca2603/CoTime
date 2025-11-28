import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';

const PublishProject = () => {
  const { signer, provider, isConnected } = useContext(Web3Context);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [days, setDays] = useState(30);
  const [maxMembers, setMaxMembers] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  
  const DEBOUNCE_DELAY = 2000; // 2秒防抖

  const publish = async () => {
    // 防抖处理，防止快速点击多次提交
    const now = Date.now();
    if (now - lastSubmitTime < DEBOUNCE_DELAY) {
      console.log("提交过于频繁，请稍后再试");
      return;
    }
    
    // 基本验证
    if (!isConnected || !signer || !provider) {
      return alert("请连接钱包");
    }
    
    if (!name.trim()) return alert("请输入项目名称");
    if (!theme.trim()) return alert("请输入打卡主题");
    if (name.length > 16) return alert("项目名称不能超过16个字符");
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setLastSubmitTime(now);
      
      // 1. 验证网络连接
      try {
        const blockNumber = await provider.getBlockNumber();
        console.log("网络连接正常，当前区块高度:", blockNumber);
      } catch (networkErr) {
        alert("无法连接到区块链网络，请检查网络连接");
        return;
      }
      
      // 2. 获取合约实例
      const contract = getContract(signer);
      console.log("合约实例创建成功");
      
      // 3. 转换字符串为bytes32
      const nameBytes32 = ethers.encodeBytes32String(name);
      const themeBytes32 = ethers.encodeBytes32String(theme);
      
      console.log("准备发布项目:", {
        name, theme, days, maxMembers,
        nameBytes32,
        themeBytes32,
        daysType: typeof days,
        maxMembersType: typeof maxMembers
      });
      
      // 4. 发送交易，让ethers.js自动处理gas
      console.log("正在发送交易，让ethers.js自动估算gas...");
      const tx = await contract.publishProject(
        nameBytes32,
        themeBytes32,
        days,
        maxMembers
      );
      
      console.log("交易已提交，等待确认...", {
        hash: tx.hash,
        from: tx.from,
        to: tx.to
      });
      
      // 5. 等待交易确认
      console.log("等待交易被区块链确认...");
      const receipt = await tx.wait();
      console.log("交易确认成功:", {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.transactionHash
      });
      let projectId = null;
      let projectName = null;
      contract.on("ProjectCreated", (projectId, name, theme, days, maxMembers, event) => {
        console.log("捕获到ProjectCreated事件:", {
          projectId,
          name: ethers.decodeBytes32String(name),
          theme: ethers.decodeBytes32String(theme),
          days,
          maxMembers,
          event
        });
        // 提取projectId
        projectId = event.args.projectId.toString();
        projectName = ethers.decodeBytes32String(event.args.name); 
      });
      console.log("从事件中提取到的projectId:", projectId);
      if (projectId) {
          alert(`项目 ${projectName} 发布成功！项目ID: ${projectId}`);
      } else {
          alert(`项目 ${projectName} 发布成功！但无法获取项目ID，请检查交易记录`);
          console.warn("无法从交易回执中提取projectId");
      }
      
      // 重置表单
      setName("");
      setTheme("");
      setDays(30);
      setMaxMembers(3);
      
    } catch (err) {
      console.error("发布项目失败详细错误:", err);
      
      // 详细的错误处理
      let errorMessage = "发布失败: ";
      
      if (err.code === -32603) {
        errorMessage += "节点处理错误，请检查网络状态";
      } else if (err.code === -32000 || err.code === -32003) {
        errorMessage += "insufficient funds" in err.toString().toLowerCase() ? 
          "账户余额不足" : 
          "网络错误，请检查连接";
      } else if (err.reason) {
        errorMessage += err.reason;
      } else if (err.error?.message) {
        errorMessage += err.error.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else if (err.toString().includes('aborted')) {
        errorMessage += "交易被中断，请重试";
      } else {
        errorMessage += "未知错误，请检查控制台日志";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        maxLength={16}
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
        onChange={(e) => setDays(parseInt(e.target.value) || 30)}
        min={1}
        max={365}
      />
      <input
        type="number"
        placeholder="最大成员数"
        value={maxMembers}
        onChange={(e) => setMaxMembers(parseInt(e.target.value) || 3)}
        min={1}
        max={255}
      />
      <button onClick={publish} disabled={isSubmitting || !isConnected}>
        {isSubmitting ? "发布中..." : "发布"}
      </button>
    </div>
  );
};

export default PublishProject;