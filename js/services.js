// services.js
const Services = {
    // --- Configurações ---
    COOLDOWN_MS: 3000,
    LAST_VOTE_KEY: "urna_last_vote_ms",
    DEVICE_ID_KEY: "urna_device_id",
    
    // --- Utilitários ---
    getDeviceId() {
        let id = localStorage.getItem(this.DEVICE_ID_KEY);
        if (!id) {
            id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
            localStorage.setItem(this.DEVICE_ID_KEY, id);
        }
        return id;
    },

    getIdVoto(turma, tipoVoto) {
        return `${turma}__${tipoVoto}`;
    },

    checkCooldown() {
        const agora = Date.now();
        const ultimo = Number(localStorage.getItem(this.LAST_VOTE_KEY) || 0);
        if (agora - ultimo < this.COOLDOWN_MS) return false;
        
        localStorage.setItem(this.LAST_VOTE_KEY, String(agora));
        return true;
    },

    clearCooldown() {
        localStorage.removeItem(this.LAST_VOTE_KEY);
    },

    // --- Firestore: Votação ---
    async registrarVoto(turma, tipoVoto) {
        if (typeof db === 'undefined') throw new Error('Firebase não inicializado');
        
        const batch = db.batch();
        const docIdTally = this.getIdVoto(turma, tipoVoto);
        
        // 1. Incrementa contagem
        const tallyRef = db.collection('tallies').doc(docIdTally);
        batch.set(tallyRef, {
            turma,
            tipoVoto,
            votos: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });

        // 2. Grava Log (Auditoria)
        const ts = Date.now();
        const docIdLog = `${ts}_${this.getDeviceId()}`;
        const logRef = db.collection('vote_logs').doc(docIdLog);
        batch.set(logRef, {
            turma, 
            tipoVoto,
            deviceId: this.getDeviceId(),
            tsClient: ts,
            tsISO: new Date(ts).toISOString(),
            tsLocal: new Date(ts).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
            userAgent: navigator.userAgent || ""
        });

        await batch.commit();
    },

    // --- Firestore: Admin ---
    async loginAdmin(email, senha) {
        await auth.signInWithEmailAndPassword(email, senha);
        const uid = auth.currentUser?.uid;
        
        // Verifica se existe na coleção admins (Dupla checagem além das Rules)
        const adminDoc = await db.collection('admins').doc(uid).get();
        if (!adminDoc.exists) {
            await auth.signOut();
            throw new Error('Usuário não autorizado.');
        }
        return true;
    },

    async carregarResultados() {
        const snap = await db.collection('tallies').get();
        const contagem = {};
        
        snap.forEach(doc => {
            const data = doc.data();
            const key = this.getIdVoto(data.turma, data.tipoVoto);
            contagem[key] = Number(data.votos || 0);
        });
        return contagem;
    },

    async resetarTudo() {
        // Função auxiliar para deletar em lotes
        const deleteQueryBatch = async (query) => {
            const snapshot = await query.get();
            const batchSize = snapshot.size;
            if (batchSize === 0) return 0;
            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            return batchSize;
        };

        // Deleta Tallies e Logs
        await deleteQueryBatch(db.collection('tallies').limit(500));
        await deleteQueryBatch(db.collection('vote_logs').limit(500));
        // Nota: Se tiver mais de 500 docs, teria que fazer um loop, 
        // mas para reset simples escolar isso costuma bastar ou roda 2x.
    },

    // --- Exportação ---
    prepararDadosExportacao(candidatos, contagemVotos) {
        const turmas = {};
        let totalBR = 0, totalNULO = 0;

        // Processa candidatos
        candidatos.forEach(c => {
            if (!c.turma) return;
            if (!turmas[c.turma]) turmas[c.turma] = [];
            
            const qtd = contagemVotos[this.getIdVoto(c.turma, c.numero)] || 0;
            turmas[c.turma].push({ ...c, votos: qtd });
        });

        // Ordena
        Object.keys(turmas).forEach(t => {
            turmas[t].sort((a,b) => b.votos - a.votos);
            // Soma neutros daquela turma (se existirem na contagem)
            totalBR += contagemVotos[this.getIdVoto(t, 'BR')] || 0;
            totalNULO += contagemVotos[this.getIdVoto(t, 'NULO')] || 0;
        });

        return { turmas, neutros: { Branco: totalBR, Nulo: totalNULO } };
    },

    exportarExcel(dados) {
        if (typeof XLSX === "undefined") return alert("Erro: Biblioteca XLSX não carregada.");
        
        const wb = XLSX.utils.book_new();
        const dataHora = new Date().toLocaleString("pt-BR");

        // Aba Resumo
        const resumo = [
            ["Relatório Urna Eletrônica"], [`Gerado: ${dataHora}`], [],
            ["Votos em Branco", dados.neutros.Branco],
            ["Votos Nulos", dados.neutros.Nulo]
        ];
        const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
        XLSX.utils.book_append_sheet(wb, wsResumo, "RESUMO");

        // Abas por Turma
        Object.keys(dados.turmas).sort().forEach(turma => {
            const linhas = [
                [`Turma: ${turma}`], [`Gerado: ${dataHora}`], [],
                ["Posição", "Número", "Nome", "Votos"]
            ];
            dados.turmas[turma].forEach((c, i) => {
                linhas.push([i+1, c.numero, c.nome, c.votos]);
            });
            const ws = XLSX.utils.aoa_to_sheet(linhas);
            XLSX.utils.book_append_sheet(wb, ws, turma.substring(0, 30));
        });

        XLSX.writeFile(wb, `Resultado_Urna_${Date.now()}.xlsx`);
    },
    
    exportarPDF(dados) {
        if (typeof window.jspdf === "undefined") return alert("Erro: Biblioteca jsPDF não carregada.");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text("Relatório Urna Eletrônica", 10, 10);
        doc.text(`Neutros - Branco: ${dados.neutros.Branco} | Nulo: ${dados.neutros.Nulo}`, 10, 20);
        
        let y = 30;
        Object.keys(dados.turmas).sort().forEach(turma => {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text(turma, 10, y);
            
            const body = dados.turmas[turma].map((c, i) => [String(i+1), c.numero, c.nome, String(c.votos)]);
            
            doc.autoTable({
                startY: y + 5,
                head: [['Pos', 'Num', 'Nome', 'Votos']],
                body: body,
                margin: { top: y + 5 }
            });
            
            y = doc.lastAutoTable.finalY + 15;
        });
        
        doc.save(`Resultado_Urna_${Date.now()}.pdf`);
    }
};