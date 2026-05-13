import { Routes, Route, Navigate } from 'react-router-dom';
import CadasterUser from './pages/CadasterUser';
import HomePage from './pages/HomePage.jsx';
// import MinhasReservas from './components/Reserva/MinhasReservas.jsx';
import LoginUser from './pages/LoginPage.jsx';
import HospedePage from './pages/HospedePage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" />} />

      <Route path="/cadaster" element={<CadasterUser />} />
      <Route path="/auth/login" element={<LoginUser />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/quartos" element={<RoomPage />} />
      <Route path="/hospedes" element={<HospedePage />} />
      <Route path="/reservas" element={<BookingPage />} />

      {/* <Route path="/minhas-reservas" element={<MinhasReservas />} /> */}

    </Routes>
  );
}

export default App;