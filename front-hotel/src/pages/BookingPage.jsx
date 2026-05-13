import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalReserva from '../components/Reserva/ModalReserva.jsx';

const BookingPage = () => {
    const [reservas, setReservas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState('TODAS');
    const [loading, setLoading] = useState(true);

    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7070/reservas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservas(response.data);
        } catch (error) {
            console.error("Erro ao carregar reservas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleUpdateStatus = async (id, novoStatus) => {
        if (!window.confirm(`Deseja alterar o status para ${novoStatus}?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:7070/reservas/${id}/status`, 
                { status: novoStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchReservas();
        } catch (error) {
            alert("Erro ao atualizar status.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMADA': return { bg: '#e0f2fe', color: '#0369a1' };
            case 'CHECKIN': return { bg: '#dcfce7', color: '#15803d' };
            case 'CHECKOUT': return { bg: '#f1f5f9', color: '#475569' };
            case 'CANCELADA': return { bg: '#fee2e2', color: '#b91c1c' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Gestão de Reservas</h1>
                    <p style={styles.subtitle}>Controle de entradas, saídas e ocupação em tempo real.</p>
                </div>
                <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                    + Nova Reserva
                </button>
            </header>

            {/* Barra de Filtros */}
            <div style={styles.filterBar}>
                {['TODAS', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setFiltroStatus(status)}
                        style={{
                            ...styles.filterTab,
                            borderBottom: filtroStatus === status ? '3px solid #3b82f6' : '3px solid transparent',
                            color: filtroStatus === status ? '#1e293b' : '#94a3b8'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thr}>
                            <th style={styles.th}>Hóspede</th>
                            <th style={styles.th}>Quarto</th>
                            <th style={styles.th}>Entrada / Saída</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas
                            .filter(r => filtroStatus === 'TODAS' || r.status_reserva === filtroStatus)
                            .map(reserva => {
                                const statusStyle = getStatusStyle(reserva.status_reserva);
                                return (
                                    <tr key={reserva.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.hospedeName}>{reserva.hospede_nome}</div>
                                            <div style={styles.hospedeCpf}>{reserva.hospede_cpf}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.roomBadge}>Q-{reserva.quarto_numero}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.dateText}>{new Date(reserva.data_entrada).toLocaleDateString()}</div>
                                            <div style={styles.dateTextSub}>{new Date(reserva.data_saida).toLocaleDateString()}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <strong style={styles.priceText}>R$ {reserva.valor_total}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color}}>
                                                {reserva.status_reserva}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {reserva.status_reserva === 'CONFIRMADA' && (
                                                    <button onClick={() => handleUpdateStatus(reserva.id, 'CHECKIN')} style={styles.actionBtnCheckin}>Check-in</button>
                                                )}
                                                {reserva.status_reserva === 'CHECKIN' && (
                                                    <button onClick={() => handleUpdateStatus(reserva.id, 'CHECKOUT')} style={styles.actionBtnCheckout}>Checkout</button>
                                                )}
                                                {['CONFIRMADA', 'CHECKIN'].includes(reserva.status_reserva) && (
                                                    <button onClick={() => handleUpdateStatus(reserva.id, 'CANCELADA')} style={styles.actionBtnCancel}>&times;</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            <ModalReserva 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); fetchReservas(); }} 
                funcionarioId={usuarioLogado?.id}
            />
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
    subtitle: { fontSize: '15px', color: '#64748b', margin: '5px 0 0 0' },
    addBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' },
    filterBar: { display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0' },
    filterTab: { padding: '10px 5px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '18px 24px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
    td: { padding: '18px 24px', verticalAlign: 'middle' },
    hospedeName: { fontWeight: '700', color: '#1e293b', fontSize: '15px' },
    hospedeCpf: { fontSize: '12px', color: '#94a3b8' },
    roomBadge: { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#475569' },
    statusBadge: { padding: '6px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' },
    priceText: { color: '#0f172a', fontSize: '15px' },
    dateText: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
    dateTextSub: { fontSize: '12px', color: '#94a3b8' },
    actions: { display: 'flex', gap: '8px' },
    actionBtnCheckin: { backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    actionBtnCheckout: { backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    actionBtnCancel: { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }
};

export default BookingPage;