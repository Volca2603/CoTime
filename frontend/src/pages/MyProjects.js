import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';
import ProjectCard from '../components/ProjectCard';

const MyProjects = () => {
  const { provider, address } = useContext(Web3Context);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!provider || !address) {
        setLoading(false);
        return;
      }
      
      try {
        const contract = getContract(provider);
        const counter = await contract.projectCounter();
        const projectsList = [];
        
        for (let i = 0; i < counter; i++) {
          const projectData = await contract.projects(i);
          // 检查是否是项目成员
          if (projectData.members.includes(address)) {
            projectsList.push({
              id: i,
              name: ethers.decodeBytes32String(projectData.name),
              theme: ethers.decodeBytes32String(projectData.theme),
              initiator: projectData.initiator,
              days: projectData.allStreakDays,
              maxMembers: projectData.maxMembers,
              members: projectData.members
            });
          }
        }
        
        setMyProjects(projectsList);
      } catch (error) {
        console.error('获取我的项目失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, [provider, address]);

  if (!address) {
    return <div>请先连接钱包查看您的项目</div>;
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="my-projects">
      <h2>我的项目</h2>
      {myProjects.length === 0 ? (
        <p>您还没有加入任何项目</p>
      ) : (
        <div className="projects-grid">
          {myProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;