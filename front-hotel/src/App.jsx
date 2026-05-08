import { Routes, Route, Navigate } from 'react-router-dom';
import LoginUser from './pages/LoginController';
import CadasterUser from './pages/CadasterUser';
import HomePage from './pages/HomePage';
import MinhasReservas from './components/Reserva/MinhasReservas';
import ListaQuartos from './components/Quarto/ListarQuartos';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" />} />

      <Route path="/auth/login" element={<LoginUser />} />
      <Route path="/cadaster" element={<CadasterUser />} />
      <Route path="/home" element={<HomePage />} />

      <Route path="/minhas-reservas" element={<MinhasReservas />} />
      <Route path="/quartos" element={<ListaQuartos />} />
      {/* <Route path="/quartos" element={<RoomsPage />} /> */}
    </Routes>
  );
}

export default App;