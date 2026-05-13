import React, { useState, useEffect } from 'react';
import { data } from 'react-router-dom';

const ModalReserva = ({ isOpen, onClose, funcionarioId }) => {
    const [quartos, setQuartos] = useState([]);
    const [hospedes, setHospedes] = useState([]); 
    const [loading, setLoading] = useState(false);
    
    const [reserva, setReserva] = useState({
        quartoId: '',
        hospedeId: '',
        dataCheckin: '',
        dataCheckout: '',
        valorTotal: 0
    });

    useEffect(() => {
        if (isOpen) {
            const carregarDados = async () => {
                try {
                    const [resQuartos, resHospedes] = await Promise.all([
                        fetch('http://localhost:7070/quartos/disponiveis'),
                        fetch('http://localhost:7070/hospedes')
                    ]);
                    
                    const dadosQuartos = await resQuartos.json();
                    const dadosHospedes = await resHospedes.json();
                    
                    setQuartos(dadosQuartos);
                    setHospedes(dadosHospedes.dados || dadosHospedes); 
                } catch (error) {
                    console.error("Erro ao buscar dados para reserva:", error);
                }
            };
            carregarDados();
        }
    }, [isOpen]);

    useEffect(() => {
        if (reserva.dataCheckin && reserva.dataCheckout && reserva.quartoId) {
            const quarto = quartos.find(q => q.id === parseInt(reserva.quartoId));
            if (quarto) {
                const inicio = new Date(reserva.dataCheckin);
                const fim = new Date(reserva.dataCheckout);
                const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
                
                if (dias > 0) {
                    setReserva(prev => ({ ...prev, valorTotal: dias * (quarto.preco || quarto.preco_diaria) }));
                }
            }
        }
    }, [reserva.dataCheckin, reserva.dataCheckout, reserva.quartoId, quartos]);

    const handleConfirmar = async (e) => {
        e.preventDefault();
        if (new Date(reserva.dataCheckin) >= new Date(reserva.dataCheckout)) {
            return alert("A data de saída deve ser maior que a de entrada.");
        }

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
                    quarto_id: reserva.quartoId,
                    hospede_id: reserva.hospedeId,
                    funcionario_id: funcionarioId, 
                    data_checkin: reserva.dataCheckin,
                    data_checkout: reserva.dataCheckout,
                    valor_total: reserva.valorTotal,
                    status_reserva: 'CONFIRMADA',
                    status_pagamento: 'PENDENTE'
                })
            });

            if (response.ok) {
                alert("Reserva registrada com sucesso!");
                onClose();
            } else {
                const err = await response.json();
                alert(err.message || "Erro na reserva");
            }
        } catch (error) {
            alert("Erro de conexão com o servidor");
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
                        <label style={styles.label}>Hóspede:</label>
                        <select 
                            style={styles.input} 
                            required
                            value={reserva.hospedeId}
                            onChange={(e) => setReserva({...reserva, hospedeId: e.target.value})}
                        >
                            <option value="">Selecione o hóspede...</option>
                            {hospedes.map(h => (
                                <option key={h.id} value={h.id}>{h.nome} - {h.cpf}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quarto Disponível:</label>
                        <select 
                            style={styles.input} 
                            required
                            value={reserva.quartoId}
                            onChange={(e) => setReserva({...reserva, quartoId: e.target.value})}
                        >
                            <option value="">Selecione o quarto...</option>
                            {quartos.map(q => (
                                <option key={q.id} value={q.id}>
                                    Quarto {q.room_number || q.numero} - {q.tipo} (R$ {q.preco || q.preco_diaria})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Data Entrada:</label>
                            <input 
                                type="datetime-local" 
                                style={styles.input} 
                                required 
                                onChange={(e) => setReserva({...reserva, dataCheckin: e.target.value})} 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Data Saída:</label>
                            <input 
                                type="datetime-local" 
                                style={styles.input} 
                                required 
                                onChange={(e) => setReserva({...reserva, dataCheckout: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div style={styles.totalBox}>
                        <span>Valor Total:</span>
                        <strong>R$ {reserva.valorTotal.toFixed(2)}</strong>
                    </div>

                    <button type="submit" style={styles.confirmBtn} disabled={loading}>
                        {loading ? "Processando..." : "Finalizar Reserva"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
    card: { backgroundColor: '#fff', width: '450px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '800' },
    closeBtn: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    label: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '14px', outline: 'none' },
    row: { display: 'flex', gap: '15px' },
    totalBox: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1e293b', marginTop: '5px' },
    confirmBtn: { padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }
};

export default ModalReserva;