import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListaQuartos = () => {
    const [quartos, setQuartos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:7070/quartos')
            .then(res => res.json())
            .then(data => setQuartos(data));
    }, []);

    return (
        <div style={styles.page}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>← Voltar</button>
            <h2 style={styles.title}>Quartos Disponíveis</h2>
            <div style={styles.grid}>
                {quartos.map(q => (
                    <div key={q.id} style={styles.card}>
                        <div style={styles.imgPlaceholder}>🛏️</div>
                        <h3>Quarto {q.numero}</h3>
                        <p>{q.tipo}</p>
                        <p style={styles.price}>R$ {q.preco_diaria} / noite</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '40px', backgroundColor: '#f5f7fb', minHeight: '100vh', fontFamily: 'Segoe UI' },
    backBtn: { background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    imgPlaceholder: { fontSize: '40px', marginBottom: '10px' },
    price: { fontWeight: 'bold', color: '#2ecc71' }
};

export default ListaQuartos;