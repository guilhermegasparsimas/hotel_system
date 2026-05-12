import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalNovoQuarto from '../components/Quarto/ModalNovoQuarto.jsx';
import ModalNovoHospede from '../components/Hospede/ModalNovoHospede.jsx';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        disponiveis: 0,
        ocupados: 0,
        limpeza: 0,
        manutencao: 0
    });

    const [isModalQuartoOpen, setIsModalQuartoOpen] = useState(false);
    const [isModalHospedeOpen, setIsModalHospedeOpen] = useState(false);

    const fetchStats = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:7070/quartos/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error("Erro ao buscar estatísticas: Token inválido ou expirado.");
            // Se o erro for 401 ou 403, é recomendável deslogar
            if (err.response?.status === 401) {
                handleLogout();
            }
        }
    }, [navigate]);

    useEffect(() => {
        const savedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/login');
        } else {
            try {
                setUser(JSON.parse(savedUser));
                fetchStats();

                // Atualização em tempo real (Polling)
                const interval = setInterval(fetchStats, 5000);
                return () => clearInterval(interval);
            } catch (e) {
                console.error("Erro ao processar dados do usuário");
                handleLogout();
            }
        }
    }, [navigate, fetchStats]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login'); // Ajustado para a rota padrão de login
    };

    if (!user) return null;

    const isStaff = user.tipo === 'GERENTE' || user.tipo === 'RECEPCIONISTA';

    // Função para formatar números (ex: 01, 02...)
    const formatNumber = (num) => (num < 10 ? `0${num}` : num);

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logoSection}>
                    <h2 style={styles.logo}>Hotel Gestão</h2>
                </div>

                <nav style={styles.nav}>
                    <button style={styles.navItemActive} onClick={() => navigate('/home')}>🏠 Dashboard</button>
                    <button style={styles.navItem} onClick={() => navigate('/quartos')}>🛏️ Mapa de Quartos</button>

                    {isStaff && (
                        <>
                            <button style={styles.navItem} onClick={() => navigate('/hospedes')}>👥 Hóspedes</button>
                            <button style={styles.navItem} onClick={() => navigate('/financeiro')}>💰 Financeiro</button>
                        </>
                    )}
                </nav>

                <button style={styles.logoutBtn} onClick={handleLogout}>
                    Sair da Conta
                </button>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcome}>Bem-vindo, {user.nome}!</h1>
                        <span style={styles.roleTag}>
                            {user.tipo === 'GERENTE' ? '⭐ Administrador (Gerente)' : '🔑 Staff (Recepcionista)'}
                        </span>
                    </div>
                    <div style={styles.topInfo}>
                        <p style={styles.dateText}>
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                </header>

                <h2 style={styles.sectionTitle}>Status dos Quartos em Tempo Real</h2>
                <section style={styles.grid}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Disponíveis</h3>
                        <p style={{ ...styles.cardValue, color: '#2ecc71' }}>{formatNumber(stats.disponiveis)}</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Ocupados</h3>
                        <p style={{ ...styles.cardValue, color: '#e74c3c' }}>{formatNumber(stats.ocupados)}</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Em Limpeza</h3>
                        <p style={{ ...styles.cardValue, color: '#f1c40f' }}>{formatNumber(stats.limpeza)}</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Manutenção</h3>
                        <p style={{ ...styles.cardValue, color: '#95a5a6' }}>{formatNumber(stats.manutencao)}</p>
                    </div>
                </section>

                {isStaff && (
                    <section style={styles.actionsSection}>
                        <h2 style={styles.sectionTitle}>Controle de Operações</h2>
                        <div style={styles.actionRow}>
                            <button style={styles.primaryAction} onClick={() => setIsModalQuartoOpen(true)}>
                                ✨ Cadastrar Novo Quarto
                            </button>
                            <button style={styles.secondaryAction} onClick={() => setIsModalHospedeOpen(true)}>
                                👤 Novo Hóspede
                            </button>
                            <button style={styles.maintenanceAction} onClick={() => navigate('/quartos')}>
                                🔧 Gerenciar Manutenções
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <ModalNovoQuarto
                isOpen={isModalQuartoOpen}
                onClose={() => {
                    setIsModalQuartoOpen(false);
                    fetchStats();
                }}
            />
            <ModalNovoHospede
                isOpen={isModalHospedeOpen}
                onClose={() => {
                    setIsModalHospedeOpen(false);
                    fetchStats();
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
    navItemActive: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', textAlign: 'left', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
    logoutBtn: { padding: '12px', borderRadius: '8px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
    welcome: { fontSize: '28px', color: '#2c3e50', margin: 0 },
    roleTag: { fontSize: '12px', backgroundColor: '#d1d8e0', color: '#2c3e50', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' },
    dateText: { color: '#7f8c8d', fontSize: '14px', textTransform: 'capitalize' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '50px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', borderBottom: '4px solid #eee' },
    cardTitle: { fontSize: '14px', color: '#7f8c8d', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' },
    cardValue: { fontSize: '42px', fontWeight: 'bold', margin: 0 },
    sectionTitle: { fontSize: '20px', color: '#2c3e50', marginBottom: '20px', fontWeight: '600' },
    actionRow: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    primaryAction: { padding: '15px 25px', borderRadius: '10px', border: 'none', backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(52, 152, 219, 0.2)' },
    secondaryAction: { padding: '15px 25px', borderRadius: '10px', border: '1px solid #dcdfe6', backgroundColor: '#fff', color: '#34495e', fontWeight: 'bold', cursor: 'pointer' },
    maintenanceAction: { padding: '15px 25px', borderRadius: '10px', border: 'none', backgroundColor: '#e67e22', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default HomePage;