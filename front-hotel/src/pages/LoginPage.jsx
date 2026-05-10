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

            const response = await fetch(
                'http://localhost:7070/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    texto: data.message || 'E-mail ou senha incorretos.',
                    tipo: 'erro'
                });
                setLoading(false)
                return;
            }

            localStorage.clear();
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            navigate('/home');

        } catch (error) {
            setMessage({
                texto: 'Erro de conexão com o servidor.',
                tipo: 'erro'
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* LADO VISUAL */}
            <div style={styles.left}>
                <h1 style={styles.brand}>Hotel Gestão</h1>
                <p style={styles.subtitle}>
                    Gestão inteligente, simples e organizada.
                </p>
            </div>

            {/* FORMULÁRIO */}
            <div style={styles.right}>
                <form onSubmit={handleLogin} style={styles.card}>
                    <h2 style={styles.title}>Entrar na sua conta</h2>

                    {message && (
                        <div style={styles.errorBox}>
                            {message.texto}
                        </div>
                    )}

                    <input
                        style={styles.input}
                        name="email"
                        placeholder="E-mail"
                        onChange={handleChange}
                        value={credentials.email}
                        required
                    />

                    <input
                        style={styles.input}
                        name="senha"
                        type="password"
                        placeholder="Senha"
                        onChange={handleChange}
                        value={credentials.senha}

                        required
                    />

                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                    <div style={styles.footerContainer}>
                        <p style={styles.footerText} onClick={() => navigate('/cadaster')}>
                            Não tem conta? <strong>Cadastre-se</strong>
                        </p>
                        <p style={styles.footerText}> Esqueceu sua senha? </p>
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
        fontFamily: 'Segoe UI, sans-serif'
    },

    /* LADO ESQUERDO */
    left: {
        flex: 1,
        background: 'linear-gradient(135deg, #4a6fa5, #6c8fc7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: '#fff'
    },



    brand: {
        fontSize: '42px',
        marginBottom: '10px'
    },

    subtitle: {
        fontSize: '18px',
        opacity: 0.9,
        maxWidth: '300px'
    },

    /* LADO DIREITO */
    right: {
        flex: 1,
        backgroundColor: '#f5f7fb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    card: {
        width: '340px',
        backgroundColor: '#fff',
        padding: '35px',
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },

    title: {
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '10px'
    },

    input: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #dcdfe6',
        backgroundColor: '#ffffff', // Essencial para não ficar preto
        color: '#2c3e50',           // Cor do texto
        fontSize: '14px',
        outline: 'none',
        width: '100%',              // Garante que ocupe o card
        boxSizing: 'border-box'     // Evita que o padding "estoure" a largura
    },

    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4a6fa5',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: '0.3s'
    },

    errorBox: {
        backgroundColor: '#fdecea',
        color: '#c62828',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px'
    },

    footerText: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#7a7a7a',
        marginTop: '5px',
        cursor: 'pointer'
    }
};

export default LoginUser;