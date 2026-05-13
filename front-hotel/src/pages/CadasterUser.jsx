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

                       <button 
                        style={{
                            ...styles.button, 
                            backgroundColor: loading ? '#a0b3d1' : '#4a6fa5',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }} 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </button>
                    

                     <p style={styles.footerText} onClick={() => navigate('/auth/login')}>
                            Já possui conta? <span style={styles.link}>Solicitar login</span>
                        </p>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: { height: '100vh', display: 'flex', fontFamily: '"Inter", sans-serif', backgroundColor: '#fff' },
    left: { 
        flex: 1.2, 
        backgroundColor: '#0f172a', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px', 
        overflow: 'hidden' 
    },
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
        zIndex: 1
    },
    contentLeft: { position: 'relative', zIndex: 2 },
    logoBadge: {
        width: '50px', height: '50px', backgroundColor: '#3b82f6', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '20px'
    },
    brand: { fontSize: '42px', fontWeight: '800', color: '#fff', marginBottom: '15px', letterSpacing: '-1.5px' },
    subtitle: { fontSize: '18px', color: '#94a3b8', maxWidth: '400px', lineHeight: '1.6' },
    
    right: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    card: { 
        width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' 
    },
    headerForm: { textAlign: 'left' },
    title: { color: '#1e293b', fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0', letterSpacing: '-0.5px' },
    desc: { color: '#64748b', fontSize: '14px', margin: 0 },
    
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    messageBox: { padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '500', textAlign: 'center' },
    
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '700', color: '#475569', marginLeft: '4px' },
    input: { 
        padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', 
        outline: 'none', transition: '0.2s', backgroundColor: '#f1f5f9', color: '#1e293b'
    },
    
    button: { 
        padding: '14px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: '700', 
        fontSize: '15px', transition: 'all 0.3s ease', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
    },
    footerContainer: { textAlign: 'center', marginTop: '10px' },
    footerText: { fontSize: '14px', color: '#64748b' },
    link: { color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }
};

export default CadasterUser;