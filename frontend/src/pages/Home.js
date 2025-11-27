import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract } from '../utils/contract';
import ProjectCard from '../components/ProjectCard';
import PublishProject from '../components/PublishProject';
import { ethers } from 'ethers';

const Home = () => {
  const { provider } = useContext(Web3Context);
  const [projects, setProjects] = useState([]);

  // 获取所有项目
  const fetchProjects = async () => {
    if (!provider) return;
    const contract = getContract(provider);
    const counter = await contract.projectCounter();
    const projectsList = [];
    for (let i = 0; i < counter; i++) {
      const project = await contract.projects(i);
      projectsList.push({
        id: i,
        name: ethers.utils.parseBytes32String(project.name),
        theme: ethers.utils.parseBytes32String(project.theme),
        initiator: project.initiator,
        days: project.allStreakDays,
        maxMembers: project.maxMembers,
        members: project.members,
      });
    }
    setProjects(projectsList);
  };

  useEffect(() => {
    fetchProjects();
  }, [provider]);

  return (
    <div className="home">
      <PublishProject />
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Home;