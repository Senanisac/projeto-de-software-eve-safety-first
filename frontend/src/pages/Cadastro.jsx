
// pages/Cadastro.jsx - Tela de cadastro de passageiro ou motorista
// O formulário adapta-se automaticamente ao tipo escolhido
// Design moderno com glassmorphism, animações e cards interativos

import { useState } from "react";                    // Para guardar os valores dos campos
import { useNavigate, Link } from "react-router-dom"; // Para navegar entre telas
import { motion } from "framer-motion";              // Para animações profissionais
import api from "../api/axios";                       // Nossa instância configurada do axios


function Cadastro() {
  // ===================== ESTADOS =====================

  // Tipo de utilizador — controla quais campos aparecem no formulário
  const [tipo, setTipo] = useState("passageiro");   // "passageiro" ou "motorista"

  // Campos comuns a passageiro e motorista
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  // Campos exclusivos do motorista — só usados se tipo === "motorista"
  const [cnh, setCnh] = useState("");
  const [placa, setPlaca] = useState("");
  const [modeloVeiculo, setModeloVeiculo] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("Carro"); // Valor padrão

  // Estados de controlo
  const [erro, setErro] = useState("");          // Mensagem de erro da API
  const [sucesso, setSucesso] = useState("");    // Mensagem de sucesso
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate(); // Para redirecionar após cadastro


  // ===================== FUNÇÃO DE CADASTRO =====================
  const handleCadastro = async (e) => {
    e.preventDefault(); // Impede reload da página
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      // Monta o objeto de dados baseado no tipo escolhido
      const dados = {
        nome,
        cpf,
        email,
        senha,
        telefone,
        // Se for motorista, adiciona os campos extras
        ...(tipo === "motorista" && { cnh, placa, modelo_veiculo: modeloVeiculo, tipo_veiculo: tipoVeiculo }),
      };
      // O operador spread "..." com && adiciona os campos do motorista apenas se tipo === "motorista"
      // modelo_veiculo e tipo_veiculo usam underscore — é assim que a API espera receber

      // Chama o endpoint correto baseado no tipo
      // Se passageiro: POST /usuarios/passageiro
      // Se motorista: POST /usuarios/motorista
      await api.post(`/usuarios/${tipo}`, dados);

      // Cadastro bem-sucedido — mostra mensagem e redireciona para login após 2 segundos
      setSucesso("Conta criada com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/"), 2000); // navigate("/") vai para a tela de login

    } catch (err) {
      // Mostra o erro retornado pela API (ex: "CPF já cadastrado")
      setErro(err.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== ESTILOS REUTILIZÁVEIS =====================
  // DRY — Define uma vez e reutiliza em todos os campos

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", color: "#ffffff",
    fontSize: "14px", outline: "none",
    transition: "border 0.3s ease",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "13px",
    fontWeight: "500", color: "#a0aec0", marginBottom: "6px",
  };


  // ===================== INTERFACE =====================
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      position: "relative", overflow: "hidden",
    }}>

      {/* ===== CÍRCULOS DECORATIVOS ===== */}
      {/* Cadastro → Roxo + Verde Turquesa */}

      {/* Círculo superior direito — ROXO */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Círculo inferior esquerdo — VERDE TURQUESA */}
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.3), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card principal com efeito glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px", padding: "40px",
          width: "100%", maxWidth: "460px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative", zIndex: 10,
        }}
      >
        {/* Logo e título com animação de spring */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{ textAlign: "center", marginBottom: "28px" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚗</div>
          <h1 style={{
            fontSize: "26px", fontWeight: "700", color: "#ffffff",
            marginBottom: "4px", fontFamily: "Poppins, sans-serif",
          }}>
            Eve Safety First
          </h1>
          <p style={{ fontSize: "13px", color: "#a0aec0" }}>Criar nova conta</p>
        </motion.div>

        {/* Mensagem de erro — só aparece se houver erro */}
        {erro && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "rgba(255,101,132,0.15)",
              border: "1px solid rgba(255,101,132,0.3)",
              color: "#ff6584", borderRadius: "12px",
              padding: "12px 16px", marginBottom: "20px",
              fontSize: "14px", textAlign: "center",
            }}
          >
            {erro}
          </motion.div>
        )}

        {/* Mensagem de sucesso — só aparece após cadastro bem-sucedido */}
        {sucesso && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "rgba(0,212,170,0.15)",
              border: "1px solid rgba(0,212,170,0.3)",
              color: "#00d4aa", borderRadius: "12px",
              padding: "12px 16px", marginBottom: "20px",
              fontSize: "14px", textAlign: "center",
            }}
          >
            {sucesso}
          </motion.div>
        )}

        <form onSubmit={handleCadastro}>

          {/* Seletor de tipo — passageiro ou motorista */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>

            {/* Botão passageiro — fica violeta se selecionado */}
            {["passageiro", "motorista"].map((t) => (
              <button
                key={t}
                type="button"           // type="button" impede que submeta o formulário
                onClick={() => setTipo(t)}  // Muda o tipo para passageiro ou motorista
                style={{
                  flex: 1, padding: "11px",
                  background: tipo === t
                    ? "linear-gradient(135deg, #6c63ff, #8b85ff)"
                    : "rgba(255,255,255,0.07)",
                  border: tipo === t ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#ffffff",
                  fontWeight: "600", fontSize: "14px", cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {t === "passageiro" ? "🧍 Passageiro" : "🚗 Motorista"}
              </button>
            ))}
          </div>

          {/* ===== CAMPOS COMUNS ===== */}
          {/* Cada campo tem a mesma estrutura — input + label */}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Nome completo */}
            <div>
              <label style={labelStyle}>Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>

            {/* CPF (apenas números) */}
            <div>
              <label style={labelStyle}>CPF (apenas números)</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="52998224725"
                maxLength={11}          // Limita a 11 caracteres no input
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Senha */}
            <div>
              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Telefone */}
            <div>
              <label style={labelStyle}>Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="82989641022"
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>

            {/* ===== CAMPOS EXCLUSIVOS DO MOTORISTA ===== */}
            {/* Renderização condicional — só aparecem se tipo === "motorista" */}
            {/* Animação fluida com Framer Motion — aparece deslizando */}

            {tipo === "motorista" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {/* Divisor visual — separa os campos do motorista */}
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "4px",
                }}>
                  <p style={{ fontSize: "12px", color: "#6c63ff", fontWeight: "600" }}>
                    DADOS DO VEÍCULO
                  </p>
                </div>

                {/* CNH */}
                <div>
                  <label style={labelStyle}>CNH (apenas números)</label>
                  <input
                    type="text"
                    value={cnh}
                    onChange={(e) => setCnh(e.target.value)}
                    placeholder="59090100108"
                    maxLength={11}
                    required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                    onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                  />
                </div>

                {/* Placa */}
                <div>
                  <label style={labelStyle}>Placa do veículo</label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="ABC1234"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                    onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                  />
                </div>

                {/* Modelo do veículo */}
                <div>
                  <label style={labelStyle}>Modelo do veículo</label>
                  <input
                    type="text"
                    value={modeloVeiculo}
                    onChange={(e) => setModeloVeiculo(e.target.value)}
                    placeholder="Toyota Corolla"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                    onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                  />
                </div>

                {/* Tipo de veículo — select moderno com cards interativos */}
                <div>
                  <label style={labelStyle}>Tipo do veículo</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "Moto", emoji: "🏍️", preco: "R$1/km" },
                      { id: "Carro", emoji: "🚗", preco: "R$2/km" },
                      { id: "VIP", emoji: "⭐", preco: "R$4/km" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setTipoVeiculo(v.id)}
                        style={{
                          flex: 1, padding: "10px 6px",
                          background: tipoVeiculo === v.id
                            ? "rgba(108,99,255,0.2)"
                            : "rgba(255,255,255,0.05)",
                          border: tipoVeiculo === v.id
                            ? "2px solid #6c63ff"
                            : "2px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px", cursor: "pointer",
                          color: "#ffffff", textAlign: "center",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div style={{ fontSize: "20px" }}>{v.emoji}</div>
                        <div style={{ fontSize: "11px", fontWeight: "600", marginTop: "2px" }}>{v.id}</div>
                        <div style={{ fontSize: "10px", color: "#a0aec0" }}>{v.preco}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* Botão de cadastro */}
            <button
              type="submit"
              disabled={carregando}
              className="btn-glow"
              style={{
                width: "100%", padding: "14px",
                background: carregando
                  ? "rgba(108,99,255,0.5)"
                  : "linear-gradient(135deg, #6c63ff, #8b85ff)",
                border: "none", borderRadius: "12px",
                color: "#ffffff", fontSize: "15px",
                fontWeight: "600", cursor: carregando ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                marginTop: "8px",
              }}
            >
              {carregando ? (
                <>
                  {/* Spinner animado durante carregamento */}
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", display: "inline-block",
                  }} />
                  Criando conta...
                </>
              ) : "Criar conta"}
            </button>

          </div>
        </form>

        {/* Link para voltar ao login */}
        <p style={{
          textAlign: "center", marginTop: "24px",
          fontSize: "14px", color: "#a0aec0",
        }}>
          Já tem conta?{" "}
          <Link to="/" style={{ color: "#6c63ff", fontWeight: "600", textDecoration: "none" }}>
            Entrar
          </Link>
        </p>

      </motion.div>

      {/* CSS para o spinner — animação de rotação */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Cadastro;

