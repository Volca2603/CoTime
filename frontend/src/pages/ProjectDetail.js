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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!provider || !id) return;
      try {
        const contract = getContract(provider);
        const projectData = await contract.projects(parseInt(id));
        setProject({
          id: parseInt(id),
          name: ethers.decodeBytes32String(projectData.name),
          theme: ethers.decodeBytes32String(projectData.theme),
          initiator: projectData.initiator,
          days: projectData.allStreakDays,
          maxMembers: projectData.maxMembers,
          members: projectData.members,
          isJoined: projectData.members.includes(address)
        });
      } catch (error) {
        console.error('获取项目详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [provider, id, address]);

  const joinProject = async () => {
    if (!signer || !id) return alert('请连接钱包');
    try {
      const contract = getContract(signer);
      const tx = await contract.joinProject(parseInt(id));
      await tx.wait();
      alert('加入项目成功！');
      // 刷新项目信息
      const contractWithProvider = getContract(provider);
      const projectData = await contractWithProvider.projects(parseInt(id));
      setProject(prev => ({
        ...prev,
        members: projectData.members,
        isJoined: projectData.members.includes(address)
      }));
    } catch (error) {
      console.error('加入项目失败:', error);
      alert('加入失败: ' + error.reason);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!project) return <div>项目不存在</div>;

  return (
    <div className="project-detail">
      <h2>{project.name}</h2>
      <p>主题: {project.theme}</p>
      <p>发起人: {project.initiator}</p>
      <p>总打卡天数: {project.days}</p>
      <p>最大成员数: {project.maxMembers}</p>
      <p>当前成员数: {project.members.length}</p>
      
      {!project.isJoined && project.members.length < project.maxMembers && (
        <button onClick={joinProject}>加入项目</button>
      )}
      
      {project.isJoined && (
        <div>
          <h3>今日打卡</h3>
          <CheckInForm projectId={project.id} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;