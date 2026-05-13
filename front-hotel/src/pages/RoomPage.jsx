import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ModalNovoQuarto from '../components/Quarto/ModalNovoQuarto';
import Sidebar from '../components/Sidebar/Sidebar';

const RoomPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filtro, setFiltro] = useState(location.state?.filtroInicial || 'TODOS');

    const fetchRooms = useCallback(async (token) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:7070/quartos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data.dados || response.data || []);
        } catch (error) {
            console.error("Erro ao carregar quartos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        if (!savedUser || !token) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(savedUser));
        fetchRooms(token);
    }, [navigate, fetchRooms]);

    const handleStatusChange = async (roomId, novoStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:7070/quartos/status',
                { id: roomId, novoStatus: novoStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRooms(token);
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao atualizar status.");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("⚠️ Excluir este quarto permanentemente?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7070/quartos/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRooms(token);
        } catch (error) {
            alert("Erro ao excluir quarto.");
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DISPONIVEL': return { color: '#10b981', bg: '#ecfdf5', label: 'Livre' };
            case 'OCUPADO': return { color: '#ef4444', bg: '#fef2f2', label: 'Ocupado' };
            case 'LIMPEZA': return { color: '#f59e0b', bg: '#fffbeb', label: 'Limpeza' };
            case 'MANUTENCAO': return { color: '#6b7280', bg: '#f3f4f6', label: 'Manutenção' };
            default: return { color: '#34495e', bg: '#fff', label: status };
        }
    };

    const roomsFiltrados = filtro === 'TODOS' ? rooms : rooms.filter(r => r.status === filtro);
    if (!user) return null;
    const isGerente = user.tipo === 'GERENTE';

    return (
        <div style={styles.container}>
            {/* Sidebar gerenciando o estado de abertura */}
            <Sidebar onToggle={(state) => setSidebarOpen(state)} />

            <main style={{
                ...styles.main,
                // AJUSTE DINÂMICO: Sincronizado com a Sidebar
                paddingLeft: sidebarOpen ? '300px' : '80px', 
            }}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcome}>Mapa de Quartos</h1>
                        <p style={styles.dateText}>Operação atual: <strong>{user.nome} ({user.tipo})</strong></p>
                    </div>
                    {isGerente && (
                        <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                            <span>+</span> Novo Quarto
                        </button>
                    )}
                </header>

                <div style={styles.filterBar}>
                    {['TODOS', 'DISPONIVEL', 'OCUPADO', 'LIMPEZA', 'MANUTENCAO'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            style={{
                                ...styles.filterBtn,
                                backgroundColor: filtro === f ? '#0f172a' : '#fff',
                                color: filtro === f ? '#fff' : '#64748b',
                                borderColor: filtro === f ? '#0f172a' : '#e2e8f0',
                            }}
                        >
                            {f === 'DISPONIVEL' ? 'LIVRES' : f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={styles.loader}>Sincronizando dados...</div>
                ) : (
                    <div style={styles.roomGrid}>
                        {roomsFiltrados.map((room) => {
                            const info = getStatusInfo(room.status);
                            return (
                                <div key={room.id} style={styles.roomCard}>
                                    <div style={{ ...styles.statusBadge, color: info.color, backgroundColor: info.bg }}>
                                        {info.label}
                                    </div>

                                    <div style={styles.roomContent}>
                                        <span style={styles.roomType}>{room.tipo}</span>
                                        <span style={styles.roomNumber}>{room.room_number || room.numero}</span>
                                        <span style={styles.roomPrice}>R$ {room.preco} <small style={{ fontSize: '10px', color: '#94a3b8' }}>/dia</small></span>
                                    </div>

                                    <div style={styles.cardActions}>
                                        {room.status === 'DISPONIVEL' && (
                                            <button
                                                style={styles.iconBtnReserve}
                                                onClick={() => navigate(`/reservar/${room.id}`)}
                                            >
                                                📅 Reservar
                                            </button>
                                        )}

                                        <div style={styles.operationalActions}>
                                            {room.status === 'LIMPEZA' && (
                                                <button style={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'DISPONIVEL')} title="Liberar">✨</button>
                                            )}
                                            {room.status === 'DISPONIVEL' && (
                                                <button style={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'MANUTENCAO')} title="Manutenção">🔧</button>
                                            )}
                                            {room.status === 'MANUTENCAO' && (
                                                <button style={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'LIMPEZA')} title="Enviar para Limpeza">🧹</button>
                                            )}

                                            {isGerente && (
                                                <>
                                                    <button style={styles.circleBtn} onClick={() => navigate(`/quartos/editar/${room.id}`)} title="Editar">✏️</button>
                                                    <button
                                                        style={{ ...styles.circleBtn, color: '#ef4444' }}
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        disabled={room.status === 'OCUPADO'}
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <ModalNovoQuarto
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchRooms(localStorage.getItem('token'));
                }}
            />
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        width: '100%', 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        fontFamily: '"Inter", sans-serif', 
        overflowX: 'hidden' 
    },
    main: {
        flex: 1, 
        paddingTop: '40px',
        paddingRight: '40px',
        paddingBottom: '40px',
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: 0,
        boxSizing: 'border-box'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    welcome: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-1px' },
    dateText: { color: '#64748b', fontSize: '14px', marginTop: '5px' },
    addBtn: { 
        backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', 
        borderRadius: '14px', fontWeight: '700', cursor: 'pointer', 
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', transition: '0.3s' 
    },

    filterBar: { display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' },
    filterBtn: { 
        padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', 
        fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0', transition: '0.3s' 
    },

    roomGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
    },
    roomCard: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        transition: 'all 0.3s ease'
    },
    statusBadge: {
        position: 'absolute', top: '20px', right: '20px', padding: '6px 12px', 
        borderRadius: '10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'
    },
    roomContent: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' },
    roomType: { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
    roomNumber: { fontSize: '32px', fontWeight: '900', color: '#1e293b' },
    roomPrice: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: '8px' },

    cardActions: { marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' },
    iconBtnReserve: {
        width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#fff', 
        border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.3s'
    },
    operationalActions: {
        display: 'flex', justifyContent: 'center', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'
    },
    circleBtn: {
        width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', 
        backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', fontSize: '16px', transition: '0.2s'
    },
    loader: { textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '600' }
};

export default RoomPage;