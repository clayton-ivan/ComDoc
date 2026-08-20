const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const config = require("../src/config/environment");

function carimboData(data = new Date()) {
    return data.toISOString().replace(/[:.]/g, "-");
}

function removerBackupsExpirados() {
    const limite = Date.now() - config.diasRetencaoBackup * 24 * 60 * 60 * 1000;
    fs.readdirSync(config.diretorioBackups, { withFileTypes: true })
        .filter((item) => item.isDirectory() && /^comdoc-\d{4}-\d{2}-\d{2}T/.test(item.name))
        .forEach((item) => {
            const diretorio = path.join(config.diretorioBackups, item.name);
            if (fs.statSync(diretorio).mtimeMs < limite) {
                fs.rmSync(diretorio, { recursive: true, force: true });
            }
        });
}

function criarBackup() {
    if (!fs.existsSync(config.caminhoDatabase)) {
        throw new Error(`Banco de dados não encontrado em ${config.caminhoDatabase}.`);
    }

    fs.mkdirSync(config.diretorioBackups, { recursive: true });
    const nomeBackup = `comdoc-${carimboData()}`;
    const destino = path.join(config.diretorioBackups, nomeBackup);
    const temporario = path.join(config.diretorioBackups, `.${nomeBackup}.tmp`);
    fs.mkdirSync(temporario);
    const bancoDestino = path.join(temporario, "comdoc.db");

    const database = new DatabaseSync(config.caminhoDatabase, { readOnly: true });
    try {
        database.exec("PRAGMA busy_timeout = 10000;");
        database.prepare("VACUUM INTO ?").run(bancoDestino);
        if (fs.existsSync(config.diretorioUploads)) {
            fs.cpSync(
                config.diretorioUploads,
                path.join(temporario, "uploads"),
                { recursive: true }
            );
        }
        fs.renameSync(temporario, destino);
    } catch (erro) {
        fs.rmSync(temporario, { recursive: true, force: true });
        throw erro;
    } finally {
        database.close();
    }

    removerBackupsExpirados();
    process.stdout.write(`${JSON.stringify({
        timestamp: new Date().toISOString(),
        nivel: "info",
        mensagem: "Backup concluído",
        destino,
        bancoBytes: fs.statSync(path.join(destino, "comdoc.db")).size
    })}\n`);
}

try {
    criarBackup();
} catch (erro) {
    process.stderr.write(`${JSON.stringify({
        timestamp: new Date().toISOString(),
        nivel: "error",
        mensagem: "Falha ao criar backup",
        erro: erro.message
    })}\n`);
    process.exitCode = 1;
}
