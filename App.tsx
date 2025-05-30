import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { routes } from './src/router';
import './src/styles/App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </Router>
    </Provider>
  );
};

export default App; 