import { Routes, Route, Navigate } from 'react-router-dom';
import CadasterUser from './pages/CadasterUser';
import HomePage from './pages/HomePage.jsx';
// import MinhasReservas from './components/Reserva/MinhasReservas.jsx';
import LoginUser from './pages/LoginPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" />} />

      <Route path="/auth/login" element={<LoginUser />} />
      <Route path="/cadaster" element={<CadasterUser />} />
      <Route path="/home" element={<HomePage />} />

      {/* <Route path="/minhas-reservas" element={<MinhasReservas />} /> */}
      <Route path="/quartos" element={<RoomPage />} />
    </Routes>
  );
}

export default App;