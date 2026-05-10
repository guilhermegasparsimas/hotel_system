import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalNovoQuarto from '../components/Quartos/ModalNovoQuarto';

const RoomPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(savedUser));
        fetchRooms(token);
    }, [navigate]);

  const fetchRooms = async (token) => {
    try {
        const response = await axios.get('http://localhost:7070/quartos', {
            headers: { Authorization: `Bearer ${token}` }
        });
        // IMPORTANTE: Agora usamos .dados porque seu controller envia um objeto
        setRooms(response.data.dados); 
        setLoading(false);
    } catch (error) {
        console.error("Erro ao carregar quartos:", error);
        setLoading(false);
    }
};

const handleStatusChange = async (roomId, novoStatus) => {
        try {
            const token = localStorage.getItem('token');
            // Chamada para a rota que criamos no seu Controller
            await axios.put('http://localhost:7070/quartos/status', 
                { id: roomId, novoStatus: novoStatus }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Atualiza a lista local para refletir a mudança imediatamente
            fetchRooms(token);
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao atualizar status.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DISPONIVEL': return { color: '#2ecc71', label: 'Livre' };
            case 'OCUPADO': return { color: '#e74c3c', label: 'Ocupado' };
            case 'LIMPEZA': return { color: '#f1c40f', label: 'Limpeza' };
            case 'MANUTENCAO': return { color: '#95a5a6', label: 'Manutenção' };
            default: return { color: '#34495e', label: status };
        }
    };

    if (!user) return null;

    const isStaff = user.tipo === 'GERENTE' || user.tipo === 'RECEPCIONISTA';

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logoSection}>
                    <h2 style={styles.logo}>Hotel Gestão</h2>
                </div>
                <nav style={styles.nav}>
                    <button style={styles.navItem} onClick={() => navigate('/home')}>🏠 Dashboard</button>
                    <button style={{...styles.navItem, backgroundColor: 'rgba(255,255,255,0.1)'}} onClick={() => navigate('/quartos')}>🛏️ Mapa de Quartos</button>
                    {isStaff && (
                        <button style={styles.navItem} onClick={() => navigate('/hospedes')}>👥 Hóspedes</button>
                    )}
                </nav>
                <button style={styles.logoutBtn} onClick={handleLogout}>Sair da Conta</button>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcome}>Mapa de Quartos</h1>
                        <p style={styles.dateText}>Clique nos botões de ação para atualizar o status.</p>
                    </div>
                    {isStaff && (
                        <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>+ Novo Quarto</button>
                    )}
                </header>

                {loading ? (
                    <p>Carregando quartos...</p>
                ) : (
                    <div style={styles.roomGrid}>
                        {rooms.map((room) => {
                            const statusInfo = getStatusStyle(room.status);
                            return (
                                <div key={room.id} style={styles.roomCard}>
                                    <div style={{...styles.statusIndicator, backgroundColor: statusInfo.color}}></div>
                                    <div style={styles.roomContent}>
                                        <span style={styles.roomNumber}>Quarto {room.room_number}</span>
                                        <span style={styles.roomType}>{room.tipo}</span>
                                        <div style={{...styles.statusBadge, color: statusInfo.color, borderColor: statusInfo.color}}>
                                            {statusInfo.label}
                                        </div>
                                    </div>
                                    
                                    {/* MENU DE AÇÕES RÁPIDAS NO CARD */}
                                    <div style={styles.actionBar}>
                                        {room.status === 'LIMPEZA' && (
                                            <button 
                                                title="Concluir Limpeza"
                                                style={{...styles.miniBtn, color: '#2ecc71'}}
                                                onClick={() => handleStatusChange(room.id, 'DISPONIVEL')}
                                            >
                                                ✅ Liberar
                                            </button>
                                        )}
                                        {room.status === 'DISPONIVEL' && (
                                            <button 
                                                title="Enviar para Manutenção"
                                                style={{...styles.miniBtn, color: '#e67e22'}}
                                                onClick={() => handleStatusChange(room.id, 'MANUTENCAO')}
                                            >
                                                🔧 Reparar
                                            </button>
                                        )}
                                        {room.status === 'MANUTENCAO' && (
                                            <button 
                                                title="Mandar para Limpeza"
                                                style={{...styles.miniBtn, color: '#f1c40f'}}
                                                onClick={() => handleStatusChange(room.id, 'LIMPEZA')}
                                            >
                                                🧹 Limpar
                                            </button>
                                        )}
                                        {/* Botão de Excluir (Apenas Gerente) */}
                                        {user.tipo === 'GERENTE' && room.status !== 'OCUPADO' && (
                                            <button 
                                                style={{...styles.miniBtn, color: '#e74c3c'}}
                                                onClick={() => { if(window.confirm("Excluir quarto?")) alert("Ação de delete aqui"); }}
                                            >
                                                🗑️
                                            </button>
                                        )}
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
    container: { display: 'flex', height: '100vh', backgroundColor: '#f5f7fb', fontFamily: 'Segoe UI, sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#2c3e50', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px 20px' },
    logoSection: { borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', paddingBottom: '20px' },
    logo: { fontSize: '22px', fontWeight: 'bold', textAlign: 'center', color: '#ecf0f1' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { background: 'none', border: 'none', color: '#bdc3c7', textAlign: 'left', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', transition: '0.2s' },
    logoutBtn: { padding: '12px', borderRadius: '8px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    welcome: { fontSize: '28px', color: '#2c3e50', margin: 0 },
    dateText: { color: '#7f8c8d', fontSize: '14px', marginTop: '5px' },
    addBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    
    // Grid de Quartos
    roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    roomCard: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative', display: 'flex', flexDirection: 'column' },
    statusIndicator: { height: '6px', width: '100%' },
    roomContent: { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
    roomNumber: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' },
    roomType: { fontSize: '12px', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '1px' },
    statusBadge: { marginTop: '10px', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold', border: '1px solid' },
    actionBtn: { border: 'none', borderTop: '1px solid #eee', background: '#fdfdfd', padding: '10px', cursor: 'pointer', color: '#3498db', fontWeight: 'bold', fontSize: '13px' }
};

export default RoomPage;