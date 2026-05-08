import React, { useState, useEffect } from 'react';

const ModalReserva = ({ isOpen, onClose, userId }) => {
    const [quartos, setQuartos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reserva, setReserva] = useState({
        quartoId: '',
        dataInicio: '',
        dataFim: ''
    });

    useEffect(() => {
        if (isOpen) {
            const buscarQuartos = async () => {
                try {
                    const response = await fetch('http://localhost:7070/quartos/disponiveis');
                    const data = await response.json();
                    setQuartos(data);
                } catch (error) {
                    console.error("Erro ao buscar quartos:", error);
                }
            };
            buscarQuartos();
        }
    }, [isOpen]);

    const handleConfirmar = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:7070/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId: userId,
                    quartoId: reserva.quartoId,
                    data_checkin: reserva.dataInicio,
                    data_checkout: reserva.dataFim
                })
            });

            if (response.ok) {
                alert("Reserva confirmada!");
                onClose();
            } else {
                const err = await response.json();
                alert(err.message || "Erro na reserva");
            }
        } catch (error) {
            alert("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Nova Reserva</h3>
                    <button onClick={onClose} style={styles.closeBtn}>&times;</button>
                </div>
                
                <form onSubmit={handleConfirmar} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quarto:</label>
                        <select 
                            style={styles.input} 
                            required
                            onChange={(e) => setReserva({...reserva, quartoId: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {quartos.map(q => (
                                <option key={q.id} value={q.id}>
                                    Quarto {q.numero} - {q.tipo} (R$ {q.preco_diaria})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Check-in:</label>
                            <input 
                                type="date" 
                                style={styles.input} 
                                required 
                                onChange={(e) => setReserva({...reserva, dataInicio: e.target.value})} 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Check-out:</label>
                            <input 
                                type="date" 
                                style={styles.input} 
                                required 
                                onChange={(e) => setReserva({...reserva, dataFim: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button type="submit" style={styles.confirmBtn} disabled={loading}>
                        {loading ? "Processando..." : "Confirmar Reserva"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', zIndex: 2000 
    },
    card: { 
        backgroundColor: '#fff', width: '400px', padding: '30px', 
        borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
    },
    header: { 
        display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '25px' 
    },
    title: { margin: 0, color: '#2c3e50', fontSize: '20px' },
    closeBtn: { 
        background: 'none', border: 'none', fontSize: '28px', 
        cursor: 'pointer', color: '#999' 
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    label: { fontSize: '13px', fontWeight: '600', color: '#4a6fa5' },
    input: { 
        padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', 
        backgroundColor: '#ffffff', // Força fundo branco
        color: '#333',              // Força texto escuro
        fontSize: '14px', outline: 'none' 
    },
    row: { display: 'flex', gap: '15px' },
    confirmBtn: { 
        padding: '14px', backgroundColor: '#2ecc71', color: '#fff', 
        border: 'none', borderRadius: '8px', fontWeight: 'bold', 
        cursor: 'pointer', fontSize: '16px', marginTop: '10px' 
    }
};

export default ModalReserva;