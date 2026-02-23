// Arquivo: server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Permite que o servidor entenda dados no formato JSON
app.use(express.json());

// Serve todos os seus arquivos estáticos (HTML, CSS, JS, img)
app.use(express.static(path.join(__dirname)));

// Caminho para o "Banco de Dados" local (um arquivo .json)
const FILE_PATH = path.join(__dirname, 'votos.json');

// Função para ler os votos do arquivo
function lerVotos() {
    if (fs.existsSync(FILE_PATH)) {
        const dados = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(dados);
    }
    return {};
}

// Função para salvar os votos no arquivo
function salvarVotos(votos) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(votos, null, 2));
}

// --- ROTAS DA API ---

// 1. Rota para a urna enviar um voto
app.post('/api/votar', (req, res) => {
    const { tipoVoto } = req.body; // Recebe o número do candidato ou 'BR' / 'NULO'
    
    let votosAtuais = lerVotos();
    
    if (!votosAtuais[tipoVoto]) {
        votosAtuais[tipoVoto] = 0;
    }
    votosAtuais[tipoVoto]++;
    
    salvarVotos(votosAtuais);
    
    res.json({ success: true, mensagem: "Voto registrado com sucesso!" });
});

// 2. Rota para o painel de ADMIN pegar todos os resultados
app.get('/api/resultados', (req, res) => {
    const votosAtuais = lerVotos();
    res.json(votosAtuais);
});

// 3. Rota para o ADMIN resetar a eleição
app.post('/api/resetar', (req, res) => {
    salvarVotos({}); // Salva um objeto vazio (zera tudo)
    res.json({ success: true, mensagem: "Votos resetados!" });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor da Urna rodando localmente em: http://localhost:${PORT}`);
    console.log(`👉 Para expor na internet, use o comando: ngrok http ${PORT}`);
});