import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';
import CheckInForm from '../components/CheckInForm';

const ProjectDetail = () => {
  const { id } = useParams();
  const { provider, signer, address } = useContext(Web3Context);
  const [project, setProject] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!provider || !id) return;
      
      try {
        setLoading(true);
        const contract = getContract(provider);
        
        // 1. 获取项目基本信息
        const projectData = await contract.getProject(parseInt(id));
        const projectDetails = {
          id: parseInt(id),
          name: ethers.decodeBytes32String(projectData.name),
          theme: ethers.decodeBytes32String(projectData.theme),
          initiator: projectData.initiator,
          days: projectData.allStreakDays.toNumber(),
          maxMembers: projectData.maxMembers.toNumber(),
          memberCount: projectData.memberCount.toNumber(),
        };
        setProject(projectDetails);
        
        // 2. 检查用户是否为成员
        if (address) {
          try {
            const isMember = await contract.isMemberOfProject(parseInt(id));
            setIsJoined(isMember);
          } catch (err) {
            console.error('检查成员状态失败:', err);
            setIsJoined(false);
          }
        }
      } catch (error) {
        console.error('获取项目详情失败:', error);
        setProject(null);
        setIsJoined(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [provider, id, address]);

  const joinProject = async () => {
    if (!signer || !id) return alert('请连接钱包');
    if (joining) return;
    
    try {
      setJoining(true);
      const contract = getContract(signer);
      const tx = await contract.joinProject(parseInt(id));
      
      console.log('交易已提交，等待确认...', { hash: tx.hash });
      
      // 等待交易确认并获取交易回执
      const receipt = await tx.wait();
      console.log('交易确认成功:', { status: receipt.status });
      
      // 检查是否成功加入项目
      if (receipt.status === 1) {
        // 尝试从事件中获取信息
        let joinedMember = null;
        contract.on('ProjectJoined', (projectId, member) => {
          if (projectId.toNumber() === parseInt(id)) {
            joinedMember = member;
          }
        });
        alert(joinedMember?`加入项目成功！成员地址: ${joinedMember}`:'加入项目失败: 未捕获到加入事件');
        // 更新本地状态
        setIsJoined(true);
        setProject(prev => prev ? {
          ...prev,
          memberCount: prev.memberCount + 1
        } : null);
      } else {
        alert('加入项目失败: 交易未被确认');
      }
    } catch (error) {
      console.error('加入项目失败:', error);
      let errorMessage = '加入失败: ';
      
      if (error.reason) {
        errorMessage += error.reason;
      } else if (error.error?.message) {
        errorMessage += error.error.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += '未知错误';
      }
      
      alert(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!project) return <div>项目不存在</div>;

  const isInitiator = project.initiator.toLowerCase() === address?.toLowerCase();
  const canJoin = !isJoined && project.memberCount < project.maxMembers;

  return (
    <div className="project-detail">
      <h2>{project.name}</h2>
      <p>主题: {project.theme}</p>
      <p>发起人: {project.initiator}</p>
      <p>总打卡天数: {project.days}</p>
      <p>最大成员数: {project.maxMembers}</p>
      <p>当前成员数: {project.memberCount}</p>
      <p>您是成员: {isJoined ? '是' : '否'}</p>
      
      {canJoin && (
        <button onClick={joinProject} disabled={joining}>
          {joining ? '加入中...' : '加入项目'}
        </button>
      )}
      
      {!canJoin && !isJoined && (
        <p>项目已满员，无法加入</p>
      )}
      
      {isJoined && (
        <div>
          <h3>今日打卡</h3>
          <CheckInForm projectId={project.id} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;