
// pages/Cadastro.jsx - Tela de cadastro de passageiro ou motorista
// O formulário adapta-se automaticamente ao tipo escolhido

import { useState } from "react";                    // Para guardar os valores dos campos
import { useNavigate, Link } from "react-router-dom"; // Para navegar entre telas
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


  // ===================== INTERFACE =====================
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        <h1 style={estilos.titulo}>🚗 Eve Safety First</h1>
        <p style={estilos.subtitulo}>Criar nova conta</p>

        {/* Mensagem de erro — só aparece se houver erro */}
        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* Mensagem de sucesso — só aparece após cadastro bem-sucedido */}
        {sucesso && <p style={estilos.sucesso}>{sucesso}</p>}

        <form onSubmit={handleCadastro}>

          {/* Seletor de tipo — passageiro ou motorista */}
          <div style={estilos.seletor}>

            {/* Botão passageiro — fica azul se selecionado */}
            <button
              type="button"           // type="button" impede que submeta o formulário
              onClick={() => setTipo("passageiro")}  // Muda o tipo para passageiro
              style={tipo === "passageiro" ? estilos.tipoAtivo : estilos.tipoInativo}
            >
              🧍 Passageiro
            </button>

            {/* Botão motorista */}
            <button
              type="button"
              onClick={() => setTipo("motorista")}
              style={tipo === "motorista" ? estilos.tipoAtivo : estilos.tipoInativo}
            >
              🚗 Motorista
            </button>

          </div>

          {/* ===== CAMPOS COMUNS ===== */}

          <div style={estilos.campo}>
            <label style={estilos.label}>Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>CPF (apenas números)</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="52998224725"
              maxLength={11}          // Limita a 11 caracteres no input
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="82989641022"
              style={estilos.input}
              required
            />
          </div>

          {/* ===== CAMPOS EXCLUSIVOS DO MOTORISTA ===== */}
          {/* Renderização condicional — só aparecem se tipo === "motorista" */}

          {tipo === "motorista" && (
            <>
              {/* <> </> é um Fragment — agrupa elementos sem adicionar div extra no HTML */}

              <div style={estilos.campo}>
                <label style={estilos.label}>CNH (apenas números)</label>
                <input
                  type="text"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  placeholder="59090100108"
                  maxLength={11}
                  style={estilos.input}
                  required
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Placa do veículo</label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="ABC1234"
                  style={estilos.input}
                  required
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Modelo do veículo</label>
                <input
                  type="text"
                  value={modeloVeiculo}
                  onChange={(e) => setModeloVeiculo(e.target.value)}
                  placeholder="Toyota Corolla"
                  style={estilos.input}
                  required
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Tipo do veículo</label>
                {/* Select — menu suspenso com as 3 opções */}
                <select
                  value={tipoVeiculo}
                  onChange={(e) => setTipoVeiculo(e.target.value)}
                  style={estilos.input}
                >
                  <option value="Moto">Moto — R$1,00/km</option>
                  <option value="Carro">Carro — R$2,00/km</option>
                  <option value="VIP">VIP — R$4,00/km</option>
                </select>
              </div>

            </>
          )}

          {/* Botão de cadastro */}
          <button
            type="submit"
            style={carregando ? estilos.botaoDesativado : estilos.botao}
            disabled={carregando}
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>

        </form>

        {/* Link para voltar ao login */}
        <p style={estilos.linkTexto}>
          Já tem conta?{" "}
          <Link to="/" style={estilos.link}>Entrar</Link>
        </p>

      </div>
    </div>
  );
}


// ===================== ESTILOS =====================
const estilos = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",              // Padding para ecrãs pequenos
  },
  caixa: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "440px",
  },
  titulo: {
    textAlign: "center",
    color: "#1a1a2e",
    marginBottom: "8px",
    fontSize: "24px",
  },
  subtitulo: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
    fontSize: "14px",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  sucesso: {
    backgroundColor: "#dcfce7",   // Fundo verde claro
    color: "#16a34a",             // Texto verde
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  seletor: {
    display: "flex",
    gap: "10px",                  // Espaço entre os botões
    marginBottom: "20px",
  },
  tipoAtivo: {
    flex: 1,                      // Ocupa metade do espaço disponível
    padding: "10px",
    backgroundColor: "#2563eb",   // Azul — selecionado
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tipoInativo: {
    flex: 1,
    padding: "10px",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",  // Borda cinza — não selecionado
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  campo: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  botao: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  botaoDesativado: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#93c5fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  linkTexto: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
};


export default Cadastro;

