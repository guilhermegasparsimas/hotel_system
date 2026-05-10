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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            // Garantimos que preco e capacidade sejam números antes de enviar
            const dadosParaEnviar = {
                ...formData,
                preco: parseFloat(formData.preco),
                capacidade: parseInt(formData.capacidade)
            };

            const response = await axios.post('http://localhost:7070/quartos', dadosParaEnviar, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(response.data.message);
            // Reseta o formulário
            setFormData({ room_number: '', tipo: 'SIMPLES', preco: '', capacidade: 1, descricao: '' });
            onClose(); 
        } catch (error) {
            console.error("Erro ao cadastrar quarto:", error);
            alert(error.response?.data?.message || "Erro ao conectar com o servidor.");
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
                                type="text" 
                                required
                                placeholder="Ex: 101"
                                style={styles.input}
                                value={formData.room_number}
                                onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Preço Diária (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                placeholder="0.00"
                                style={styles.input}
                                value={formData.preco}
                                onChange={(e) => setFormData({...formData, preco: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tipo</label>
                            <select 
                                style={styles.input}
                                value={formData.tipo}
                                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                            >
                                <option value="SIMPLES">Simples</option>
                                <option value="DUPLO">Duplo</option>
                                <option value="LUXO">Luxo</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Capacidade</label>
                            <input 
                                type="number" 
                                min="1"
                                style={styles.input}
                                value={formData.capacidade}
                                onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Descrição (Máx 255 carac.)</label>
                        <textarea 
                            rows="3"
                            style={styles.textarea}
                            value={formData.descricao}
                            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
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
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '15px' },
    textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '15px', resize: 'none' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ecf0f1', color: '#7f8c8d', cursor: 'pointer' },
    confirmBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default ModalNovoQuarto;