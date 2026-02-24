// ui.js
const UI = {
    els: {
        urna: document.getElementById('urnaContainer'),
        selecao: document.getElementById('selecaoTurmaContainer'),
        resultados: document.getElementById('resultadosContainer'),
        resultadosContent: document.getElementById('resultadosContent'),
        modalSenha: document.getElementById('modalSenha'),
        
        headerTurma: document.getElementById('headerTurma'),
        selectTurma: document.getElementById('selectTurma'),
        
        // Display
        digito1: document.getElementById('digito1'),
        digito2: document.getElementById('digito2'),
        nome: document.getElementById('nomeCandidato'),
        turma: document.getElementById('turmaCandidato'),
        img: document.getElementById('imgCandidato'),
        moldura: document.getElementById('molduraFoto'),
        
        // Mensagens
        msgNulo: document.getElementById('msgNulo'),
        msgBranco: document.getElementById('msgBranco'),
        dadosCandidato: document.getElementById('dadosCandidato'),
        rodape: document.getElementById('rodapeInstrucoes'),
        telaFim: document.getElementById('telaFim'),
        adminBtns: document.querySelector('.botoes-admin')
    },

    som: new Audio('assets/audio/EfeitoUrna.mp3'), 

    tocarSom() {
        this.som.currentTime = 0;
        this.som.play().catch(e => console.log("Audio bloqueado pelo navegador"));
    },

    mostrarSelecaoTurma(listaTurmas) {
        this.els.urna.style.display = 'none';
        this.els.resultados.classList.remove('ativo');
        this.els.selecao.style.display = 'flex';
        this.els.headerTurma.textContent = 'Urna Eletrônica';

        this.els.selectTurma.innerHTML = '<option value="">-- Selecione uma Turma --</option>';
        listaTurmas.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            this.els.selectTurma.appendChild(opt);
        });

        // MOSTRA BOTÕES FLUTUANTES NA SELEÇÃO TAMBÉM (OPCIONAL)
        if(this.els.adminBtns) this.els.adminBtns.style.display = 'flex';
    },

    iniciarUrna(nomeTurma) {
        this.els.selecao.style.display = 'none';
        this.els.resultados.classList.remove('ativo');
        this.els.urna.style.display = 'flex';
        this.els.headerTurma.textContent = `Turma: ${nomeTurma}`;
        this.resetarTela();
        
        // MOSTRA BOTÕES FLUTUANTES QUANDO A URNA ESTÁ ATIVA
        if(this.els.adminBtns) this.els.adminBtns.style.display = 'flex';
    },

    atualizarDigitos(numStr) {
        this.els.digito1.textContent = numStr[0] || '';
        this.els.digito2.textContent = numStr[1] || '';
    },

    mostrarCandidato(candidato) {
        this.els.rodape.style.display = 'block';
        this.els.dadosCandidato.style.display = 'block';
        this.els.msgNulo.style.display = 'none';
        this.els.msgBranco.style.display = 'none';

        if (candidato) {
            this.els.nome.textContent = candidato.nome;
            this.els.turma.textContent = candidato.turma;
            this.els.img.src = candidato.foto;
            this.els.moldura.style.display = 'block';
        } else {
            // Nulo
            this.els.nome.textContent = '';
            this.els.turma.textContent = '';
            this.els.moldura.style.display = 'none';
            this.els.msgNulo.style.display = 'block';
        }
    },

    mostrarBranco() {
        this.resetarTela(); // Limpa visual anterior
        this.els.rodape.style.display = 'block';
        this.els.dadosCandidato.style.display = 'block';
        this.els.msgBranco.style.display = 'block';
    },

    resetarTela() {
        this.els.digito1.textContent = '';
        this.els.digito2.textContent = '';
        this.els.nome.textContent = '';
        this.els.turma.textContent = '';
        
        this.els.moldura.style.display = 'none';
        this.els.msgNulo.style.display = 'none';
        this.els.msgBranco.style.display = 'none';
        this.els.dadosCandidato.style.display = 'none';
        this.els.rodape.style.display = 'none';
        this.els.telaFim.style.display = 'none';
    },

    animacaoFim() {
        this.els.telaFim.style.display = 'flex';
        setTimeout(() => {
            this.els.telaFim.style.display = 'none';
            this.resetarTela();
        }, 3000);
    },

    ocultarTudo() {
        this.els.urna.style.display = 'none';
        this.els.selecao.style.display = 'none';
        this.els.resultados.classList.remove('ativo');
        this.els.headerTurma.textContent = 'Urna Bloqueada';
        
        // ESCONDE BOTÕES FLUTUANTES NO BLOQUEIO
        if(this.els.adminBtns) this.els.adminBtns.style.display = 'none'; 
    },

    toggleModalSenha(mostrar, tituloPersonalizado = null) {
        this.els.modalSenha.style.display = mostrar ? 'flex' : 'none';
        
        // Pequena melhoria: Permitir mudar o título do modal
        if (mostrar && tituloPersonalizado) {
            const tituloEl = document.getElementById('modalSenhaTitulo');
            if (tituloEl) tituloEl.textContent = tituloPersonalizado;
        }
        
        if(mostrar) {
            document.getElementById('inputSenhaAdmin').value = '';
            document.getElementById('inputSenhaAdmin').focus();
        }
    },

    renderizarResultados(html) {
        this.els.urna.style.display = 'none';
        this.els.selecao.style.display = 'none';
        
        // ESCONDE BOTÕES FLUTUANTES NO RESULTADO (PARA LIMPAR O FUNDO)
        if(this.els.adminBtns) this.els.adminBtns.style.display = 'none';

        this.els.resultados.classList.add('ativo');
        this.els.resultadosContent.innerHTML = html;
    }
};