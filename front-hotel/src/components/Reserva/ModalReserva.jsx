import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModalReserva = ({ isOpen, onClose, funcionarioId }) => {
    const [quartos, setQuartos] = useState([]);
    const [hospedes, setHospedes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [reserva, setReserva] = useState({
        quartoId: '',
        hospedeId: '',
        dataCheckin: '',
        dataCheckout: '',
        valorTotal: 0
    });

    const carregarDadosDoBanco = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const resH = await fetch('http://localhost:7070/hospedes', { headers });
            if (resH.ok) {
                const dadosH = await resH.json();
                setHospedes(Array.isArray(dadosH) ? dadosH : (dadosH.dados || []));
            }

            const resQ = await fetch('http://localhost:7070/quartos/disponiveis', { headers });
            if (resQ.ok) {
                const dadosQ = await resQ.json();
                setQuartos(Array.isArray(dadosQ) ? dadosQ : (dadosQ.dados || []));
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            carregarDadosDoBanco();
        }
    }, [isOpen]);

    // O CÁLCULO DE DIÁRIAS VOLTOU A FUNCIONAR AQUI
    useEffect(() => {
        if (reserva.dataCheckin && reserva.dataCheckout && reserva.quartoId) {
            const quartoSelecionado = quartos.find(q => String(q.id) === String(reserva.quartoId));

            if (quartoSelecionado) {
                const inicio = new Date(reserva.dataCheckin + "T00:00:00");
                const fim = new Date(reserva.dataCheckout + "T00:00:00");
                const diferencaTempo = fim.getTime() - inicio.getTime();
                const dias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

                const preco = parseFloat(quartoSelecionado.preco || quartoSelecionado.preco_diaria || 0);

                setReserva(prev => ({
                    ...prev,
                    valorTotal: dias > 0 ? dias * preco : 0
                }));
            }
        } else {
            // Zera o valor se os dados estiverem incompletos
            setReserva(prev => ({ ...prev, valorTotal: 0 }));
        }
    }, [reserva.dataCheckin, reserva.dataCheckout, reserva.quartoId, quartos]);

    const handleConfirmar = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!reserva.quartoId || !reserva.hospedeId) {
            alert("Por favor, selecione um hóspede e um quarto.");
            setLoading(false);
            return;
        }

        // 1. Formata as datas adicionando o horário para o padrão DATETIME do MySQL (AAAA-MM-DD HH:MM:SS)
        const dataCheckinFormatada = `${reserva.dataCheckin} 14:00:00`;
        const dataCheckoutFormatada = `${reserva.dataCheckout} 12:00:00`;

        // 2. Valida o funcionário de forma estrita para não quebrar a chave estrangeira (FK)
        // Se o ID for inválido, nulo ou undefined, envia null puro para o banco aceitar
        const idFuncionarioValido = (funcionarioId && !isNaN(funcionarioId)) ? parseInt(funcionarioId) : null;

        // Log para você conferir no console antes de enviar
        console.log("Dados finais enviados ao banco:", {
            quarto_id: parseInt(reserva.quartoId),
            hospede_id: parseInt(reserva.hospedeId),
            funcionario_id: idFuncionarioValido,
            data_checkin: dataCheckinFormatada,
            checkout: dataCheckoutFormatada,
            valor_total: reserva.valorTotal
        });

        try {
            const response = await axios.post('http://localhost:7070/reservas', {
                quarto_id: parseInt(reserva.quartoId),
                hospede_id: parseInt(reserva.hospedeId),
                funcionario_id: idFuncionarioValido,
                data_checkin: reserva.dataCheckin ? dataCheckinFormatada : null,
                checkout: reserva.dataCheckout ? dataCheckoutFormatada : null,
                valor_total: reserva.valorTotal
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert("Reserva vinculada ao banco com sucesso!");
            setReserva({ quartoId: '', hospedeId: '', dataCheckin: '', dataCheckout: '', valorTotal: 0 });
            onClose();

        } catch (error) {
            if (error.response && error.response.data) {
                alert(error.response.data.message || "Erro interno no servidor (500).");
            } else {
                alert("Erro de conexão com o servidor.");
            }
            console.error("Erro no envio Axios:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <h3 style={styles.title}>Nova Reserva</h3>
                <form onSubmit={handleConfirmar} style={styles.form}>

                    {/* Select de Hóspedes */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Hóspede Cadastrado:</label>
                        <select
                            style={styles.input}
                            required
                            value={reserva.hospedeId}
                            onChange={(e) => setReserva({ ...reserva, hospedeId: e.target.value })}
                        >
                            <option value="">Selecione o Cliente...</option>
                            {Array.isArray(hospedes) && hospedes.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.nome} (CPF: {h.cpf})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select de Quartos */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quarto (Status: DISPONIVEL):</label>
                        <select
                            style={styles.input}
                            required
                            value={reserva.quartoId}
                            onChange={(e) => setReserva({ ...reserva, quartoId: e.target.value })}
                        >
                            <option value="">Selecione o Quarto...</option>
                            {Array.isArray(quartos) && quartos.map(q => (
                                <option key={q.id} value={q.id}>
                                    Nº {q.room_number} - {q.tipo} (R$ {q.preco}/dia)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Datas */}
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Check-in:</label>
                            <input
                                type="date"
                                required
                                value={reserva.dataCheckin}
                                onChange={(e) => setReserva({ ...reserva, dataCheckin: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Check-out:</label>
                            <input
                                type="date"
                                required
                                value={reserva.dataCheckout}
                                onChange={(e) => setReserva({ ...reserva, dataCheckout: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Box de Valor Total */}
                    <div style={styles.totalBox}>
                        <span style={styles.totalLabel}>Total da Hospedagem:</span>
                        <strong style={styles.totalValue}>R$ {Number(reserva.valorTotal).toFixed(2)}</strong>
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        <button type="submit" style={styles.confirmBtn} disabled={loading}>
                            {loading ? "Gravando no Banco..." : "Confirmar Reserva"}
                        </button>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
    card: { backgroundColor: '#ffffff', width: '100%', maxWidth: '460px', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
    title: { marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '22px', fontWeight: '700', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569', letterSpacing: '0.3px' },
    input: { padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' },
    row: { display: 'flex', gap: '16px' },
    totalBox: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', marginTop: '8px' },
    totalLabel: { fontSize: '14px', color: '#64748b', fontWeight: '500' },
    totalValue: { fontSize: '18px', color: '#0f172a', fontWeight: '700' },
    confirmBtn: { padding: '13px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%', transition: 'background-color 0.2s' },
    cancelBtn: { padding: '13px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%', transition: 'background-color 0.2s' }
};

export default ModalReserva;