const PARAMETROS_SISTEMA = [
    {
        codigo: "QTD_TENTATIVAS_LOGIN",
        nome: "Tentativas de login para bloqueio",
        descricao: "Quantidade de senhas incorretas antes do bloqueio temporário.",
        grupo: "SEGURANCA",
        tipo: "INTEIRO",
        valorPadrao: 5,
        minimo: 1,
        maximo: 20,
        ordem: 10
    },
    {
        codigo: "MIN_BLOQUEIO_LOGIN",
        nome: "Duração do bloqueio",
        descricao: "Tempo, em minutos, durante o qual o acesso permanece bloqueado.",
        grupo: "SEGURANCA",
        tipo: "INTEIRO",
        valorPadrao: 15,
        minimo: 1,
        maximo: 1440,
        ordem: 20
    },
    {
        codigo: "DIAS_EXPIRACAO_SENHA",
        nome: "Validade da senha",
        descricao: "Quantidade de dias até ser exigida uma nova senha.",
        grupo: "SEGURANCA",
        tipo: "INTEIRO",
        valorPadrao: 183,
        minimo: 1,
        maximo: 730,
        ordem: 30
    },
    {
        codigo: "HORAS_DURACAO_SESSAO",
        nome: "Duração da sessão comum",
        descricao: "Tempo de validade, em horas, para acessos sem Manter conectado.",
        grupo: "SESSOES",
        tipo: "INTEIRO",
        valorPadrao: 8,
        minimo: 1,
        maximo: 24,
        ordem: 40
    },
    {
        codigo: "DIAS_DURACAO_SESSAO_PERSISTENTE",
        nome: "Duração de Manter conectado",
        descricao: "Tempo de validade, em dias, para acessos que permanecem conectados.",
        grupo: "SESSOES",
        tipo: "INTEIRO",
        valorPadrao: 30,
        minimo: 1,
        maximo: 90,
        ordem: 50
    },
    {
        codigo: "MB_LIMITE_UPLOAD_IMAGEM",
        nome: "Tamanho máximo de imagem",
        descricao: "Limite, em MB, para imagens de produtos, logos e capas.",
        grupo: "UPLOADS",
        tipo: "INTEIRO",
        valorPadrao: 5,
        minimo: 1,
        maximo: 20,
        ordem: 60
    },
    {
        codigo: "FG_VALIDAR_DOCUMENTO_REAL",
        nome: "Validar CPF/CNPJ real",
        descricao: "Verifica os dígitos validadores, além do tamanho do documento.",
        grupo: "CADASTROS",
        tipo: "BOOLEANO",
        valorPadrao: false,
        ordem: 70
    }
];

const POR_CODIGO = new Map(
    PARAMETROS_SISTEMA.map((parametro) => [parametro.codigo, parametro])
);

module.exports = { PARAMETROS_SISTEMA, POR_CODIGO };
