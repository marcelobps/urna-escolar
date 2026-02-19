
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
        foto: 'img/foto_01.jpeg' // Caminho relativo
    },
    { 
        numero: '02', 
        nome: 'BIANCA HENRIQUE BARBOSA', 
        turma: '1ª Série A', 
        foto: 'img/foto_02.jpeg' 
    },
    { 
        numero: '14', 
        nome: 'KAIO DE REZENDE GALVÃO', 
        turma: '1ª Série A', 
        foto: 'img/foto_14.png' 
    },
    
    // Para alunos sem foto, você pode manter um link genérico ou usar uma imagem padrão:
    //                                      img/default_boy.png ou /img/default_girl.png
    // 1ª Série B
    { 
        numero: '05', 
        nome: 'DANIEL ELIAS AMARAL ROCHA', 
        turma: '1ª Série B', 
        foto: 'img/foto_05.jpeg' 
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
        foto: 'img/foto_16.jpg' 
    },
    { 
        numero: '18', 
        nome: 'JULIA NEVES OLIVEIRA', 
        turma: '1ª Série C', 
        foto: 'img/foto_18.jpeg' 
    },
    { 
        numero: '23', 
        nome: 'MARIA GABRIELA SOUZA LEMOS', 
        turma: '1ª Série C', 
        foto: 'img/foto_23.jpeg' 
    },

    // 2º AUTOMAÇÃO
    { 
        numero: '22', 
        nome: 'LAURA ZANINI DE FREITAS PONTES', 
        turma: '2º Automação', 
        foto: 'img/foto_22.jpeg' 
    },
    { 
        numero: '25', 
        nome: 'MARIA LUÍSA ROSA MARTINS DE MELO', 
        turma: '2º Automação', 
        foto: 'img/foto_25.jpg' 
    },
    { 
        numero: '28', 
        nome: 'MATEUS RECH JOANUCCI', 
        turma: '2º Automação', 
        foto: 'img/foto_28.jpeg' 
    },

    // 2º MINERAÇÃO
    { 
        numero: '15', 
        nome: 'GABRIEL RAMALHO LIMA', 
        turma: '2º Mineração', 
        foto: 'img/foto_15.jpg' 
    },
    { 
        numero: '33', 
        nome: 'MARIANNA CRISTINA FONSECA', 
        turma: '2º Mineração', 
        foto: 'img/foto_33.jpg' 
    },
    { 
        numero: '35', 
        nome: 'PYETRA MONTEIRO VAZ', 
        turma: '2º Mineração', 
        foto: 'img/foto_35.jpg' 
    },

    // 2º ELETROMECÂNICA
    { 
        numero: '03', 
        nome: 'CALISMAR REBEIRO FILHO', 
        turma: '2º Eletromecânica', 
        foto: 'img/foto_03.jpeg' 
    },
    { 
        numero: '10', 
        nome: 'JOÃO PEDRO NORONHA SANTOS', 
        turma: '2º Eletromecânica', 
        foto: 'img/foto_10.jpg' 
    },

    // 3º IOT
    { 
        numero: '32', 
        nome: 'THIAGO DA SILVA ALMEIDA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/foto_32.jpeg' 
    },
    { 
        numero: '26', 
        nome: 'MATHEUS PASCOAL DE OLIVEIRA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/foto_26.jpg' 
    },
    { 
        numero: '29', 
        nome: 'MIGUEL PEREIRA DA SILVA', 
        turma: '3º Internet das Coisas', 
        foto: 'img/foto_29.jpeg' 
    },

    // 3º MINERAÇÃO
    { 
        numero: '07', 
        nome: 'BRENNO KAYKY ARAUJO', 
        turma: '3º Mineração', 
        foto: 'img/foto_07.jpg' 
    },
    { 
        numero: '08', 
        nome: 'ERICK VINICIUS DOS SANTOS', 
        turma: '3º Mineração', 
        foto: 'img/foto_08.jpeg' 
    },
    { 
        numero: '27', 
        nome: 'RAQUEL HELENA GALDINO', 
        turma: '3º Mineração', 
        foto: 'img/foto_27.jpeg' 
    },
    
    // 6º ANO A
    { 
        numero: '81',
        nome: 'ESTER CAROLINE FERREIRA SILVA',
        turma: '6º Ano A',
        foto: 'img/foto_6anoA.png'
    },
    { 
        numero: '74',
        nome: 'ESTER SOUZA MENDES',
        turma: '6º Ano A',
        foto: 'img/foto_6anoA.png'
    },
    { 
        numero: '54',
        nome: 'HELOÍSA RAFAEL BORGES',
        turma: '6º Ano A',
        foto: 'img/foto_6anoA.png'
    },

    // 6º ANO B
    { 
        numero: '53',
        nome: 'ANNABELLE CESAR DA SILVA',
        turma: '6º Ano B',
        foto: 'img/foto_6anoB.png'
    },
    { 
        numero: '62',
        nome: 'LEONARDO F. DA SILVA OLIVEIRA',
        turma: '6º Ano B',
        foto: 'img/foto_6anoB.png'
    },
    { 
        numero: '47',
        nome: 'SOPHIA ALENCAR BERNADES',
        turma: '6º Ano B',
        foto: 'img/foto_6anoB.png'
    },
    
    // 7º ANO A
    { 
        numero: '38',
        nome: 'EMANUEL FERREIRA MENEZES',
        turma: '7º Ano A',
        foto: 'img/foto_7anoA.png'
    },
    { 
        numero: '40',
        nome: 'ENZO BERNADO DUARTE',
        turma: '7º Ano A',
        foto: 'img/foto_7anoA.png'
    },
    { 
        numero: '43',
        nome: 'ENZO BUZINARO PANSERA',
        turma: '7º Ano A',
        foto: 'img/foto_7anoA.png'
    },

    // 7º ANO B
    { 
        numero: '72',
        nome: 'DAVI LUCAS AMARAL ROCHA',
        turma: '7º Ano B',
        foto: 'img/foto_7anoB.png'
    },
    { 
        numero: '68',
        nome: 'DAVI LUCCA PAULISTA DA COSTA',
        turma: '7º Ano B',
        foto: 'img/foto_7anoB.png'
    },
    { 
        numero: '49',
        nome: 'SOPHYA GONÇALVES MELO',
        turma: '7º Ano B',
        foto: 'img/foto_7anoB.png'
    },

    // 8º ANO
    { 
        numero: '65',
        nome: 'DERIK TRINDADE DE OLVEIRA',
        turma: '8º Ano',
        foto: 'img/foto_8ano.png'
    },
    { 
        numero: '42',
        nome: 'MIGUEL ANTONIO RABELO IDALINO',
        turma: '8º Ano',
        foto: 'img/foto_8ano.png'
    },
    { 
        numero: '30',
        nome: 'VITÓRIA SPINA SANTOS',
        turma: '8º Ano',
        foto: 'img/foto_8ano.png'
    },

    // 9º ANO A
    { 
        numero: '52',
        nome: 'GUILHERME PODVERSIC COSTA REZENDE',
        turma: '9º Ano A',
        foto: 'img/foto_9anoA.png'
    },
    { 
        numero: '41',
        nome: 'LUISA FAUSTINO ALMEIDA CAMPOS',
        turma: '9º Ano A',
        foto: 'img/foto_9anoA.png'
    },
    { 
        numero: '37',
        nome: 'PABLO HENRIQUE CORREIA PACHECO',
        turma: '9º Ano A',
        foto: 'img/foto_9anoA.png'
    },

    // 9º ANO B
    { 
        numero: '44',
        nome: 'GABRIELA RODRIGUES MACEDO',
        turma: '9º Ano B',
        foto: 'img/foto_9anoB.png'
    },
    { 
        numero: '73',
        nome: 'IZABELLY GREGORIO DIAS',
        turma: '9º Ano B',
        foto: 'img/foto_9anoB.png''
    },
    { 
        numero: '48',
        nome: 'MARIA EDUARDA ROSA',
        turma: '9º Ano B',
        foto: 'img/foto_9anoB.png''
    },
];
