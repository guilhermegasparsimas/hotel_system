import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginUser = () => {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        email: '',
        senha: ''
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:7070/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    texto: data.message || 'E-mail ou senha incorretos.',
                    tipo: 'erro'
                });
                setLoading(false);
                return;
            }

            // --- PONTO CRÍTICO: LIMPEZA E ARMAZENAMENTO ---
            // Limpamos resquícios de sessões antigas que podem causar erros 401
            localStorage.clear();

            // Salvamos o token (chave bruta)
            localStorage.setItem('token', data.token);

            // Salvamos o objeto do usuário (nome, tipo, etc)
            // Garantimos que data.usuario contém o 'tipo' (GERENTE/RECEPCIONISTA)
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            setMessage({
                texto: 'Login realizado com sucesso! Entrando...',
                tipo: 'sucesso'
            });

            // Redirecionamento com delay para o usuário ler a mensagem de sucesso
            setTimeout(() => {
                navigate('/home');
            }, 1200);

        } catch (error) {
            console.error("Erro na conexão:", error);
            setMessage({
                texto: 'Não foi possível conectar ao servidor. Verifique se o backend está ligado.',
                tipo: 'erro'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.left}>
                <h1 style={styles.brand}>Hotel Gestão</h1>
                <p style={styles.subtitle}>
                    Gestão inteligente, simples e organizada para o seu negócio.
                </p>
            </div>

            <div style={styles.right}>
                <form onSubmit={handleLogin} style={styles.card}>
                    <h2 style={styles.title}>Painel de Acesso</h2>

                    {message && (
                        <div style={{
                            ...styles.messageBox,
                            backgroundColor: message.tipo === 'erro' ? '#fdecea' : '#e8f5e9',
                            color: message.tipo === 'erro' ? '#c62828' : '#2e7d32',
                            border: `1px solid ${message.tipo === 'erro' ? '#ef9a9a' : '#a5d6a7'}`
                        }}>
                            {message.texto}
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail profissional</label>
                        <input
                            style={styles.input}
                            name="email"
                            type="email"
                            placeholder="exemplo@hotel.com"
                            onChange={handleChange}
                            value={credentials.email}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <input
                            style={styles.input}
                            name="senha"
                            type="password"
                            placeholder="••••••••"
                            onChange={handleChange}
                            value={credentials.senha}
                            required
                        />
                    </div>

                    <button 
                        style={{
                            ...styles.button, 
                            backgroundColor: loading ? '#a0b3d1' : '#4a6fa5',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }} 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? 'Validando...' : 'Acessar Sistema'}
                    </button>

                    <div style={styles.footerContainer}>
                        <p style={styles.footerText} onClick={() => navigate('/cadaster')}>
                            Não possui acesso? <span style={styles.link}>Solicitar cadastro</span>
                        </p>
                        <p style={styles.footerText}> Esqueceu a senha? </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: { 
        height: '100vh', 
        display: 'flex', 
        fontFamily: '"Inter", sans-serif', 
        backgroundColor: '#fff' 
    },
    left: { 
        flex: 1.2, 
        backgroundColor: '#0f172a', 
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px',
        overflow: 'hidden',
        // Quando quiser colocar imagem, use background-image aqui:
        // backgroundImage: 'url("sua-imagem.jpg")',
        // backgroundSize: 'cover'
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
        zIndex: 1
    },
    contentLeft: { position: 'relative', zIndex: 2 },
    logoBadge: {
        width: '50px',
        height: '50px',
        backgroundColor: '#3b82f6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '900',
        color: '#fff',
        marginBottom: '20px'
    },
    brand: { 
        fontSize: '42px', 
        fontWeight: '800', 
        color: '#fff',
        marginBottom: '15px', 
        letterSpacing: '-1.5px' 
    },
    subtitle: { 
        fontSize: '18px', 
        color: '#94a3b8', 
        maxWidth: '400px', 
        lineHeight: '1.6' 
    },
    right: { 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f8fafc' 
    },
    card: { 
        width: '100%',
        maxWidth: '400px', 
        backgroundColor: '#fff', 
        padding: '50px', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '25px' 
    },
    headerForm: { textAlign: 'left' },
    title: { 
        color: '#1e293b', 
        fontSize: '28px', 
        fontWeight: '800', 
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px'
    },
    desc: { color: '#64748b', fontSize: '15px', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    messageBox: { 
        padding: '14px', 
        borderRadius: '12px', 
        fontSize: '14px', 
        fontWeight: '500',
        textAlign: 'center' 
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '700', color: '#475569', marginLeft: '4px' },
    input: { 
        padding: '14px 18px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        fontSize: '15px', 
        outline: 'none', 
        transition: '0.2s',
        backgroundColor: '#f1f5f9' 
    },
    button: { 
        padding: '16px', 
        borderRadius: '12px', 
        border: 'none', 
        color: '#fff', 
        fontWeight: '700', 
        fontSize: '16px', 
        transition: 'all 0.3s ease',
        marginTop: '10px',
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
    },
    footerContainer: { textAlign: 'center' },
    footerText: { fontSize: '14px', color: '#64748b' },
    link: { color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }
};

export default LoginUser;