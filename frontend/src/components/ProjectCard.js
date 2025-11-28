import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';

const ProjectCard = ({ project }) => {
  const { signer, address, isConnected } = useContext(Web3Context);
  
  // 判断当前用户是否已加入项目
  const isUserJoined = address && project.members ? project.members.includes(address) : false;
  
  // 判断项目是否已满
  const isProjectFull = project.memberCount >= project.maxMembers;
  
  // 加入项目函数
  const joinProject = async () => {
    if (!isConnected || !signer) {
      return alert('请先连接钱包');
    }
    
    if (isUserJoined) {
      return alert('您已加入该项目');
    }
    
    if (isProjectFull) {
      return alert('项目成员已满');
    }
    
    try {
      // 获取合约实例
      const contract = getContract(signer);
      
      // 发送交易
      const tx = await contract.joinProject(project.id);
      
      // 等待交易确认
      console.log('正在等待交易确认...', { hash: tx.hash });
      const receipt = await tx.wait();
      let joinedMember = null;
      // 尝试从事件中获取信息
      contract.on("ProjectJoined", (projectId, member, event) => {
        console.log("捕获到ProjectJoined事件:", {
          projectId,
          member,
          event
        });
        // 提取projectId
        projectId = event.args.projectId.toString();
        joinedMember = event.args.member;
        
      });
      if(joinedMember === address) {
        alert(`您(${joinedMember.substring(0, 6)}...) ${joinedMember.substring(38)}已成功加入项目ID: ${projectId}`);
      }
      
      // 刷新页面或更新项目数据
      window.location.reload();
      
    } catch (error) {
      console.error('加入项目失败:', error);
      alert('加入失败: ' + (error.reason || '未知错误'));
    }
  };
  
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p className="project-theme">{project.theme}</p>
      <div className="project-info">
        <div className="info-item">
          <span>发起人：</span>
          <span>{project.initiator.substring(0, 6)}...{project.initiator.substring(38)}</span>
        </div>
        <div className="info-item">
          <span>总打卡天数：</span>
          <span>{project.days}天</span>
        </div>
        <div className="info-item">
          <span>成员：</span>
          <span>{project.memberCount??0}/{project.maxMembers}</span>
        </div>
      </div>
      
      {/* 加入项目按钮 */}
      {!isUserJoined && !isProjectFull && (
        <button 
          onClick={joinProject} 
          className="join-button"
          disabled={!isConnected}
        >
          {isConnected ? '加入项目' : '请先连接钱包'}
        </button>
      )}
      
      {/* 已加入状态 */}
      {isUserJoined && (
        <div className="joined-status">您已加入该项目</div>
      )}
      
      {/* 项目已满状态 */}
      {isProjectFull && !isUserJoined && (
        <div className="full-status">项目成员已满</div>
      )}
      
      <Link to={`/project/${project.id}`} className="project-link">查看详情</Link>
    </div>
  );
};

export default ProjectCard;