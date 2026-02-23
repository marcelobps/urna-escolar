// --- Configuração de Segurança ---
// Hash para a senha + Salt
const HASH_ADMIN = "01a2b2b292ad7113ed1c7c0941cdd079d16298e8c21fa5666e0ed9846fc33c50"; 
const SALT = "UrnaEscolar2026-Seguranca-Total"; 

// Variáveis de Estado
let numeroDigitado = '';
let contagemVotos = {};
let votoEmBranco = false;
let turmaSelecionada = localStorage.getItem('turmaAtual') || '';
let acaoAdminPendente = ''; // Registra o que o ADM quer fazer após digitar a senha

// Inicialização dos contadores
candidatos.forEach(c => contagemVotos[c.numero] = 0);
contagemVotos['BR'] = 0;
contagemVotos['NULO'] = 0;

// Carrega os dados salvos e inicializa as telas
carregarDados();
inicializarTela();

function inicializarTela() {
    carregarTurmasNoSelect();
    if (turmaSelecionada) {
        iniciarInterfaceUrna();
    } else {
        mostrarSelecaoTurma();
    }
}

// --- FUNÇÕES DE CONTROLE DE TURMA ---

function carregarTurmasNoSelect() {
    const select = document.getElementById('selectTurma');
    // Pega as turmas únicas para não repetir, ignorando valores vazios e as organiza de A a Z
    const turmas = [...new Set(candidatos.map(c => c.turma).filter(Boolean))].sort();
    
    turmas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
}

function mostrarSelecaoTurma() {
    document.getElementById('urnaContainer').style.display = 'none';
    document.getElementById('selecaoTurmaContainer').style.display = 'flex';
    document.getElementById('headerTurma').textContent = 'Urna Eletrônica';
}

function confirmarTurma() {
    const select = document.getElementById('selectTurma');
    if (!select.value) {
        alert('Por favor, selecione uma turma antes de iniciar!');
        return;
    }
    turmaSelecionada = select.value;
    localStorage.setItem('turmaAtual', turmaSelecionada);
    iniciarInterfaceUrna();
}

function iniciarInterfaceUrna() {
    document.getElementById('selecaoTurmaContainer').style.display = 'none';
    document.getElementById('urnaContainer').style.display = 'flex';
    document.getElementById('headerTurma').textContent = `Turma: ${turmaSelecionada}`;
    corrigir(); // Limpa e prepara a urna
}

// --- FUNÇÕES DA URNA (VOTAÇÃO) ---

function tocarSomUrna() {
    const audio = new Audio('EfeitoUrna.mp3');
    audio.play().catch(() => {
        // Ignora erro se o navegador bloquear áudio automático
    });
}

function digitarNumero(num) {
    if (votoEmBranco) return; 
    
    if (numeroDigitado.length < 2) {
        numeroDigitado += num;
        atualizarDisplay();
        
        if (numeroDigitado.length === 2) {
            buscarCandidato();
        }
    }
}

function atualizarDisplay() {
    document.getElementById('digito1').textContent = numeroDigitado[0] || '';
    document.getElementById('digito2').textContent = numeroDigitado[1] || '';
}

function buscarCandidato() {
    // FILTRO DE TURMA: Agora o candidato só será achado se for da mesma turma que está logada na urna
    const candidato = candidatos.find(c => c.numero === numeroDigitado && c.turma === turmaSelecionada);
    
    document.getElementById('rodapeInstrucoes').style.display = 'block';
    document.getElementById('dadosCandidato').style.display = 'block';

    if (candidato) {
        // Candidato ENCONTRADO e pertencente a turma escolhida
        document.getElementById('nomeCandidato').textContent = candidato.nome;
        document.getElementById('turmaCandidato').textContent = candidato.turma;
        document.getElementById('imgCandidato').src = candidato.foto;
        document.getElementById('molduraFoto').style.display = 'block';
        
        document.getElementById('msgNulo').style.display = 'none';
    } else {
        // Voto NULO (Número errado ou candidato de outra turma)
        document.getElementById('nomeCandidato').textContent = '';
        document.getElementById('turmaCandidato').textContent = '';
        document.getElementById('molduraFoto').style.display = 'none';
        
        document.getElementById('msgNulo').style.display = 'block';
    }
}

function votarBranco() {
    if (numeroDigitado.length > 0) return; 
    
    votoEmBranco = true;
    atualizarDisplay(); 
    
    document.getElementById('rodapeInstrucoes').style.display = 'block';
    document.getElementById('dadosCandidato').style.display = 'block';
    document.getElementById('msgBranco').style.display = 'block';
    
    document.getElementById('msgNulo').style.display = 'none';
    document.getElementById('molduraFoto').style.display = 'none';
    document.getElementById('nomeCandidato').textContent = '';
    document.getElementById('turmaCandidato').textContent = '';
}

function corrigir() {
    numeroDigitado = '';
    votoEmBranco = false;
    
    atualizarDisplay();
    
    document.getElementById('rodapeInstrucoes').style.display = 'none';
    document.getElementById('dadosCandidato').style.display = 'none';
    document.getElementById('molduraFoto').style.display = 'none';
    document.getElementById('msgNulo').style.display = 'none';
    document.getElementById('msgBranco').style.display = 'none';
    document.getElementById('telaFim').style.display = 'none';
}

function confirmar() {
    let tipoVoto = '';
    
    if (votoEmBranco) {
        tipoVoto = 'BR';
    } else if (numeroDigitado.length === 2) {
        // FILTRO DE TURMA: Computa o voto corretamente apenas se ele pertencer a turma logada
        const candidato = candidatos.find(c => c.numero === numeroDigitado && c.turma === turmaSelecionada);
        tipoVoto = candidato ? numeroDigitado : 'NULO';
    } else {
        return; 
    }

    tocarSomUrna();

    const voto = { tipo: tipoVoto, timestamp: Date.now() };
    const votosTotal = JSON.parse(localStorage.getItem('votosEscolares')) || [];
    votosTotal.push(voto);
    localStorage.setItem('votosEscolares', JSON.stringify(votosTotal));

    if (contagemVotos[tipoVoto] !== undefined) {
        contagemVotos[tipoVoto]++;
    } else {
        contagemVotos['NULO']++;
    }
    localStorage.setItem('contagemVotos', JSON.stringify(contagemVotos));

    document.getElementById('telaFim').style.display = 'flex';
    
    setTimeout(() => {
        corrigir();
        document.getElementById('telaFim').style.display = 'none';
    }, 3000);
}

// --- SISTEMA DE LOGIN SEGURO (MODAL) ---

function verResultados() {
    acaoAdminPendente = 'resultados';
    abrirModalSenhaGeral('📊 Ver Resultados');
}

function abrirModalTrocarTurma() {
    acaoAdminPendente = 'trocarTurma';
    abrirModalSenhaGeral('🔄 Trocar Turma');
}

function abrirModalSenhaGeral(titulo) {
    const modal = document.getElementById('modalSenha');
    const input = document.getElementById('inputSenhaAdmin');
    const tituloEl = document.getElementById('modalSenhaTitulo');
    
    if (titulo) tituloEl.textContent = titulo;

    modal.style.display = 'flex';
    input.value = ''; 
    input.focus();    
}

function fecharModalSenha() {
    document.getElementById('modalSenha').style.display = 'none';
}

async function conferirSenhaModal() {
    const input = document.getElementById('inputSenhaAdmin');
    const senhaDigitada = input.value;

    const senhaCorreta = await verificarSenha(senhaDigitada);

    if (senhaCorreta) {
        fecharModalSenha();
        
        // Direciona pra onde o ADM queria ir
        if (acaoAdminPendente === 'resultados') {
            abrirPainelResultados();
        } else if (acaoAdminPendente === 'trocarTurma') {
            turmaSelecionada = '';
            localStorage.removeItem('turmaAtual');
            document.getElementById('resultadosContainer').classList.remove('ativo');
            mostrarSelecaoTurma();
        }
    } else {
        alert('❌ Senha incorreta!');
        input.value = '';
        input.focus();
    }
}

document.getElementById('inputSenhaAdmin').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        conferirSenhaModal();
    }
});

async function verificarSenha(senhaDigitada) {
    const textoMisturado = senhaDigitada + SALT;
    const msgBuffer = new TextEncoder().encode(textoMisturado);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashDigitado = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashDigitado === HASH_ADMIN;
}

// --- EXIBIÇÃO DOS RESULTADOS ---

function abrirPainelResultados() {
    const container = document.getElementById('resultadosContainer');
    const content = document.getElementById('resultadosContent');

    document.getElementById('urnaContainer').style.display = 'none';
    container.classList.add('ativo');

    let html = '';
    const turmas = {};
    
    candidatos.forEach(c => {
        if (!c.nome || !c.numero || !c.turma) return; 

        if (!turmas[c.turma]) turmas[c.turma] = [];
        turmas[c.turma].push({ ...c, votos: contagemVotos[c.numero] || 0 });
    });

    html += `
        <div class="turma-resultado">
            <h3 style="color: #555;">⚪ Votos Neutros (Todas as turmas)</h3>
            <div class="candidato-resultado">
                <span>Votos em Branco</span>
                <strong>${contagemVotos['BR']}</strong>
            </div>
            <div class="candidato-resultado">
                <span>Votos Nulos</span>
                <strong>${contagemVotos['NULO']}</strong>
            </div>
        </div>
    `;

    const nomesTurmas = Object.keys(turmas).sort();
    
    if (nomesTurmas.length === 0) {
         html += `<p style="text-align:center; margin-top:20px;">Nenhum candidato válido encontrado.</p>`;
    }

    for (let turma of nomesTurmas) {
        html += `<h3 style="margin-top:20px; color: #667eea; border-bottom: 2px solid #eee; padding-bottom:5px;">${turma}</h3>`;
        
        turmas[turma].sort((a,b) => b.votos - a.votos);
        
        turmas[turma].forEach((c, index) => {
            const isWinner = index === 0 && c.votos > 0;
            html += `
                <div class="candidato-resultado ${isWinner ? 'vencedor' : ''}">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${isWinner ? '🏆' : ''} 
                        <span>${c.numero} - ${c.nome}</span>
                    </div>
                    <strong>${c.votos} votos</strong>
                </div>
            `;
        });
    }

    content.innerHTML = html;
}

function voltarUrna() {
    document.getElementById('resultadosContainer').classList.remove('ativo');
    if (turmaSelecionada) {
        document.getElementById('urnaContainer').style.display = 'flex';
    } else {
        mostrarSelecaoTurma();
    }
    corrigir();
}

function resetarVotos() {
    if (confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os votos da escola e a turma selecionada!\n\nTem certeza?')) {
        localStorage.clear();
        location.reload();
    }
}

function carregarDados() {
    const salva = JSON.parse(localStorage.getItem('contagemVotos'));
    if (salva) {
        contagemVotos = salva;
    }
}