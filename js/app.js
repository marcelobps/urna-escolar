// app.js
const App = {
    turmaAtual: localStorage.getItem('turmaAtual') || '',
    numeroDigitado: '',
    votoEmBranco: false,
    adminEmail: "marceloborges.senai@fieg.com.br",
    
    // Estado inicial: pendente de desbloqueio
    acaoPendente: 'desbloquear', 

    init() {
        // 1. Esconde tudo visualmente
        UI.ocultarTudo();
        
        // 2. Força o modal de senha logo de cara
        // O título será "🔐 Iniciar Urna"
        UI.toggleModalSenha(true, "🔐 Iniciar Sistema");
        
        this.bindEvents();
    },

    carregarSelecao() {
        // Pega turmas únicas do data.js
        const turmas = [...new Set(candidatos.map(c => c.turma).filter(Boolean))].sort();
        UI.mostrarSelecaoTurma(turmas);
    },

    bindEvents() {
        // --- Botões Globais ---
        window.abrirModalTrocarTurma = () => { this.acaoPendente = 'trocar'; UI.toggleModalSenha(true); };
        window.verResultados = () => { this.acaoPendente = 'resultados'; UI.toggleModalSenha(true); };
        window.fecharModalSenha = () => UI.toggleModalSenha(false);
        
        // --- Seleção de Turma ---
        window.confirmarTurma = () => {
            const val = document.getElementById('selectTurma').value;
            if (!val) return alert("Selecione uma turma!");
            this.turmaAtual = val;
            localStorage.setItem('turmaAtual', val);
            UI.iniciarUrna(val);
        };

        // --- Teclado da Urna ---
        window.digitarNumero = (n) => this.handleNumero(n);
        window.votarBranco = () => this.handleBranco();
        window.corrigir = () => this.handleCorrige();
        window.confirmar = () => this.handleConfirma();

        // --- Admin / Login ---
        window.conferirSenhaModal = () => this.handleLogin();
        
        // CORREÇÃO: Adicionando o ENTER no input de senha
        const inputSenha = document.getElementById('inputSenhaAdmin');
        if (inputSenha) {
            inputSenha.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        // --- Ações de Resultado ---
        window.voltarUrna = () => UI.iniciarUrna(this.turmaAtual);
        window.resetarVotos = () => this.handleReset();
        
        window.exportarExcelResultados = async () => {
             const counts = await Services.carregarResultados();
             const dataset = Services.prepararDadosExportacao(candidatos, counts);
             Services.exportarExcel(dataset);
        };
        window.exportarPDFResultados = async () => {
             const counts = await Services.carregarResultados();
             const dataset = Services.prepararDadosExportacao(candidatos, counts);
             Services.exportarPDF(dataset);
        };
    },

    // --- Lógica da Urna ---
    handleNumero(n) {
        if (this.votoEmBranco) return;
        if (this.numeroDigitado.length < 2) {
            this.numeroDigitado += n;
            UI.atualizarDigitos(this.numeroDigitado);
            
            if (this.numeroDigitado.length === 2) {
                const candidato = candidatos.find(c => 
                    c.numero === this.numeroDigitado && c.turma === this.turmaAtual
                );
                UI.mostrarCandidato(candidato); // Se null, UI mostra NULO
            }
        }
    },

    handleBranco() {
        if (this.numeroDigitado.length > 0) return;
        this.votoEmBranco = true;
        UI.mostrarBranco();
    },

    handleCorrige() {
        this.numeroDigitado = '';
        this.votoEmBranco = false;
        UI.resetarTela();
        UI.atualizarDigitos('');
    },

    async handleConfirma() {
        let tipoVoto = '';
        
        if (this.votoEmBranco) tipoVoto = 'BR';
        else if (this.numeroDigitado.length === 2) {
            const cand = candidatos.find(c => c.numero === this.numeroDigitado && c.turma === this.turmaAtual);
            tipoVoto = cand ? this.numeroDigitado : 'NULO';
        } else {
            return; // Voto incompleto
        }

        // Verifica Cooldown
        if (!Services.checkCooldown()) return alert("Aguarde alguns segundos...");

        UI.tocarSom();
        
        try {
            await Services.registrarVoto(this.turmaAtual, tipoVoto);
            UI.animacaoFim();
            // Reseta variáveis lógicas
            this.numeroDigitado = '';
            this.votoEmBranco = false;
        } catch (err) {
            console.error(err);
            Services.clearCooldown();
            alert("Erro ao salvar voto. Verifique a internet.");
        }
    },

    // --- Lógica Admin ---
    async handleLogin() {
        const senha = document.getElementById('inputSenhaAdmin').value;
        const btnEntrar = document.querySelector('.btn-entrar'); // Opcional: Feedback visual
        if(btnEntrar) btnEntrar.textContent = "Verificando...";

        try {
            await Services.loginAdmin(this.adminEmail, senha);
            UI.toggleModalSenha(false);
            if(btnEntrar) btnEntrar.textContent = "Entrar";

            // --- ROTEAMENTO DE AÇÕES DEPOIS DA SENHA ---
            
            if (this.acaoPendente === 'desbloquear') {
                // Cenário 1: Acabou de abrir o site (F5 ou nova aba)
                if (this.turmaAtual) {
                    UI.iniciarUrna(this.turmaAtual);
                } else {
                    this.carregarSelecao();
                }
                this.acaoPendente = null; // Limpa ação

            } else if (this.acaoPendente === 'trocar') {
                // Cenário 2: Quer trocar de turma
                this.turmaAtual = '';
                localStorage.removeItem('turmaAtual');
                this.carregarSelecao();
                this.acaoPendente = null;

            } else if (this.acaoPendente === 'resultados') {
                // Cenário 3: Quer ver resultados
                this.mostrarPainelResultados();
                this.acaoPendente = null;
            }

        } catch (err) {
            console.error(err);
            if(btnEntrar) btnEntrar.textContent = "Entrar";
            alert("Senha incorreta ou usuário não autorizado.");
            // Se falhar no desbloqueio inicial, mantém tudo oculto
            if (this.acaoPendente === 'desbloquear') {
                UI.ocultarTudo();
            }
        }
    },

    async mostrarPainelResultados() {
        UI.renderizarResultados('<p style="text-align:center; padding:20px;">Carregando dados do servidor...</p>');
        
        try {
            const contagem = await Services.carregarResultados();
            const dados = Services.prepararDadosExportacao(candidatos, contagem);
            
            // Cabeçalho com Botões (Excel/PDF)
            let html = `
                <div style="display:flex; gap:10px; justify-content:center; margin:15px 0;">
                    <button onclick="exportarExcelResultados()" style="padding:10px; cursor:pointer;">📗 Exportar Excel</button>
                    <button onclick="exportarPDFResultados()" style="padding:10px; cursor:pointer;">📄 Exportar PDF</button>
                </div>
                
                <div class="candidato-resultado" style="background:#f9f9f9; border-bottom: 2px solid #ccc;">
                   <span>⚪ <strong>Votos Brancos:</strong> ${dados.neutros.Branco}</span> 
                   <span>⚫ <strong>Votos Nulos:</strong> ${dados.neutros.Nulo}</span>
                </div>
            `;
            
            // Loop pelas Turmas
            const nomesTurmas = Object.keys(dados.turmas).sort();
            
            if (nomesTurmas.length === 0) {
                html += '<p style="text-align:center; margin-top:20px;">Nenhum voto registrado ainda.</p>';
            }

            nomesTurmas.forEach(turma => {
                html += `<h3 style="margin-top:20px; color:#667eea; border-bottom:1px solid #ddd;">${turma}</h3>`;
                
                dados.turmas[turma].forEach((c, idx) => {
                    // Lógica do Vencedor: É o primeiro da lista (idx 0) E tem mais de 0 votos?
                    const isWinner = (idx === 0 && c.votos > 0);
                    
                    // Ícone e Estilo
                    const icon = isWinner ? '🏆 ' : ''; 
                    const style = isWinner 
                        ? 'background:#e8f5e9; border: 2px solid #4caf50; border-radius: 5px; font-weight:bold;' 
                        : '';

                    html += `
                    <div class="candidato-resultado" style="${style}">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.2rem;">${icon}</span>
                            <span>${c.numero} - ${c.nome}</span>
                        </div>
                        <strong style="font-size:1.1rem;">${c.votos} votos</strong>
                    </div>`;
                });
            });

            document.getElementById('resultadosContent').innerHTML = html;
        } catch (e) {
            console.error(e);
            document.getElementById('resultadosContent').innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar resultados.</p>';
        }
    },

    async handleReset() {
        if(!confirm("TEM CERTEZA? Isso apaga todos os votos!")) return;
        try {
            await Services.resetarTudo();
            location.reload();
        } catch(e) { alert("Erro ao resetar"); }
    }
};

// Inicializa
document.addEventListener('DOMContentLoaded', () => App.init());