
// Nao usar nomes reais nos arquivos para evitar que o google faca indexacao automatica
//  é uma boa pratica de seguranca para manter anonimo.
// depois que esse projeto finalizar, mude o mais rapido para privado.. pois esta publico
//           para conseguir o github pages.


// : : Traducao das imagens : :
// foto_0.jpg   =   Theo
// foto_1.jpg   =   Ana Silva
// foto_2.jpg   =   Carla Souza
// foto_3.jpg   =   Daniel Alves
// foto_4.jpg   =   ...

// so ir criando novas imagens de acordo com a demanda
// e precisa referenciar aqui no corpo abaixo const candidatos.

const candidatos = [

    // Theo teste... (excluir depois)
    { 
        numero: '10', 
        nome: 'Theo', 
        turma: '6º Ano A', 
        foto: 'img/foto_0.jpg' // Foto do Theo renomeada
    }, 

    // 6º Ano A
    { 
        numero: '11', 
        nome: 'Ana Silva', 
        turma: '6º Ano A', 
        foto: 'img/default_girl.png' // Caminho relativo
    },
    { 
        numero: '12', 
        nome: 'Carla Souza', 
        turma: '6º Ano A', 
        foto: 'img/default_girl.png' 
    },
    
    // Para alunos sem foto, você pode manter um link genérico ou usar uma imagem padrão:
    //                                      img/default_boy.png ou /img/default_girl.png
    { 
        numero: '20', 
        nome: 'Daniel Alves', 
        turma: '6º Ano B', 
        foto: 'img/default_boy.png' 
    },

    { 
        // adicione outros aqui...
    },
];