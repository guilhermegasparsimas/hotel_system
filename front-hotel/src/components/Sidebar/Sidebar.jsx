import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onToggle }) => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) onToggle(newState);
    };

    const menuItems = [
        { name: 'Dashboard', path: '/home', icon: '📊' },
        { name: 'Quartos', path: '/quartos', icon: '🏨' },
        { name: 'Hóspedes', path: '/hospedes', icon: '👤' },
        { name: 'Reservas', path: '/reservas', icon: '📅' },
    ];

    return (
        <>
            {/* Botão flutuante fora da aside para estar sempre visível */}
            <button
                onClick={handleToggle}
                style={{
                    ...styles.toggleBtn,
                    left: isOpen ? '235px' : '20px', 
                }}
            >
                {isOpen ? '✕' : '☰'}
            </button>

            <aside style={{
                ...styles.aside,
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'all' : 'none', // Desativa cliques quando invisível
            }}>
                {/* TUDO deve estar aqui dentro */}
                <div style={styles.brandContainer}>
                    <div style={styles.logoBadge}>H</div>
                    <h2 style={styles.brandText}>Hotel<span style={{ color: '#3b82f6' }}>Gestão</span></h2>
                </div>

                <nav style={styles.nav}>
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.navItem,
                                backgroundColor: location.pathname === item.path ? '#1e293b' : 'transparent',
                                color: location.pathname === item.path ? '#3b82f6' : '#94a3b8'
                            }}
                        >
                            <span style={styles.icon}>{item.icon}</span>
                            {item.name}
                        </div>
                    ))}
                </nav>

                <div style={styles.footer}>
                    <button onClick={() => navigate('/login')} style={styles.logoutBtn}>
                        Sair do Sistema
                    </button>
                </div>
            </aside>
        </>
    );
};

const styles = {
    aside: {
        height: '100vh',
        width: '260px',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box',
        boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
    },
    toggleBtn: {
        position: 'fixed',
        top: '25px',
        zIndex: 101,
        width: '35px',
        height: '35px',
        borderRadius: '10px',
        backgroundColor: '#1e293b',
        color: '#fff',
        border: '1px solid #334155',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    brandContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '40px',
        paddingLeft: '10px' 
    },
    logoBadge: { 
        minWidth: '35px', 
        height: '35px', 
        backgroundColor: '#3b82f6', 
        borderRadius: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 'bold', 
        color: '#fff' 
    },
    brandText: { 
        color: '#fff', 
        fontSize: '18px', 
        fontWeight: '800', 
        margin: 0,
        whiteSpace: 'nowrap' 
    },
    nav: { 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
    },
    navItem: {
        padding: '12px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '600',
        fontSize: '14px',
        transition: '0.2s',
        whiteSpace: 'nowrap'
    },
    icon: { fontSize: '18px' },
    footer: { 
        borderTop: '1px solid #1e293b', 
        paddingTop: '20px',
        marginTop: 'auto' 
    },
    logoutBtn: { 
        width: '100%', 
        padding: '12px', 
        borderRadius: '10px', 
        border: 'none', 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        color: '#ef4444', 
        fontWeight: '700', 
        cursor: 'pointer', 
        transition: '0.2s' 
    }
};

export default Sidebar;