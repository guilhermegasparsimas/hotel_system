import { Routes, Route, Navigate } from 'react-router-dom';
import CadasterUser from './pages/CadasterUser';
import BookingPage from './pages/BookingPage/BookingPage.jsx';
import HospedePage from './pages/HospedePage.jsx';
import LoginUser from './pages/LoginPage.jsx';
import RoomPage from './pages/RoomPage/RoomPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import './App.css';
// import MinhasReservas from './components/Reserva/MinhasReservas.jsx';

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