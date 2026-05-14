import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ModalNovoQuarto from '../../components/Quarto/ModalNovoQuarto.jsx';
import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './RoomPage.module.css';

const RoomPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filtro, setFiltro] = useState(location.state?.filtroInicial || 'TODOS');

const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.warn("Aviso: Token não encontrado no localStorage.");
                return;
            }

            const response = await axios.get('http://localhost:7070/quartos', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("DEBUG BACK-END - Resposta recebida da API:", response.data);

            if (response.data && Array.isArray(response.data.dados)) {
                setRooms(response.data.dados);
            } else if (Array.isArray(response.data)) {
                setRooms(response.data);
            } else {
                console.error("Formato inesperado:", response.data);
                setRooms([]);
            }

        } catch (error) {
            console.error("Erro crítico ao carregar quartos:", error);
            // Se a API retornar não autorizado (token expirado), força logout limpo
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('usuario'));
        if (!loggedUser) {
            navigate('/auth/login'); 
        } else {
            setUser(loggedUser);
            fetchRooms();
        }
    }, [navigate, fetchRooms]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DISPONIVEL': return { label: 'Livre', color: '#22c55e', bg: '#dcfce7' };
            case 'OCUPADO': return { label: 'Ocupado', color: '#ef4444', bg: '#fee2e2' };
            case 'LIMPEZA': return { label: 'Limpeza', color: '#f59e0b', bg: '#fef3c7' };
            case 'MANUTENCAO': return { label: 'Manutenção', color: '#64748b', bg: '#f1f5f9' };
            default: return { label: status, color: '#334155', bg: '#f1f5f9' };
        }
    };

    const handleStatusChange = async (id, novoStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:7070/quartos/${id}/status`,
                { status: novoStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRooms();
        } catch (error) {
            alert("Erro ao alterar status.");
        }
    };

    const roomsFiltrados = useMemo(() => {
        if (!Array.isArray(rooms)) return [];

        if (filtro === 'TODOS') return rooms;
        return rooms.filter(r => r.status === filtro);
    }, [rooms, filtro]);

    if (!user) return null;

    const isGerente = user.tipo === 'GERENTE';

    return (
        <div className={styles.container}>
            <Sidebar onToggle={(state) => setSidebarOpen(state)} />

            <main
                className={styles.main}
                style={{ paddingLeft: sidebarOpen ? '300px' : '80px' }}
            >
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.welcome}>Mapa de Quartos</h1>
                        <p className={styles.dateText}>Operação atual: <strong>{user.nome}</strong></p>
                    </div>
                    {isGerente && (
                        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                            <span>+</span> Novo Quarto
                        </button>
                    )}
                </header>

                <div className={styles.filterBar}>
                    {['TODOS', 'DISPONIVEL', 'OCUPADO', 'LIMPEZA', 'MANUTENCAO'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`${styles.filterBtn} ${filtro === f ? styles.filterBtnActive : ''}`}
                        >
                            {f === 'DISPONIVEL' ? 'LIVRES' : f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={styles.loader}>Sincronizando dados...</div>
                ) : (
                    <div className={styles.roomGrid}>
                        {Array.isArray(roomsFiltrados) && roomsFiltrados.length > 0 ? (
                            roomsFiltrados.map((room) => {
                                const info = getStatusInfo(room.status);
                                return (
                                    <div
                                        key={room.id}
                                        className={styles.roomCard}
                                        style={{ borderColor: filtro === 'TODOS' ? 'transparent' : info.color }}
                                    >
                                        <div className={styles.statusBadge} style={{ color: info.color, backgroundColor: info.bg }}>
                                            {info.label}
                                        </div>

                                        <div className={styles.roomContent}>
                                            <span className={styles.roomType}>{room.tipo}</span>
                                            <span className={styles.roomNumber}>{room.room_number || room.numero}</span>
                                            <span className={styles.roomPrice}>R$ {room.preco} <small style={{ fontSize: '10px' }}>/dia</small></span>
                                        </div>

                                        <div className={styles.cardActions}>
                                            {room.status === 'DISPONIVEL' && (
                                                <button className={styles.iconBtnReserve} onClick={() => navigate(`/reservas/${room.id}`)}>
                                                    📅 Reservar
                                                </button>
                                            )}
                                            <div className={styles.operationalActions}>
                                                {room.status === 'LIMPEZA' && (
                                                    <button className={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'DISPONIVEL')} title="Liberar Quarto">✨</button>
                                                )}
                                                {room.status === 'DISPONIVEL' && (
                                                    <button className={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'MANUTENCAO')} title="Enviar para Manutenção">🛠️</button>
                                                )}
                                                {room.status === 'MANUTENCAO' && (
                                                    <button className={styles.circleBtn} onClick={() => handleStatusChange(room.id, 'LIMPEZA')} title="Enviar para Limpeza">🧹</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                <p style={{ fontSize: '18px', fontWeight: '600' }}>Nenhum quarto encontrado.</p>
                                <p style={{ fontSize: '14px' }}>Tente mudar o filtro ou cadastrar um novo quarto.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <ModalNovoQuarto
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); fetchRooms(); }}
            />
        </div>
    );
};

export default RoomPage;