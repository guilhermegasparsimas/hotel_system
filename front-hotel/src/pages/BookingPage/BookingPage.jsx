import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalReserva from '../../components/Reserva/ModalReserva.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import styles from './BookingPage.module.css';

const BookingPage = () => {
    const [reservas, setReservas] = useState([]);
    const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

    useEffect(() => { fetchReservas(); }, []);

    const handleUpdateStatus = async (id, novoStatus) => {
        if (!window.confirm(`Confirmar alteração para ${novoStatus}?`)) return;
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
        <div className={styles.container}>
            <Sidebar onToggle={(state) => setSidebarOpen(state)} />

            <main className={styles.main} style={{ paddingLeft: sidebarOpen ? '300px' : '80px' }}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Gestão de Reservas</h1>
                        <p className={styles.subtitle}>Acompanhe a ocupação e o fluxo de hóspedes.</p>
                    </div>
                    {/* Botão Moderno com Ícone */}
                    <button className={styles.addBtn} onClick={() => setIsModalBookingOpen(true)}>
                        <span style={{ fontSize: '20px' }}>+</span> Nova Reserva
                    </button>
                </header>

                <div className={styles.filterBar}>
                    {['TODAS', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setFiltroStatus(status)}
                            className={`${styles.filterTab} ${filtroStatus === status ? styles.filterTabActive : ''}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Carregando dados...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Hóspede</th>
                                    <th className={styles.th}>Quarto</th>
                                    <th className={styles.th}>Estadia</th>
                                    <th className={styles.th}>Total</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas
                                    .filter(r => filtroStatus === 'TODAS' || r.status_reserva === filtroStatus)
                                    .map(reserva => {
                                        const styleStatus = getStatusStyle(reserva.status_reserva);
                                        return (
                                            <tr key={reserva.id} className={styles.tr}>
                                                <td className={styles.td}>
                                                    <span className={styles.hospedeName}>{reserva.hospede_nome}</span>
                                                    <span className={styles.hospedeCpf}>{reserva.hospede_cpf}</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={styles.roomBadge}>Quarto {reserva.quarto_numero}</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.dateText}>{new Date(reserva.data_entrada).toLocaleDateString()}</div>
                                                    <div className={styles.dateTextSub}>até {new Date(reserva.data_saida).toLocaleDateString()}</div>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={styles.priceText}>R$ {reserva.valor_total}</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={styles.statusBadge} style={{backgroundColor: styleStatus.bg, color: styleStatus.color}}>
                                                        {reserva.status_reserva}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.actions}>
                                                        {reserva.status_reserva === 'CONFIRMADA' && (
                                                            <button onClick={() => handleUpdateStatus(reserva.id, 'CHECKIN')} className={styles.actionBtnCheckin}>Fazer Check-in</button>
                                                        )}
                                                        {reserva.status_reserva === 'CHECKIN' && (
                                                            <button onClick={() => handleUpdateStatus(reserva.id, 'CHECKOUT')} className={styles.actionBtnCheckout}>Finalizar Checkout</button>
                                                        )}
                                                        {['CONFIRMADA', 'CHECKIN'].includes(reserva.status_reserva) && (
                                                            <button onClick={() => handleUpdateStatus(reserva.id, 'CANCELADA')} className={styles.actionBtnCancel} title="Cancelar Reserva">&times;</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <ModalReserva 
                isOpen={isModalBookingOpen} 
                onClose={() => { setIsModalBookingOpen(false); fetchReservas(); }} 
                funcionarioId={usuarioLogado?.id}
            />
        </div>
    );
};

export default BookingPage;