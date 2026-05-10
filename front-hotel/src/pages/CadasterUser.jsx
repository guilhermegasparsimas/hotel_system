import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CadasterUser = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
        telefone: "",
        tipo: "RECEPCIONISTA"
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const dataToSubmit = {
            ...formData,
            email: formData.email.trim(),
            nome: formData.nome.trim()
        }
        try {
            const response = await fetch('http://localhost:7070/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {

                setMessage({
                    texto: 'Usuário cadastrado com sucesso!',
                    tipo: 'sucesso'
                });

                setTimeout(() => {
                    navigate('/auth/login');
                }, 1000);

            } else {
                console.log("Erro detalhado do Back-end:", data);
                setMessage({
                    texto: data.message || 'Erro ao cadastrar usuário.',
                    tipo: 'erro'
                });

            }
        } catch (error) {
            setMessage({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            {/* LADO ESQUERDO */}
            <div style={styles.left}>
                <h1 style={styles.brand}>Hotel Gestão</h1>
                <p style={styles.subtitle}>
                    Crie sua conta e comece a organizar tudo com mais facilidade.
                </p>
            </div>

            {/* LADO DIREITO */}
            <div style={styles.right}>
                <form onSubmit={handleSubmit} style={styles.card}>
                    <h2 style={styles.title}>Criar conta</h2>

                    {message && (
                        <div
                            style={
                                message.tipo === 'sucesso'
                                    ? styles.successBox
                                    : styles.errorBox
                            }
                        >
                            {message.texto}
                        </div>
                    )}

                    <input
                        style={styles.input}
                        name="nome"
                        placeholder="Nome completo"
                        onChange={handleChange}
                        value={formData.nome}
                        required
                    />

                    <input
                        style={styles.input}
                        name="cpf"
                        placeholder="CPF"
                        onChange={handleChange}
                        value={formData.cpf}
                        required
                    />

                    <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        onChange={handleChange}
                        value={formData.email}
                        required
                    />

                    <input
                        style={styles.input}
                        name="telefone"
                        placeholder="Telefone"
                        onChange={handleChange}
                        value={formData.telefone}
                        required
                    />

                    <input
                        style={styles.input}
                        name="senha"
                        type="password"
                        placeholder="Senha"
                        onChange={handleChange}
                        value={formData.senha}
                        required
                    />

                    <label style={{ fontSize: '12px', color: '#666' }}>Tipo de conta:</label>
                    <select
                        style={styles.input}
                        name="tipo"
                        onChange={handleChange}
                    >
                        <option value="RECEPCIONISTA">Recepcionista</option>
                        <option value="GERENTE">Gerente</option>
                    </select>

                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </button>

                    <p style={styles.footerText} onClick={() => navigate('/login')}>
                        Já tem conta? Entrar
                    </p>
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
        maxWidth: '320px'
    },

    right: {
        flex: 1,
        backgroundColor: '#f5f7fb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    card: {
        width: '360px',
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
        color: '#2c3e50'
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

    successBox: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px'
    },

    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4a6fa5',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer'
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
        cursor: 'pointer'
    }
};

export default CadasterUser;