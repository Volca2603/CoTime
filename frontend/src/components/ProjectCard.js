import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  // 计算当前成员数量
  const currentMembers = project.members ? project.members.length : 0;
  
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
          <span>{currentMembers}/{project.maxMembers}</span>
        </div>
      </div>
      <Link to={`/project/${project.id}`} className="project-link">查看详情</Link>
    </div>
  );
};

export default ProjectCard;