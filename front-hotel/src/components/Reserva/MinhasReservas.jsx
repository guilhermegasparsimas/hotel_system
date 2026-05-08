import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MinhasReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const buscarReservas = async () => {
            const user = JSON.parse(localStorage.getItem('usuario'));
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`http://localhost:7070/reservas/usuario/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setReservas(data);
            } catch (error) {
                console.error("Erro ao buscar reservas");
            } finally {
                setLoading(false);
            }
        };
        buscarReservas();
    }, []);

    return (
        <div style={styles.page}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>← Voltar ao Dashboard</button>
            <h2 style={styles.title}>Minhas Reservas</h2>
            
            {loading ? <p>Carregando...</p> : (
                <div style={styles.list}>
                    {reservas.length > 0 ? reservas.map(res => (
                        <div key={res.id} style={styles.card}>
                            <p><strong>Quarto:</strong> {res.quarto_numero}</p>
                            <p><strong>Check-in:</strong> {new Date(res.data_checkin).toLocaleDateString()}</p>
                            <p><strong>Check-out:</strong> {new Date(res.data_checkout).toLocaleDateString()}</p>
                            <span style={styles.statusTag}>{res.status || 'Confirmado'}</span>
                        </div>
                    )) : <p>Você ainda não possui reservas.</p>}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { padding: '40px', backgroundColor: '#f5f7fb', minHeight: '100vh', fontFamily: 'Segoe UI' },
    backBtn: { background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
    title: { color: '#2c3e50', marginBottom: '30px' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statusTag: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
};

export default MinhasReservas;