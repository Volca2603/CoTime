// 在顶部导入中添加React
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import ProjectCard from '../components/ProjectCard';
import PublishProject from '../components/PublishProject'; // 导入发布项目组件

const MyProjects = () => {
  const { address, callReadMethod, callWriteMethod, isConnected } = useContext(Web3Context);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [finishingProject, setFinishingProject] = useState(null);
  const [showPublishForm, setShowPublishForm] = useState(false); // 添加发布表单状态
  // 保留一个isFetching声明即可
  const isFetching = useRef(false);
  const PROJECTS_PER_PAGE = 10;

  // 修复后的fetchMyProjects函数
  const fetchMyProjects = async (startIndex = 0, limit = PROJECTS_PER_PAGE) => {
    // 添加防重复调用的锁
    if (isFetching.current) {
      console.log('已有请求正在进行，忽略重复调用');
      return;
    }
    
    isFetching.current = true;
    setLoading(true); // 开始加载时设置loading为true
    
    try {
      console.log(`尝试获取项目，起始索引: ${startIndex}, 限制: ${limit}`);
  
      // 将projectIds声明移到try块外部，扩大作用域
      let projectIds = [];
      
      try {
        // 修改后 - 直接传递参数，不要放在数组里
        projectIds = await callReadMethod('getMyProjects', startIndex, limit);
    
        console.log(`获取到项目ID列表:`, projectIds);
        
        // 检查是否还有更多项目
        if (projectIds && projectIds.length < limit) {
          setHasMoreProjects(false);
        } else {
          setHasMoreProjects(true);
        }
        
        // 如果没有项目，直接返回
        if (!projectIds || projectIds.length === 0) {
          if (startIndex === 0) {
            setMyProjects([]);
          }
          return;
        }
      } catch (error) {
        console.error('获取项目ID列表失败:', error);
        throw error; // 重新抛出错误让外部catch处理
      }
      
      const projectDetails = [];
      
      // 现在可以正常访问projectIds变量了
      for (let i = 0; i < projectIds.length; i++) {
        try {
          // 使用Number()转换BigInt
          const projectId = Number(projectIds[i]);
          console.log(`正在获取项目ID ${projectId} 的详情`);
          const projectData = await callReadMethod('getProject', projectId);
          // 假设在某个获取项目详情的函数中
          const project = {
            id: Number(projectId),
            name: projectData.name,
            theme: projectData.theme,
            initiator: projectData.initiator,
            days: Number(projectData.allStreakDays),
            maxMembers: Number(projectData.maxMembers),
            memberCount: Number(projectData.memberCount),
            isProjectFinished: Boolean(projectData.isProjectFinished), // 添加结束状态字段
            isInitiator: projectData.initiator.toLowerCase() === address.toLowerCase() // 将isInitiator作为对象属性
          };
          
          projectDetails.push(project);
        } catch (err) {
          console.error(`获取项目ID ${projectIds[i]} 详情失败:`, err.message);
          // 可以选择继续处理其他项目，或者在这里进行错误处理
        }
      }
  
      // 重要：将获取到的项目详情设置到状态中
      if (startIndex === 0) {
        setMyProjects(projectDetails);
      } else {
        setMyProjects(prev => [...prev, ...projectDetails]);
      }
    } catch (abiError) {
      console.error('ABI或函数调用错误:', abiError);
      // 特定处理ABI错误
      if (abiError.code === 'UNSUPPORTED_OPERATION' || abiError.message.includes('no matching fragment')) {
        alert('合约ABI中缺少必要的函数定义，请检查contract.js文件');
      }
      // 不要抛出错误，避免影响组件渲染
    } finally {
      // 无论成功失败，都要重置加载状态
      isFetching.current = false;
      setLoading(false);
    }
  }


// 结束项目函数
const handleFinishProject = async (projectId) => {
  try {
    // 显示确认对话框
    const confirmFinish = window.confirm(`确定要结束项目吗？结束后项目将无法继续打卡。`);
    if (!confirmFinish) {
      return;
    }
  
    setFinishingProject(projectId);
    
    // 调用合约的finishProject方法
    const result = await callWriteMethod('finishProject', projectId);
    
    if (result.success) {
      alert('项目已成功结束！');
      // 刷新项目列表
      fetchMyProjects(0, PROJECTS_PER_PAGE);
    }
  } catch (error) {
    console.error('结束项目失败:', error);
    
    // 针对不同错误类型给出更具体的提示
    if (error.message.includes('execution reverted')) {
      alert('结束项目失败：合约执行被拒绝，可能是项目尚未达到结束时间或您不是项目发起人');
    } else if (error.code === 'CALL_EXCEPTION') {
      alert('结束项目失败：合约调用异常，请检查合约地址和ABI是否正确');
    } else {
      alert(`结束项目失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setFinishingProject(null);
  }
};

// 同时在useEffect中添加依赖数组优化
useEffect(() => {
  // 添加防抖逻辑
  const timer = setTimeout(() => {
    if (address && callReadMethod) {
      setLoading(true);
      setCurrentPage(0);
      fetchMyProjects(0, PROJECTS_PER_PAGE);
    }
  }, 100);
  
  return () => clearTimeout(timer);
}, [address, callReadMethod]);

const loadMoreProjects = () => {
  if (!loading && hasMoreProjects) {
    const nextStartIndex = currentPage * PROJECTS_PER_PAGE + PROJECTS_PER_PAGE;
    setLoading(true);
    setCurrentPage(prev => prev + 1);
    fetchMyProjects(nextStartIndex, PROJECTS_PER_PAGE);
  }
};

if (!address) {
  return (
    <div className="min-h-screen bg-[#f9f4f0] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h3 className="text-[#e27d60] text-xl font-medium mb-4">请先连接钱包</h3>
        <p className="text-gray-600 mb-6">连接钱包后可以查看您创建的项目</p>
        <div className="animate-pulse">
          <p className="text-[#85cdca] text-sm">等待钱包连接...</p>
        </div>
      </div>
    </div>
  );
}

const handleProjectPublished = () => {
  setShowPublishForm(false);
  fetchMyProjects(0, PROJECTS_PER_PAGE); // 重新获取项目列表
};

// 修改空状态下的创建按钮
return (
  <div className="min-h-screen bg-[#f9f4f0] py-8 px-4">
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#e27d60] mb-2">我创建的项目</h2>
        <div className="w-24 h-1 bg-[#85cdca] mx-auto rounded-full"></div>
        
      </div>
      
      {/* 加载状态 */}
      {loading && currentPage === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#e27d60] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">正在加载您的项目...</p>
          </div>
        </div>
      ) : myProjects.length === 0 ? (
        /* 空状态 */
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="w-20 h-20 bg-[#f5e9e2] rounded-full flex items-center justify-center mx-auto mb-4">
            <p className="text-[#e27d60] text-3xl">📝</p>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">您还没有创建任何项目</h3>
          <p className="text-gray-600 mb-6">开始创建您的第一个项目，与朋友们一起坚持打卡吧！</p>
          {/* 修改这里，不再使用href跳转，而是使用按钮触发 */}
          <button 
            onClick={() => setShowPublishForm(true)}
            className="inline-block bg-[#e27d60] hover:bg-[#d16b51] text-white py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            创建新项目
          </button>
        </div>
      ) : (
        /* 项目列表 */
        <>
          <div className="projects-grid grid grid-cols-1 gap-6">
            {myProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isInitiator={project.isInitiator} // 添加这一行
                onFinishProject={handleFinishProject}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              />
            ))}
          </div>
          
          {/* 加载更多按钮 */}
          {hasMoreProjects && (
            <div className="load-more-container flex justify-center mt-10">
              <button 
                onClick={loadMoreProjects} 
                disabled={loading}
                className={`px-8 py-3 rounded-full transition-all duration-300 ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#85cdca] hover:bg-[#74c0be] text-gray-800 hover:shadow-md'}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    加载中...
                  </span>
                ) : '加载更多'}
              </button>
            </div>
          )}
          
          {/* 已加载全部项目提示 */}
          {!hasMoreProjects && myProjects.length > 0 && (
            <div className="text-center mt-8 text-gray-500 text-sm py-4">
              已显示全部项目
            </div>
          )}
        </>
      )}
      
      {/* 发布项目表单 */}
      {showPublishForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPublishForm(false)} // 点击背景关闭
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // 阻止事件冒泡到背景
          >
            <PublishProject 
              onSuccess={handleProjectPublished}
              onClose={() => setShowPublishForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default MyProjects;