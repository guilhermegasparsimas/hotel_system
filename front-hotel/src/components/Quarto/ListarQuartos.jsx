import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListaQuartos = () => {
    const [quartos, setQuartos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuartos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:7070/quartos', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Como seu controller retorna { dados: [...] }, pegamos os dados aqui
                setQuartos(response.data.dados || response.data);
            } catch (error) {
                console.error("Erro ao buscar quartos:", error);
            }
        };

        fetchQuartos();
    }, []);

    return (
        <div style={styles.page}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>← Voltar</button>
            <h2 style={styles.title}>Quartos do Hotel</h2>
            <div style={styles.grid}>
                {quartos.map(q => (
                    <div key={q.id} style={styles.card}>
                        <div style={styles.imgPlaceholder}>🛏️</div>
                        {/* Ajustado para q.room_number que é como está no seu Controller */}
                        <h3>Quarto {q.room_number}</h3>
                        <p style={styles.typeTag}>{q.tipo}</p>
                        <p style={styles.price}>R$ {q.preco} / noite</p>
                        <span style={{
                            ...styles.status, 
                            color: q.status === 'DISPONIVEL' ? '#2ecc71' : '#e74c3c'
                        }}>
                            ● {q.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '40px', backgroundColor: '#f5f7fb', minHeight: '100vh', fontFamily: 'Segoe UI' },
    backBtn: { background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
    title: { color: '#2c3e50', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' },
    imgPlaceholder: { fontSize: '40px', marginBottom: '10px' },
    typeTag: { fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', marginBottom: '10px' },
    price: { fontWeight: 'bold', color: '#2c3e50', fontSize: '18px' },
    status: { fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '10px' }
};

export default ListaQuartos;