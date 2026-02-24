const COOLDOWN_MS = 3000;
const LAST_VOTE_KEY = "urna_last_vote_ms";
const DEVICE_ID_KEY = "urna_device_id";

// --- Admin (Firebase Auth) ---
// Coloque aqui o email do usuário admin que você criou no Firebase Authentication
const ADMIN_EMAIL = "marceloborges.senai@fieg.com.br";

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


function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function registrarLogVotoFirestore(turma, tipoVoto) {
  const deviceId = getDeviceId();
  const ts = Date.now();
  const dt = new Date(ts);

  const docId = `${ts}_${deviceId}`;

  await db.collection("vote_logs").doc(docId).set({
    turma,
    tipoVoto,
    deviceId,

    // Auditoria "técnica"
    tsClient: ts,

    // Auditoria "humana"
    tsISO: dt.toISOString(),
    tsLocal: dt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),

    userAgent: navigator.userAgent || ""
  });
}

// --- Firebase / Firestore (sem backend) ---
// Pré-requisito: no index.html, você já deve ter criado `db` com firebase.initializeApp(...)
// e carregado firebase-firestore-compat.js

function _idVoto(turma, tipoVoto) {
    // separa por turma para evitar colisão caso números se repitam em turmas diferentes
    return `${turma}__${tipoVoto}`;
}

async function registrarVotoFirestore(turma, tipoVoto) {
    if (typeof db === 'undefined') throw new Error('Firestore não inicializado: variável `db` não encontrada.');
    const ref = db.collection('tallies').doc(_idVoto(turma, tipoVoto));
    await ref.set(
        {
            turma,
            tipoVoto,
            votos: firebase.firestore.FieldValue.increment(1)
        },
        { merge: true }
    );
}

async function carregarResultadosFirestore() {
    if (typeof db === 'undefined') throw new Error('Firestore não inicializado: variável `db` não encontrada.');

    // Zera tudo localmente
    contagemVotos = {};
    candidatos.forEach(c => contagemVotos[_idVoto(c.turma, c.numero)] = 0);
    contagemVotos['BR'] = 0;   // neutros globais (somados)
    contagemVotos['NULO'] = 0; // neutros globais (somados)

    const snap = await db.collection('tallies').get();

    snap.forEach(doc => {
        const data = doc.data() || {};
        const turma = data.turma;
        const tipoVoto = data.tipoVoto || doc.id;

        const votos = Number(data.votos || 0);

        // Se for BR/NULO, soma globalmente
        if (tipoVoto === 'BR' || tipoVoto === 'NULO') {
            contagemVotos[tipoVoto] = (contagemVotos[tipoVoto] || 0) + votos;
            return;
        }

        // Se tiver turma no documento, usa o id composto; se não, tenta usar o id do doc
        if (turma) {
            contagemVotos[_idVoto(turma, tipoVoto)] = votos;
        } else {
            // fallback: mantém compatível caso você tenha salvo docs antigos sem turma
            contagemVotos[tipoVoto] = votos;
        }
    });
}

async function resetarVotosFirestore() {
    if (typeof db === 'undefined') throw new Error('Firestore não inicializado: variável `db` não encontrada.');
    const snap = await db.collection('tallies').get();
    const batch = db.batch();

    snap.forEach(doc => {
        batch.set(doc.ref, { votos: 0 }, { merge: true });
    });

    await batch.commit();
}

// Carrega os dados salvos e inicializa as telas
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

async function confirmar() {
  let tipoVoto = '';

  // 1) determina o tipo de voto primeiro
  if (votoEmBranco) {
    tipoVoto = 'BR';
  } else if (numeroDigitado.length === 2) {
    const candidato = candidatos.find(c => c.numero === numeroDigitado && c.turma === turmaSelecionada);
    tipoVoto = candidato ? numeroDigitado : 'NULO';
  } else {
    return;
  }

  // 2) agora sim aplica cooldown (só em voto válido)
  const agora = Date.now();
  const ultimo = Number(localStorage.getItem(LAST_VOTE_KEY) || 0);
  if (agora - ultimo < COOLDOWN_MS) {
    alert("Aguarde alguns segundos para votar novamente.");
    return;
  }

  // marca cooldown
  localStorage.setItem(LAST_VOTE_KEY, String(agora));

  tocarSomUrna();

  // 3) registra no Firestore
  try {
    await registrarVotoFirestore(turmaSelecionada, tipoVoto);

    // (opcional mas recomendado) log de auditoria
    try {
      await registrarLogVotoFirestore(turmaSelecionada, tipoVoto);
    } catch (e) {
      console.warn("Falha ao gravar log de voto:", e);
    }

  } catch (error) {
    console.error("Erro ao registrar voto:", error);

    // desfaz cooldown, porque não registrou voto
    localStorage.removeItem(LAST_VOTE_KEY);

    alert("Erro de conexão com o banco. O voto pode não ter sido contabilizado.");
    return;
  }

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

    try {
        // 1) Login no Firebase Authentication
        // (Se já estiver logado, o Firebase mantém a sessão; mesmo assim, tentar logar de novo não quebra)
        await auth.signInWithEmailAndPassword(ADMIN_EMAIL, senhaDigitada);

        // 2) Confirma que este usuário está na coleção admins/{uid}
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Falha ao autenticar.');

        const adminDoc = await db.collection('admins').doc(uid).get();
        if (!adminDoc.exists) {
            await auth.signOut();
            throw new Error('Usuário autenticado não está autorizado como admin.');
        }

        // 3) OK: segue o fluxo normal
        fecharModalSenha();

        if (acaoAdminPendente === 'resultados') {
            abrirPainelResultados();
        } else if (acaoAdminPendente === 'trocarTurma') {
            turmaSelecionada = '';
            localStorage.removeItem('turmaAtual');
            document.getElementById('resultadosContainer').classList.remove('ativo');
            mostrarSelecaoTurma();
        }
    } catch (error) {
        console.error('Erro no login admin:', error);
        alert('❌ Acesso negado! Confira o email/senha do admin (Firebase).');
        input.value = '';
        input.focus();
    }
}


document.getElementById('inputSenhaAdmin').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        conferirSenhaModal();
    }
});

// --- EXIBIÇÃO DOS RESULTADOS ---

async function abrirPainelResultados() {
  const container = document.getElementById('resultadosContainer');
  const content = document.getElementById('resultadosContent');

  document.getElementById('urnaContainer').style.display = 'none';
  container.classList.add('ativo');

  // ✅ define UMA vez, com botões + mensagem
  content.innerHTML = `
    <div style="display:flex; gap:10px; justify-content:center; margin:10px 0;">
      <button onclick="exportarExcelResultados()">📗 Exportar Excel</button>
      <button onclick="exportarPDFResultados()">📄 Exportar PDF</button>
    </div>
    <p style="text-align:center;">Carregando resultados do banco...</p>
  `;

  try {
    await carregarResultadosFirestore();

    let html = `
      <div style="display:flex; gap:10px; justify-content:center; margin:10px 0;">
        <button onclick="exportarExcelResultados()">📗 Exportar Excel</button>
        <button onclick="exportarPDFResultados()">📄 Exportar PDF</button>
      </div>
    `;
        const turmas = {};
        
        candidatos.forEach(c => {
            if (!c.nome || !c.numero || !c.turma) return; 
            if (!turmas[c.turma]) turmas[c.turma] = [];
            turmas[c.turma].push({ ...c, votos: contagemVotos[_idVoto(c.turma, c.numero)] || 0 });
        });

        html += `
            <div class="turma-resultado">
                <h3 style="color: #555;">⚪ Votos Neutros (Todas as turmas)</h3>
                <div class="candidato-resultado">
                    <span>Votos em Branco</span>
                    <strong>${contagemVotos['BR'] || 0}</strong>
                </div>
                <div class="candidato-resultado">
                    <span>Votos Nulos</span>
                    <strong>${contagemVotos['NULO'] || 0}</strong>
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
    } catch(erro) {
        content.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar dados do servidor.</p>';
    }
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

async function resetarVotos() {
    if (confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os votos de todas as turmas no servidor!\n\nTem certeza?')) {
        try {
            await resetarVotosFirestore();
            localStorage.clear(); // Limpa a turma logada no navegador também
            location.reload();
        } catch (erro) {
            alert('Erro ao resetar no servidor.');
        }
    }
}

function formatarDataArquivo() {
  const dt = new Date();
  // America/Sao_Paulo
  const s = dt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  // "23/02/2026 19:05:12" -> "2026-02-23_19-05-12"
  const [d, t] = s.split(" ");
  const [dd, mm, yyyy] = d.split("/");
  const [hh, mi, ss] = t.split(":");
  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
}

function montarDatasetResultados() {
  // Garante que contagemVotos está atualizado
  // (chame carregarResultadosFirestore() antes de exportar)

  // Agrupa candidatos por turma (somente válidos)
  const turmas = {};
  candidatos.forEach(c => {
    if (!c.nome || !c.numero || !c.turma) return;
    if (!turmas[c.turma]) turmas[c.turma] = [];
    turmas[c.turma].push({
      numero: c.numero,
      nome: c.nome,
      votos: Number(contagemVotos[c.numero] || 0)
    });
  });

  // Ordena por votos desc
  Object.keys(turmas).forEach(t => turmas[t].sort((a,b) => b.votos - a.votos));

  const neutros = [
    { tipo: "Branco", votos: Number(contagemVotos["BR"] || 0) },
    { tipo: "Nulo", votos: Number(contagemVotos["NULO"] || 0) },
  ];

  return { turmas, neutros };
}

function garantirLibXLSX() {
  if (typeof XLSX === "undefined") {
    alert("Biblioteca XLSX não carregou. Verifique os <script> no index.html.");
    return false;
  }
  return true;
}

function garantirLibPDF() {
  if (typeof window.jspdf === "undefined") {
    alert("Biblioteca jsPDF não carregou. Verifique os <script> no index.html.");
    return false;
  }
  return true;
}

async function exportarExcelResultados() {
  if (!garantirLibXLSX()) return;

  // Atualiza resultados antes de exportar
  await carregarResultadosFirestore();

  const { turmas, neutros } = montarDatasetResultados();
  const wb = XLSX.utils.book_new();

  // Aba RESUMO
  const linhasResumo = [];
  linhasResumo.push(["Urna Escolar - Resultados"]);
  linhasResumo.push([`Gerado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`]);
  linhasResumo.push([]);
  linhasResumo.push(["Votos Neutros"]);
  linhasResumo.push(["Tipo", "Votos"]);
  neutros.forEach(n => linhasResumo.push([n.tipo, n.votos]));
  linhasResumo.push([]);
  linhasResumo.push(["Turmas (vencedor)"]);
  linhasResumo.push(["Turma", "Número", "Nome", "Votos"]);
  Object.keys(turmas).sort().forEach(t => {
    const winner = turmas[t][0];
    if (winner) linhasResumo.push([t, winner.numero, winner.nome, winner.votos]);
  });

  const wsResumo = XLSX.utils.aoa_to_sheet(linhasResumo);
  // larguras
  wsResumo["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 35 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, "RESUMO");

  // Uma aba por turma
  const nomesTurmas = Object.keys(turmas).sort();
  nomesTurmas.forEach((turma) => {
    const rows = [];
    rows.push([`Turma: ${turma}`]);
    rows.push([`Gerado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`]);
    rows.push([]);
    rows.push(["Posição", "Número", "Nome", "Votos"]);

    turmas[turma].forEach((c, idx) => {
      rows.push([idx + 1, c.numero, c.nome, c.votos]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 10 }];
    const nomeAba = turma.slice(0, 31); // Excel limita nome de aba a 31 chars
    XLSX.utils.book_append_sheet(wb, ws, nomeAba);
  });

  // Baixar
  const nomeArquivo = `resultados_urna_${formatarDataArquivo()}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

async function exportarPDFResultados() {
  if (!garantirLibPDF()) return;

  // Atualiza resultados antes de exportar
  await carregarResultadosFirestore();

  const { turmas, neutros } = montarDatasetResultados();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const geradoEm = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  doc.setFontSize(16);
  doc.text("Urna Escolar - Resultados", 40, 50);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${geradoEm}`, 40, 70);

  // Neutros
  doc.setFontSize(12);
  doc.text("Votos Neutros", 40, 100);

  doc.autoTable({
    startY: 110,
    head: [["Tipo", "Votos"]],
    body: neutros.map(n => [n.tipo, String(n.votos)]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [230, 230, 230] },
    margin: { left: 40, right: 40 }
  });

  // Cada turma
  const turmasOrdenadas = Object.keys(turmas).sort();
  let y = doc.lastAutoTable.finalY + 30;

  for (const turma of turmasOrdenadas) {
    if (y > 740) { doc.addPage(); y = 50; }

    doc.setFontSize(12);
    doc.text(`Turma: ${turma}`, 40, y);
    y += 10;

    const body = turmas[turma].map((c, idx) => [
      String(idx + 1),
      c.numero,
      c.nome,
      String(c.votos)
    ]);

    doc.autoTable({
      startY: y + 10,
      head: [["Pos", "Número", "Nome", "Votos"]],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: 40, right: 40 }
    });

    y = doc.lastAutoTable.finalY + 30;
  }

  const nomeArquivo = `resultados_urna_${formatarDataArquivo()}.pdf`;
  doc.save(nomeArquivo);
}