const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const { inicializarDatabase } = require("../src/database/database");
const userRepository = require("../src/repositories/userRepository");
const passwordService = require("../src/services/passwordService");
const authService = require("../src/services/authService");

async function executar() {
    inicializarDatabase();

    if (userRepository.listar(null, true).some((usuario) => usuario.perfil === "SUPER")) {
        throw new Error("Já existe um superusuário cadastrado.");
    }

    const terminal = readline.createInterface({ input: stdin, output: stdout });
    try {
        const nome = (await terminal.question("Nome: ")).trim();
        const email = authService.normalizarEmail(await terminal.question("E-mail: "));
        const senha = await terminal.question("Senha inicial: ");
        const confirmacao = await terminal.question("Confirme a senha: ");
        if (!nome) throw new Error("O nome é obrigatório.");
        if (senha !== confirmacao) throw new Error("As senhas não coincidem.");
        if (userRepository.buscarPorEmail(email)) throw new Error("O e-mail já está cadastrado.");

        const senhaHash = await passwordService.criarHash(senha);
        userRepository.criar({
            idEmpresa: null, nome, email, senhaHash,
            perfil: "SUPER", ativo: true, trocarSenha: true
        });
        stdout.write("Superusuário criado. A troca de senha será exigida no primeiro acesso.\n");
    } finally {
        terminal.close();
    }
}

executar().catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
});
