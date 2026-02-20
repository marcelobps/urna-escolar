// --- Configuração de Segurança ---
// controla para que a senha está sendo pedida: 'resultados' ou 'trocarTurma'
let acaoSenhaAtual = null;

// Hash para a senha + Salt
const HASH_ADMIN = "01a2b2b292ad7113ed1c7c0941cdd079d16298e8c21fa5666e0ed9846fc33c50"; 
const SALT = "UrnaEscolar2026-Seguranca-Total"; 

// Variáveis de Estado
let numeroDigitado = '';
let contagemVotos = {};
let votoEmBranco = false;

// Inicialização dos contadores
candidatos.forEach(c => contagemVotos[c.numero] = 0);
contagemVotos['BR'] = 0;
contagemVotos['NULO'] = 0;

// Carrega dados salvos ao abrir a página
carregarDados();

// --- FUNÇÕES DA URNA (VOTAÇÃO) ---
let turmaAtual = null; // se ainda não existir essa linha, adicione no topo com as outras variáveis

// Gera opções de turma no <select>
function preencherSelectTurmas() {
  const select = document.getElementById('selectTurma');
  if (!select) return;

  const turmasUnicas = [...new Set(candidatos.map(c => c.turma))].sort();

  turmasUnicas.forEach(turma => {
    const opt = document.createElement('option');
    opt.value = turma;
    opt.textContent = turma;
    select.appendChild(opt);
  });
}

// Quando clicar em "Iniciar Votação"
function confirmarTurmaSelecionada() {
  const select = document.getElementById('selectTurma');
  const turma = select.value;

  if (!turma) {
    alert('Selecione uma turma para iniciar a votação.');
    return;
  }

    turmaAtual = turma;

    // Esconde tela inicial / mostra urna
    document.getElementById('telaSelecionarTurma').style.display = 'none';
    document.getElementById('urnaContainer').style.display = 'flex';
  
    // Se você tiver uma barra mostrando a turma atual, atualize aqui:
    const label = document.getElementById('turmaAtualLabel');
    if (label) label.textContent = turma;

    corrigir(); // garante que a urna comece limpa
}

// Chamar ao carregar a página
window.addEventListener('load', () => {
  const urna = document.getElementById('urnaContainer');
  if (urna) urna.style.display = 'none';

  preencherSelectTurmas();
});

// Função para o mesário selecionar a turma
function selecionarTurma(turma) {
    turmaAtual = turma;
    document.getElementById('telaSelecionarTurma').style.display = 'none';
    document.getElementById('urnaContainer').style.display = 'flex';
    document.getElementById('turmaAtualLabel').textContent = turma;
}

// Função para voltar à seleção de turma (entre votações ou quando trocar de turma)
function trocarTurma() {
  turmaAtual = null;
  corrigir();

  document.getElementById('urnaContainer').style.display = 'none';
  document.getElementById('telaSelecionarTurma').style.display = 'block';

  const select = document.getElementById('selectTurma');
  if (select) select.value = '';
}

function tocarSomUrna() {
    const audio = new Audio('EfeitoUrna.mp3');
    audio.play().catch(() => {
        // Ignora erro se o navegador bloquear áudio automático
    });
}

function digitarNumero(num) {
    if (votoEmBranco) return; // Se apertou branco, bloqueia números
    
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

/*function buscarCandidato() {
    const candidato = candidatos.find(c => c.numero === numeroDigitado);
    
    // Mostra o rodapé e a área de dados
    document.getElementById('rodapeInstrucoes').style.display = 'block';
    document.getElementById('dadosCandidato').style.display = 'block';

    if (candidato) {
        // Candidato ENCONTRADO
        document.getElementById('nomeCandidato').textContent = candidato.nome;
        document.getElementById('turmaCandidato').textContent = candidato.turma;
        document.getElementById('imgCandidato').src = candidato.foto;
        document.getElementById('molduraFoto').style.display = 'block';
        
        document.getElementById('msgNulo').style.display = 'none';
    } else {
        // Voto NULO
        document.getElementById('nomeCandidato').textContent = '';
        document.getElementById('turmaCandidato').textContent = '';
        document.getElementById('molduraFoto').style.display = 'none';
        
        document.getElementById('msgNulo').style.display = 'block';
    }
}*/
function buscarCandidato() {
    // Filtra apenas candidatos da turma atual
    const candidato = candidatos.find(
        c => c.numero === numeroDigitado && c.turma === turmaAtual
    );

    document.getElementById('rodapeInstrucoes').style.display = 'block';
    document.getElementById('dadosCandidato').style.display = 'block';

    if (candidato) {
        document.getElementById('nomeCandidato').textContent = candidato.nome;
        document.getElementById('turmaCandidato').textContent = candidato.turma;
        document.getElementById('imgCandidato').src = candidato.foto;
        document.getElementById('molduraFoto').style.display = 'block';
        document.getElementById('msgNulo').style.display = 'none';
    } else {
        // Número não pertence a esta turma = NULO
        document.getElementById('nomeCandidato').textContent = '';
        document.getElementById('turmaCandidato').textContent = '';
        document.getElementById('molduraFoto').style.display = 'none';
        document.getElementById('msgNulo').style.display = 'block';
    }
}

function votarBranco() {
    if (numeroDigitado.length > 0) return; // Só funciona se não tiver digitado nada
    
    votoEmBranco = true;
    atualizarDisplay(); // Garante que números sumam
    
    document.getElementById('rodapeInstrucoes').style.display = 'block';
    document.getElementById('dadosCandidato').style.display = 'block';
    document.getElementById('msgBranco').style.display = 'block';
    
    // Esconder outros elementos
    document.getElementById('msgNulo').style.display = 'none';
    document.getElementById('molduraFoto').style.display = 'none';
    document.getElementById('nomeCandidato').textContent = '';
    document.getElementById('turmaCandidato').textContent = '';
}

function corrigir() {
    numeroDigitado = '';
    votoEmBranco = false;
    
    atualizarDisplay();
    
    // Esconder tudo para reiniciar
    document.getElementById('rodapeInstrucoes').style.display = 'none';
    document.getElementById('dadosCandidato').style.display = 'none';
    document.getElementById('molduraFoto').style.display = 'none';
    document.getElementById('msgNulo').style.display = 'none';
    document.getElementById('msgBranco').style.display = 'none';
    document.getElementById('telaFim').style.display = 'none';
}

function confirmar() {
    let tipoVoto = '';
    
    // Define o tipo de voto
    if (votoEmBranco) {
        tipoVoto = 'BR';
    } else if (numeroDigitado.length === 2) {
        const candidato = candidatos.find(c => c.numero === numeroDigitado && c.turma === turmaAtual);
        tipoVoto = candidato ? numeroDigitado : 'NULO';
    } else {
        return; // Não faz nada se não tiver voto completo
    }

    tocarSomUrna();

    // 1. Salvar voto individual (log)
    const voto = { tipo: tipoVoto, timestamp: Date.now() };
    const votosTotal = JSON.parse(localStorage.getItem('votosEscolares')) || [];
    votosTotal.push(voto);
    localStorage.setItem('votosEscolares', JSON.stringify(votosTotal));

    // 2. Atualizar contagem rápida
    if (contagemVotos[tipoVoto] !== undefined) {
        contagemVotos[tipoVoto]++;
    } else {
        contagemVotos['NULO']++;
    }
    localStorage.setItem('contagemVotos', JSON.stringify(contagemVotos));

    // 3. Mostrar tela de FIM
    document.getElementById('telaFim').style.display = 'flex';
    
    // Reiniciar após 3 segundos
    setTimeout(() => {
        corrigir();
        document.getElementById('telaFim').style.display = 'none';
    }, 3000);
}

// --- SISTEMA DE LOGIN SEGURO (MODAL) ---

// Abre a janelinha de senha
/*function verResultados() {
    const modal = document.getElementById('modalSenha');
    const input = document.getElementById('inputSenhaAdmin');
    
    modal.style.display = 'flex';
    input.value = ''; // Limpa o campo
    input.focus();    // Já deixa pronto pra digitar
}*/
function verResultados() {
  const modal = document.getElementById('modalSenha');
  const input = document.getElementById('inputSenhaAdmin');

  acaoSenhaAtual = 'resultados';
  modal.style.display = 'flex';
  input.value = '';
  input.focus();
}


// Fecha a janelinha
function fecharModalSenha() {
    document.getElementById('modalSenha').style.display = 'none';
}

// Verifica a senha quando clica em "Entrar"
/*async function conferirSenhaModal() {
    const input = document.getElementById('inputSenhaAdmin');
    const senhaDigitada = input.value;

    const senhaCorreta = await verificarSenha(senhaDigitada);

    if (senhaCorreta) {
        fecharModalSenha();
        abrirPainelResultados();
    } else {
        alert('❌ Senha incorreta!');
        input.value = '';
        input.focus();
    }
}*/
async function conferirSenhaModal() {
  const input = document.getElementById('inputSenhaAdmin');
  const senhaDigitada = input.value;
  const senhaCorreta = await verificarSenha(senhaDigitada);

  if (senhaCorreta) {
    fecharModalSenha();

    if (acaoSenhaAtual === 'resultados') {
      abrirPainelResultados();
    } else if (acaoSenhaAtual === 'trocarTurma') {
      trocarTurma();
    }

    acaoSenhaAtual = null;
  } else {
    alert('❌ Senha incorreta!');
    input.value = '';
    input.focus();
  }
}


// Atalho: Pressionar ENTER no campo de senha
document.getElementById('inputSenhaAdmin').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        conferirSenhaModal();
    }
});

// Criptografia da senha (não mexer)
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

    // Montar HTML de resultados
    let html = '';
    
    // Agrupar por turma
    const turmas = {};
    
    candidatos.forEach(c => {
        // --- PROTEÇÃO CONTRA DADOS VAZIOS ---
        // Se o candidato não tiver nome ou número, ele é ignorado
        if (!c.nome || !c.numero || !c.turma) return; 

        if (!turmas[c.turma]) turmas[c.turma] = [];
        turmas[c.turma].push({ ...c, votos: contagemVotos[c.numero] || 0 });
    });

    // Exibir Brancos e Nulos
    html += `
        <div class="turma-resultado">
            <h3 style="color: #555;">⚪ Votos Neutros</h3>
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

    // Exibir Candidatos por Turma
    // Verifica se existem turmas antes de tentar exibir
    const nomesTurmas = Object.keys(turmas).sort();
    
    if (nomesTurmas.length === 0) {
         html += `<p style="text-align:center; margin-top:20px;">Nenhum candidato válido encontrado.</p>`;
    }

    for (let turma of nomesTurmas) {
        html += `<h3 style="margin-top:20px; color: #667eea; border-bottom: 2px solid #eee; padding-bottom:5px;">${turma}</h3>`;
        
        // Ordenar do mais votado para o menos votado
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
    document.getElementById('urnaContainer').style.display = 'flex';
    corrigir(); // Limpa a tela
}

function resetarVotos() {
    if (confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os votos da escola!\n\nTem certeza?')) {
        localStorage.clear();
        location.reload();
    }
}

// Carregar dados iniciais (Recuperar contagem se a página foi fechada)
function carregarDados() {
    const salva = JSON.parse(localStorage.getItem('contagemVotos'));
    if (salva) {
        contagemVotos = salva;
    }

    // Gera botões de turma automaticamente
function gerarBotoesTurma() {
    const turmasUnicas = [...new Set(candidatos.map(c => c.turma))];
    const grid = document.getElementById('gridTurmas');
    
    turmasUnicas.forEach(turma => {
        const btn = document.createElement('button');
        btn.textContent = turma;
        btn.className = 'btn-turma';
        btn.onclick = () => selecionarTurma(turma);
        grid.appendChild(btn);
    });
}

function solicitarTrocaTurma() {
  const modal = document.getElementById('modalSenha');
  const input = document.getElementById('inputSenhaAdmin');

  acaoSenhaAtual = 'trocarTurma';
  modal.style.display = 'flex';
  input.value = '';
  input.focus();
}


// Iniciar com a tela de seleção visível
document.getElementById('urnaContainer').style.display = 'none';
gerarBotoesTurma();
}
