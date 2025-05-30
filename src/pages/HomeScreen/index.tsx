import React from 'react';
import { useNavigate } from 'react-router-dom';
import CoreViewExample from '../../components/GraphGIS/CoreViewExample';
import Header from '../../components/Header';
import ChartPanel from '../../components/ChartPanel';
import './styles.css';
import { removeToken } from '../../utils/auth';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div className="home-screen">
      <CoreViewExample showGUI={false} />
      <Header />
      
      <div className="content-container">
        {/* 左侧面板 */}
        <div className="left-panel">
          <ChartPanel
            title="能源消耗趋势"
            type="line"
            className="chart-item"
          />
          <ChartPanel
            title="能源结构分布"
            type="pie"
            className="chart-item"
          />
        </div>

        {/* 中间面板 */}
        <div className="center-panel">
          <div className="bottom-charts">
            <ChartPanel
              title="区域能源对比"
              type="bar"
              className="chart-item"
            />
            <ChartPanel
              title="能源效率分析"
              type="radar"
              className="chart-item"
            />
            <ChartPanel
              title="碳排放趋势"
              type="line"
              className="chart-item"
            />
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="right-panel">
          <ChartPanel
            title="能源消耗排名"
            type="bar"
            className="chart-item"
          />
          <ChartPanel
            title="能源结构预测"
            type="line"
            className="chart-item"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen; 