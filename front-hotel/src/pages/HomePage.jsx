import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalReserva from '../components/Reserva/ModalReserva';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/login');
        } else {
            setUser(JSON.parse(savedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logoSection}>
                    <h2 style={styles.logo}>Hotel Gestão</h2>
                </div>

                <nav style={styles.nav}>
                    <button style={styles.navItem} onClick={() => navigate('/home')}>🏠 Dashboard</button>

                    {/* BOTÃO QUARTOS */}
                    <button style={styles.navItem} onClick={() => navigate('/quartos')}>🛏️ Ver Quartos</button>

                    {/* BOTÃO MINHAS RESERVAS (Apenas para Hóspedes) */}
                    {user.tipo === 'HOSPEDE' && (
                        <button style={styles.navItem} onClick={() => navigate('/minhas-reservas')}>
                            📅 Minhas Reservas
                        </button>
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
                            {user.tipo === 'FUNCIONARIO' ? '🛡️ Administrador' : '👤 Cliente'}
                        </span>
                    </div>
                    <div style={styles.topInfo}>
                        <p style={styles.dateText}>{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </header>

                {/* DASHBOARD CARDS */}
                <section style={styles.grid}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Status da Sessão</h3>
                        <p style={styles.cardStatus}>🟢 Conectado como {user.email}</p>
                    </div>

                    {user.tipo === 'FUNCIONARIO' ? (
                        <>
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>Quartos Ocupados</h3>
                                <p style={styles.cardValue}>12</p>
                            </div>
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>Check-ins Pendentes</h3>
                                <p style={styles.cardValue}>04</p>
                            </div>
                        </>
                    ) : (
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Suas Reservas</h3>
                            <p style={styles.cardValue}>02</p>
                        </div>
                    )}
                </section>

                {/* AÇÕES RÁPIDAS */}
                <section style={styles.actionsSection}>
                    <h2 style={styles.sectionTitle}>Ações Disponíveis</h2>
                    <div style={styles.actionRow}>
                        {user.tipo === 'HOSPEDE' ? (
                            <>
                                <button
                                    style={styles.primaryAction}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    ✨ Reservar um Quarto
                                </button>
                                <button style={styles.secondaryAction}>💬 Suporte</button>
                            </>
                        ) : (
                            <>
                                <button style={styles.primaryAction}>📝 Gerenciar Reservas</button>
                                <button style={{ ...styles.secondaryAction, backgroundColor: '#e67e22', color: '#fff' }}>
                                    🛠️ Manutenção
                                </button>
                            </>
                        )}
                    </div>
                </section>
            </main>

            {/* MODAL REUTILIZÁVEL */}
            <ModalReserva
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user.id}
            />
        </div>
    );
};
const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f5f7fb', fontFamily: 'Segoe UI, sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#4a6fa5', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px 20px' },
    logoSection: { borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', paddingBottom: '20px' },
    logo: { fontSize: '22px', fontWeight: 'bold', textAlign: 'center' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { background: 'none', border: 'none', color: '#fff', textAlign: 'left', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', transition: '0.2s' },
    logoutBtn: { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
    welcome: { fontSize: '28px', color: '#2c3e50', margin: 0 },
    roleTag: { fontSize: '11px', backgroundColor: '#e0e6ed', color: '#4a6fa5', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', marginTop: '8px', display: 'inline-block' },
    dateText: { color: '#7f8c8d', fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '50px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    cardTitle: { fontSize: '14px', color: '#7f8c8d', margin: '0 0 10px 0' },
    cardStatus: { fontSize: '14px', color: '#2ecc71', fontWeight: 'bold' },
    cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#4a6fa5', margin: 0 },
    sectionTitle: { fontSize: '20px', color: '#2c3e50', marginBottom: '20px' },
    actionRow: { display: 'flex', gap: '15px' },
    primaryAction: { padding: '15px 30px', borderRadius: '10px', border: 'none', backgroundColor: '#4a6fa5', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(74, 111, 165, 0.2)' },
    secondaryAction: { padding: '15px 30px', borderRadius: '10px', border: '1px solid #dcdfe6', backgroundColor: '#fff', color: '#4a6fa5', fontWeight: 'bold', cursor: 'pointer' }
};

export default HomePage;