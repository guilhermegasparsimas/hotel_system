import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalNovoHospede from '../components/Hospede/ModalNovoHospede';

const HospedePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [hospedes, setHospedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');

    const fetchHospedes = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:7070/hospedes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHospedes(response.data.dados || []);
        } catch (error) {
            console.error("Erro ao carregar hóspedes:", error);
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
        fetchHospedes();
    }, [navigate, fetchHospedes]);

    const handleDelete = async (id, nome) => {
        if (!window.confirm(`⚠️ Deseja remover o hóspede ${nome}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7070/hospedes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchHospedes();
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao excluir.");
        }
    };

    const hospedesFiltrados = hospedes.filter(h => 
        h.nome.toLowerCase().includes(busca.toLowerCase()) || 
        h.cpf.includes(busca)
    );

    if (!user) return null;
    const isGerente = user.tipo === 'GERENTE';

    return (
        <div style={styles.container}>
            {/* SIDEBAR PADRONIZADA */}
            <aside style={styles.sidebar}>
                
                <div style={styles.logoSection}>
                    <h2 style={styles.logo}>Hotel<span style={{color: '#3498db'}}>Gestão</span></h2>
                </div>
                <nav style={styles.nav}>
                    <button style={styles.navItem} onClick={() => navigate('/home')}>🏠 Dashboard</button>
                    <button style={styles.navItem} onClick={() => navigate('/quartos')}>🛏️ Mapa de Quartos</button>
                    <button style={{ ...styles.navItem, ...styles.navItemActive }} onClick={() => navigate('/hospedes')}>👥 Hóspedes</button>
                    <button style={styles.navItem} onClick={() => navigate('/reservas')}>📅 Reservas</button>
                    {isGerente && <button style={styles.navItem} onClick={() => navigate('/usuarios')}>👤 Equipe</button>}
                </nav>
                <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/auth/login'); }}>Sair</button>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcome}>Gerenciamento de Hóspedes</h1>
                        <p style={styles.dateText}>Total de clientes cadastrados: <strong>{hospedes.length}</strong></p>
                    </div>
                    <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                        <span>+</span> Novo Hóspede
                    </button>
                </header>

                {/* BARRA DE PESQUISA */}
                <div style={styles.searchBarContainer}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou CPF..." 
                        style={styles.searchInput}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div style={styles.loader}>Carregando banco de dados...</div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Nome Completo</th>
                                    <th style={styles.th}>CPF</th>
                                    <th style={styles.th}>Contato</th>
                                    <th style={styles.th}>Data Cadastro</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospedesFiltrados.map((h) => (
                                    <tr key={h.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.nameContainer}>
                                                <div style={styles.avatar}>{h.nome.charAt(0)}</div>
                                                <span style={styles.hospedeNome}>{h.nome}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{h.cpf}</td>
                                        <td style={styles.td}>
                                            <div style={{fontSize: '13px'}}>{h.email}</div>
                                            <div style={{fontSize: '12px', color: '#64748b'}}>{h.telefone}</div>
                                        </td>
                                        <td style={styles.td}>{new Date(h.data_cadastro).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionCell}>
                                                <button style={styles.editBtn} onClick={() => navigate(`/hospedes/editar/${h.id}`)}>✏️</button>
                                                {isGerente && (
                                                    <button style={styles.delBtn} onClick={() => handleDelete(h.id, h.nome)}>🗑️</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {hospedesFiltrados.length === 0 && (
                            <div style={styles.emptyState}>Nenhum hóspede encontrado.</div>
                        )}
                    </div>
                )}
            </main>

            <ModalNovoHospede
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchHospedes();
                }}
            />
        </div>
    );
};

const styles = {
    container: { display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' },
    sidebar: { width: '260px', minWidth: '260px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px 20px', position: 'sticky', top: 0, height: '100vh' },
    logoSection: { marginBottom: '40px', paddingLeft: '10px' },
    logo: { fontSize: '24px', fontWeight: '800', letterSpacing: '-1px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    navItem: { background: 'none', border: 'none', color: '#94a3b8', textAlign: 'left', padding: '12px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', transition: '0.3s' },
    navItemActive: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: '600' },
    logoutBtn: { padding: '12px', borderRadius: '10px', border: '1px solid #ff00009a', background: 'transparent', color: '#ff00009a', cursor: 'pointer', fontSize: '14px', marginTop: 'auto' },

    main: { flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    welcome: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-1px' },
    dateText: { color: '#64748b', fontSize: '14px' },
    addBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },

    searchBarContainer: { marginBottom: '25px' },
    searchInput: { width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px',  backgroundColor: '#ffffff', color: '#2c3e50' },

    tableContainer: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '18px 24px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
    td: { padding: '16px 24px', color: '#1e293b', fontSize: '14px' },
    
    nameContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatar: { width: '35px', height: '35px', borderRadius: '10px', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
    hospedeNome: { fontWeight: '600', color: '#1e293b' },
    
    actionCell: { display: 'flex', gap: '8px', justifyContent: 'center' },
    editBtn: { width: '35px', height: '35px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer' },
    delBtn: { width: '35px', height: '35px', borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer' },
    
    loader: { textAlign: 'center', padding: '100px', color: '#94a3b8' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }
};

export default HospedePage;