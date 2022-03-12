import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login/Login'
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
