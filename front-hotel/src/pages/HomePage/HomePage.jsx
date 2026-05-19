import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ModalNovoQuarto from '../../components/Quarto/ModalNovoQuarto.jsx';
import ModalNovoHospede from '../../components/Hospede/ModalNovoHospede.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';

import styles from './HomePage.module.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        disponiveis: 0,
        ocupados: 0,
        limpeza: 0,
        manutencao: 0
    });

    const [hoveredCard, setHoveredCard] = useState(null);

    const [isModalQuartoOpen, setIsModalQuartoOpen] = useState(false);
    const [isModalHospedeOpen, setIsModalHospedeOpen] = useState(false);

    const fetchStats = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:7070/quartos/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.data && 'disponiveis' in response.data) {
                console.log("Home atualizada:", response.data);
                setStats(response.data);
            } else {
                console.warn("Resposta inesperada para stats:", response.data);
            }
        } catch (err) {
            console.error("Erro no fetchStats:", err);
            if (err.response?.status === 401) handleLogout();
        }
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/auth/login');
            return;
        }

        setUser(JSON.parse(savedUser));
        fetchStats();

        const interval = setInterval(() => {
            fetchStats();
        }, 10000);

        return () => clearInterval(interval);   

    }, [navigate, fetchStats]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleFilterNavigate = (status) => {
        navigate('/quartos', { state: { filtroInicial: status } });
    };

    if (!user) return null;
    const isStaff = user.tipo === 'GERENTE' || user.tipo === 'RECEPCIONISTA';
    const formatNumber = (num) => (num < 10 ? `0${num}` : num);

    const statCards = [
        { id: 'DISPONIVEL', label: 'Disponíveis', value: stats.disponiveis, color: '#10b981' },
        { id: 'OCUPADO', label: 'Ocupados', value: stats.ocupados, color: '#ef4444' },
        { id: 'LIMPEZA', label: 'Em Limpeza', value: stats.limpeza, color: '#f59e0b' },
        { id: 'MANUTENCAO', label: 'Manutenção', value: stats.manutencao, color: '#6b7280' },
    ];

    return (
        <div className={styles.container}>
            <Sidebar onToggle={(state) => setSidebarOpen(state)} />

            <main 
                className={styles.main}
                style={{
                    paddingLeft: sidebarOpen ? '300px' : '80px',
                    width: '100%',
                }}
            >
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.welcome}>Olá, {user.nome}! 👋</h1>
                        <span className={styles.roleTag}>
                            {user.tipo === 'GERENTE' ? '⭐ Administrador' : '🔑 Staff Recepcionista'}
                        </span>
                    </div>
                    {/* Mantido o styles.topInfo. Caso não use no CSS, ele apenas ignorará de forma segura */}
                    <div className={styles.topInfo}>
                        <p className={styles.dateText}>
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                </header>

                <h2 className={styles.sectionTitle}>Status Operacional</h2>

                <section className={styles.grid}>
                    {statCards.map((card) => (
                        <div
                            key={card.id}
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => handleFilterNavigate(card.id)}
                            className={styles.card}
                            style={{
                                borderTop: `4px solid ${card.color}`,
                                transform: hoveredCard === card.id ? 'translateY(-12px)' : 'translateY(0)',
                                boxShadow: hoveredCard === card.id
                                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                borderColor: hoveredCard === card.id ? card.color : '#f1f5f9'
                            }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{card.label}</h3>
                                <span className={styles.statusDot} style={{ backgroundColor: card.color }}></span>
                            </div>
                            <p className={styles.cardValue} style={{ color: card.color }}>{formatNumber(card.value)}</p>
                        </div>
                    ))}
                </section>

                {isStaff && (
                    <section className={styles.actionsSection}>
                        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
                        <div className={styles.actionRow}>
                            <button className={styles.primaryAction} onClick={() => setIsModalQuartoOpen(true)}>
                                <span>✨</span> Cadastrar Quarto
                            </button>
                            <button className={styles.secondaryAction} onClick={() => setIsModalHospedeOpen(true)}>
                                <span>👤</span> Novo Hóspede
                            </button>
                            <button className={styles.maintenanceAction} onClick={() => handleFilterNavigate('MANUTENCAO')}>
                                <span>🔧</span> Ver Manutenções
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <ModalNovoQuarto isOpen={isModalQuartoOpen} onClose={() => { setIsModalQuartoOpen(false); fetchStats(); }} />
            <ModalNovoHospede isOpen={isModalHospedeOpen} onClose={() => { setIsModalHospedeOpen(false); fetchStats(); }} />
        </div>
    );
};

export default HomePage;