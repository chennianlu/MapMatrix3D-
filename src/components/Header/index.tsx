import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import './style.css';
import { removeToken } from '../../utils/auth';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    removeToken();
    message.success('退出登录成功');
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-title">
        <h1>能源大数据可视化平台</h1>
        <div className="header-subtitle">Energy Big Data Visualization Platform</div>
      </div>
      <div className="header-right">
        <div className="header-time">{currentTime}</div>
        <button className="logout-button" onClick={handleLogout}>
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Header; 