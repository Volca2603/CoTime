import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import MyProjects from './pages/MyProjects';
import ConnectWallet from './components/ConnectWallet';

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <nav>
          <ConnectWallet />
          <a href="/">首页</a>
          <a href="/my-projects">我的项目</a>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/my-projects" element={<MyProjects />} />
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;