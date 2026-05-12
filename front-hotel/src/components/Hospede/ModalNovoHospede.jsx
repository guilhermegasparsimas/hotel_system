import { useState } from 'react';
import axios from 'axios';

const ModalNovoHospede = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        telefone: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // Função utilitária para pegar o header de autorização
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação básica de segurança
        if (!formData.nome || !formData.cpf) {
            alert("⚠️ Nome e CPF são obrigatórios para o cadastro.");
            return;
        }

        const headers = getAuthHeader();
        if (!headers.Authorization) {
            alert("❌ Sessão expirada. Por favor, faça login novamente.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:7070/hospedes', formData, { headers });

            alert(response.data.message || "✅ Hóspede cadastrado com sucesso!");

            // Reseta o formulário e fecha o modal
            setFormData({ nome: '', cpf: '', email: '', telefone: '' });
            onClose();
        } catch (error) {
            console.error("Erro ao cadastrar hóspede:", error);
            const msgErro = error.response?.data?.message || "Erro ao conectar com o servidor.";
            alert(`❌ Erro: ${msgErro}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <header style={styles.header}>
                    <h2 style={styles.title}>👤 Novo Cadastro de Hóspede</h2>
                    <button onClick={onClose} style={styles.closeBtn} disabled={isSubmitting}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nome Completo</label>
                        <input
                            name="nome"
                            type="text"
                            required
                            placeholder="Ex: João Silva"
                            style={styles.input}
                            value={formData.nome}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>CPF (Apenas números)</label>
                        <input
                            name="cpf"
                            type="text"
                            required
                            maxLength="14"
                            placeholder="000.000.000-00"
                            style={styles.input}
                            value={formData.cpf}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            style={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Telefone / WhatsApp</label>
                        <input
                            name="telefone"
                            type="text"
                            placeholder="(00) 00000-0000"
                            style={styles.input}
                            value={formData.telefone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={styles.footer}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.cancelBtn}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={styles.confirmBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Cadastrando..." : "Confirmar Cadastro"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '18px', color: '#2c3e50', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#95a5a6' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '13px', fontWeight: 'bold', color: '#34495e' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '15px', backgroundColor: '#ffffff', color: '#2c3e50' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' },
    cancelBtn: { padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ecf0f1', color: '#7f8c8d', cursor: 'pointer' },
    confirmBtn: { padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: '#27ae60', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default ModalNovoHospede;