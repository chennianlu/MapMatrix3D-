
import { useNavigate, useRoutes } from 'react-router-dom'


function App() {

  const element = useRoutes(routes);

  return (
    <div id="app">
     {element}
    </div>
  );
}

export default App;
