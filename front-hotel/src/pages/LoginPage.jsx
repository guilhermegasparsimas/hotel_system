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
    page: { height: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f5f7fb' },
    left: { flex: 1, background: 'linear-gradient(135deg, #2c3e50, #4a6fa5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: '#fff' },
    brand: { fontSize: '48px', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1px' },
    subtitle: { fontSize: '19px', opacity: 0.8, maxWidth: '350px', lineHeight: '1.5' },
    right: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { width: '380px', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' },
    title: { textAlign: 'left', color: '#1a1a1a', fontSize: '24px', fontWeight: '700', marginBottom: '5px' },
    messageBox: { padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', transition: 'all 0.3s ease' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#4b5563' },
    input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box' },
    button: { padding: '14px', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: '600', fontSize: '16px', transition: '0.2s', marginTop: '10px' },
    footerContainer: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
    footerText: { fontSize: '13px', color: '#6b7280', cursor: 'pointer' },
    link: { color: '#4a6fa5', fontWeight: 'bold' }
};

export default LoginUser;