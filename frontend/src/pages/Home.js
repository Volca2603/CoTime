import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import ProjectCard from '../components/ProjectCard';
import PublishProject from '../components/PublishProject';
import { ethers } from 'ethers';

const Home = () => {
  const { provider } = useContext(Web3Context);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false); // 添加加载状态

  // 获取所有项目
  const fetchProjects = async () => {
    if (!provider) return;
    
    setLoading(true); // 设置加载状态
    try {
      const contract = getContract(provider);
      const counter = await contract.projectCounter();
      const projectsList = [];
      for (let i = 0; i < counter; i++) {
        const project = await contract.projects(i);
        projectsList.push({
          id: i,
          name: ethers.decodeBytes32String(project.name),
          theme: ethers.decodeBytes32String(project.theme),
          initiator: project.initiator,
          days: project.allStreakDays,
          maxMembers: project.maxMembers,
          members: project.members,
        });
      }
      setProjects(projectsList);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      // 可以添加用户友好的错误提示
    } finally {
      setLoading(false); // 无论成功失败都设置加载状态为false
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [provider]);

  return (
    <div className="home">
      <PublishProject />
      {loading && <div>加载项目中...</div>}
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Home;