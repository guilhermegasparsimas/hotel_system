import { useState } from 'react';
import axios from 'axios';

const ModalNovoQuarto = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        room_number: '',
        tipo: 'SIMPLES',
        preco: '',
        capacidade: 1,
        descricao: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.room_number || !formData.preco) {
            alert("⚠️ Por favor, preencha o número do quarto e o preço.");
            return;
        }

        const headers = getAuthHeader();

        if (!headers.Authorization) {
            alert("❌ Sessão expirada. Por favor, faça login novamente.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:7070/quartos', formData, { headers });

            alert(response.data.message || "✅ Quarto criado com sucesso!");

            setFormData({ room_number: '', tipo: 'SIMPLES', preco: '', capacidade: 1, descricao: '' });
            onClose();
        } catch (error) {
            console.error("Erro ao cadastrar quarto:", error);
            const msgErro = error.response?.data?.message || "Erro ao conectar com o servidor.";
            alert(`❌ Erro: ${msgErro}`);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <header style={styles.header}>
                    <h2 style={styles.title}>✨ Cadastrar Novo Quarto</h2>
                    <button onClick={onClose} style={styles.closeBtn}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Número</label>
                            <input
                                name="room_number"
                                type="text"
                                required
                                placeholder="Ex: 101"
                                style={styles.input}
                                value={formData.room_number}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Preço Diária (R$)</label>
                            <input
                                name="preco"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                style={styles.input}
                                value={formData.preco}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tipo</label>
                            <select
                                name="tipo"
                                style={styles.input}
                                value={formData.tipo}
                                onChange={handleChange}
                            >
                                <option value="SIMPLES">Simples</option>
                                <option value="DUPLO">Duplo</option>
                                <option value="LUXO">Luxo</option>
                                <option value="PRESIDENCIAL">Presidencial</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Capacidade</label>
                            <input
                                name="capacidade"
                                type="number"
                                min="1"
                                style={styles.input}
                                value={formData.capacidade}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Descrição (Máx 255 carac.)</label>
                        <textarea
                            name="descricao"
                            rows="3"
                            style={styles.textarea}
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Detalhes adicionais sobre o quarto..."
                        ></textarea>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
                        <button type="submit" style={styles.confirmBtn}>Salvar Quarto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '18px', color: '#2c3e50', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#95a5a6' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    row: { display: 'flex', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    label: { fontSize: '14px', fontWeight: 'bold', color: '#34495e' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '15px', backgroundColor: '#ffffff', color: '#2c3e50' },
    textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '15px', resize: 'none', backgroundColor: '#ffffff', color: '#2c3e50' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ecf0f1', color: '#7f8c8d', cursor: 'pointer' },
    confirmBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default ModalNovoQuarto;