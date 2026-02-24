// app.js
const App = {
    turmaAtual: localStorage.getItem('turmaAtual') || '',
    numeroDigitado: '',
    votoEmBranco: false,
    adminEmail: "marceloborges.senai@fieg.com.br",
    acaoPendente: null,

    init() {
        if (this.turmaAtual) {
            UI.iniciarUrna(this.turmaAtual);
        } else {
            this.carregarSelecao();
        }
        this.bindEvents();
    },

    carregarSelecao() {
        // Pega turmas únicas do data.js
        const turmas = [...new Set(candidatos.map(c => c.turma).filter(Boolean))].sort();
        UI.mostrarSelecaoTurma(turmas);
    },

    bindEvents() {
        // Botões Admin
        window.abrirModalTrocarTurma = () => { this.acaoPendente = 'trocar'; UI.toggleModalSenha(true); };
        window.verResultados = () => { this.acaoPendente = 'resultados'; UI.toggleModalSenha(true); };
        window.fecharModalSenha = () => UI.toggleModalSenha(false);
        
        // Seleção de Turma
        window.confirmarTurma = () => {
            const val = document.getElementById('selectTurma').value;
            if (!val) return alert("Selecione uma turma!");
            this.turmaAtual = val;
            localStorage.setItem('turmaAtual', val);
            UI.iniciarUrna(val);
        };

        // Teclado
        window.digitarNumero = (n) => this.handleNumero(n);
        window.votarBranco = () => this.handleBranco();
        window.corrigir = () => this.handleCorrige();
        window.confirmar = () => this.handleConfirma();

        // Admin Ações
        window.conferirSenhaModal = () => this.handleLogin();
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
        try {
            await Services.loginAdmin(this.adminEmail, senha);
            UI.toggleModalSenha(false);
            
            if (this.acaoPendente === 'trocar') {
                this.turmaAtual = '';
                localStorage.removeItem('turmaAtual');
                this.carregarSelecao();
            } else if (this.acaoPendente === 'resultados') {
                this.mostrarPainelResultados();
            }
        } catch (err) {
            console.error(err);
            alert("Login falhou. Verifique senha ou permissão de Admin.");
        }
    },

    async mostrarPainelResultados() {
        UI.renderizarResultados('<p>Carregando...</p>');
        try {
            const contagem = await Services.carregarResultados();
            const dados = Services.prepararDadosExportacao(candidatos, contagem);
            
            // Monta HTML Simples
            let html = `
                <div style="margin-bottom:15px; text-align:center">
                    <button onclick="exportarExcelResultados()">Excel</button>
                    <button onclick="exportarPDFResultados()">PDF</button>
                </div>
                <div class="candidato-resultado">
                   <span>Brancos: ${dados.neutros.Branco}</span> | <span>Nulos: ${dados.neutros.Nulo}</span>
                </div>
            `;
            
            Object.keys(dados.turmas).sort().forEach(turma => {
                html += `<h3>${turma}</h3>`;
                dados.turmas[turma].forEach((c, idx) => {
                    const style = idx === 0 && c.votos > 0 ? 'background:#e8f5e9; font-weight:bold;' : '';
                    html += `
                    <div class="candidato-resultado" style="${style}">
                        <span>${c.numero} - ${c.nome}</span>
                        <strong>${c.votos}</strong>
                    </div>`;
                });
            });

            document.getElementById('resultadosContent').innerHTML = html;
        } catch (e) {
            document.getElementById('resultadosContent').innerHTML = '<p>Erro ao carregar</p>';
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