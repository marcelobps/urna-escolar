
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
        numero: '00', 
        nome: 'Theo', 
        turma: '6º Ano A', 
        foto: 'img/foto_0.jpg' // Foto do Theo renomeada
    }, 

    // 1ª Série A
    { 
        numero: '01', 
        nome: 'ANA CAROLINA MIGUEL BERNADES', 
        turma: '1ª Série A', 
        foto: 'img/default_girl.png' // Caminho relativo
    },
    { 
        numero: '02', 
        nome: 'BIANCA HENRIQUE BARBOSA', 
        turma: '1ª Série A', 
        foto: 'img/default_girl.png' 
    },
    { 
        numero: '14', 
        nome: 'KAIO DE REZENDE GALVÃO', 
        turma: '1ª Série A', 
        foto: 'img/default_girl.png' 
    },
    
    // Para alunos sem foto, você pode manter um link genérico ou usar uma imagem padrão:
    //                                      img/default_boy.png ou /img/default_girl.png
    // 1ª Série B
    { 
        numero: '05', 
        nome: 'DANIEL ELIAS AMARAL ROCHA', 
        turma: '1ª Série B', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '21', 
        nome: 'MOYSES FELIPE HATHENHER', 
        turma: '1ª Série B', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '24', 
        nome: 'NIRIELLE MENDES DA TRINDADE', 
        turma: '1ª Série B', 
        foto: 'img/default_boy.png' 
    },

    // 1ª Série C
    { 
        numero: '16', 
        nome: 'JOÃO GABRIEL RIBEIRO ASSUNÇÃO', 
        turma: '1ª Série C', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '18', 
        nome: 'JULIA NEVES OLIVEIRA', 
        turma: '1ª Série C', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '23', 
        nome: 'MARIA GABRIELA SOUZA LEMOS', 
        turma: '1ª Série C', 
        foto: 'img/default_boy.png' 
    },

    // 2º AUTOMAÇÃO
    { 
        numero: '22', 
        nome: 'LAURA ZANINI DE FREITAS PONTES', 
        turma: '2º Automação', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '25', 
        nome: 'MARIA LUÍSA ROSA MARTIN', 
        turma: '2º Automação', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '28', 
        nome: 'MATEUS RECH JOANUCCI', 
        turma: '2º Automação', 
        foto: 'img/default_boy.png' 
    },

    // 2º MINERAÇÃO
    { 
        numero: '15', 
        nome: 'GABRIEL RAMALHO LIMA', 
        turma: '2º Mineração', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '33', 
        nome: 'MARIANNA CRISTINA FONSECA', 
        turma: '2º Mineração', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '35', 
        nome: 'PYETRA MONTEIRO VAZ', 
        turma: '2º Mineração', 
        foto: 'img/default_boy.png' 
    },

    // 2º ELETROMECÂNICA
    { 
        numero: '03', 
        nome: 'CALISMAR REBEIRO FILHO', 
        turma: '2º Eletromecânica', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '10', 
        nome: 'JOÃO PEDRO NORONHA SANTOS', 
        turma: '2º Eletromecânica', 
        foto: 'img/default_boy.png' 
    },

    // 3º IOT
    { 
        numero: '32', 
        nome: 'THIAGO DA SILVA ALMEIDA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '26', 
        nome: 'MATHEUS PASCOAL DE OLIVEIRA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '29', 
        nome: 'MIGUEL PEREIRA DA SILVA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/default_boy.png' 
    },

    // 3º MINERAÇÃO
    { 
        numero: '07', 
        nome: 'BRENNO KAYKY ARAUJO', 
        turma: '3º Mineração', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '08', 
        nome: 'ERICK VINICIUS DOS SANTOS', 
        turma: '3º Mineração', 
        foto: 'img/default_boy.png' 
    },
    { 
        numero: '27', 
        nome: 'RAQUEL HELENA GALDINO', 
        turma: '3º Mineração', 
        foto: 'img/default_boy.png' 
    },
    { 
        // adicione outros aqui...
    },
];
