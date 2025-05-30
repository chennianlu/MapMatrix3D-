import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 浏览器router路由
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename='/'>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>,
)
