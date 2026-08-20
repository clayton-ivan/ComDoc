const express = require("express");
const path = require("path");
const fs = require("node:fs");
const config = require("./config/environment");
const logger = require("./services/loggerService");
const onlineSecurity = require("./middleware/onlineSecurityMiddleware");
const uploadAccess = require("./middleware/uploadAccessMiddleware");

const productRoutes =
    require("./routes/productRoutes");

const clientRoutes =
    require("./routes/clientRoutes");

const documentRoutes =
    require("./routes/documentRoutes");

const companyRoutes =
    require("./routes/companyRoutes");
const companyManagementRoutes = require("./routes/companyManagementRoutes");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const systemParameterRoutes = require("./routes/systemParameterRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const requestContext = require("./context/requestContext");

const {
    inicializarDatabase,
    verificarDatabase,
    encerrarDatabase
} = require("./database/database");

const app = express();

if (config.confiarProxy) {
    app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");
app.use(onlineSecurity.identificacao);
app.use(onlineSecurity.cabecalhos);
app.use(onlineSecurity.exigirHttps);
app.use(express.json({ limit: config.limiteJson }));

/*
|--------------------------------------------------------------------------
| Banco de dados
|--------------------------------------------------------------------------
*/

inicializarDatabase();
fs.mkdirSync(config.diretorioUploads, { recursive: true });
fs.mkdirSync(config.diretorioOutput, { recursive: true });

app.use(requestContext.middleware);
app.use(authMiddleware.carregar);

app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origem = req.headers.origin;
    const origemEsperada = config.urlPublica?.origin || `${req.protocol}://${req.get("host")}`;
    if (origem && origem !== origemEsperada) {
        return res.status(403).json({ sucesso: false, mensagem: "Origem da requisição não autorizada." });
    }
    next();
});

/*
|--------------------------------------------------------------------------
| Arquivos estáticos
|--------------------------------------------------------------------------
*/

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(
    "/uploads",
    authMiddleware.exigirApi,
    uploadAccess.autorizar,
    express.static(
        config.diretorioUploads
    )
);

/*
|--------------------------------------------------------------------------
| Páginas
|--------------------------------------------------------------------------
*/

function enviarPagina(pasta, arquivo) {
    return (req, res) => res.sendFile(path.join(__dirname, "public", pasta, arquivo));
}

app.get("/login", enviarPagina("auth", "login.html"));
app.get("/trocar-senha", enviarPagina("auth", "trocarSenha.html"));
app.get("/selecionar-empresa", enviarPagina("auth", "selecionarEmpresa.html"));

app.get("/", authMiddleware.exigirPagina, (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "cotacaoForm",
            "cotacaoForm.html"
        )
    );
});

app.get("/admin/produtos", authMiddleware.exigirPagina, (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "produtoAdmin",
            "produtoAdmin.html"
        )
    );
});

app.get("/admin/empresa", (req, res, next) => {
    if (req.query.nova === "1" && req.usuario?.perfil === "SUPER") {
        return authMiddleware.exigirSuperPagina(req, res, next);
    }
    return authMiddleware.exigirPagina(req, res, next);
}, authMiddleware.exigirAdminPagina, (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "empresaAdmin",
            "empresaAdmin.html"
        )
    );
});

app.get(
    "/admin/empresas",
    authMiddleware.exigirSuperPagina,
    enviarPagina("empresaGerenciamento", "empresaGerenciamento.html")
);

app.get("/health", (req, res) => {
    if (encerrando) {
        return res.status(503).json({ status: "encerrando" });
    }
    try {
        const bancoDisponivel = verificarDatabase();
        return res.status(bancoDisponivel ? 200 : 503).json({
            status: bancoDisponivel ? "ok" : "indisponivel",
            versao: require("../package.json").version,
            ambiente: config.ambiente,
            uptimeSegundos: Math.floor(process.uptime())
        });
    } catch (erro) {
        logger.error("Falha no healthcheck", erro, { idRequisicao: req.idRequisicao });
        return res.status(503).json({ status: "indisponivel" });
    }
});

app.get(
    "/admin/produtos/:codigo/descricao/preview",
    authMiddleware.exigirPagina,
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "produtoDescricaoPreview",
                "produtoDescricaoPreview.html"
            )
        );
    }
);

app.get(
    "/admin/produtos/:codigo/descricao",
    authMiddleware.exigirPagina,
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "produtoDescricao",
                "produtoDescricao.html"
            )
        );
    }
);

app.get("/admin/clientes", authMiddleware.exigirPagina, (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "clienteAdmin",
            "clienteAdmin.html"
        )
    );
});

app.get("/minha-conta", authMiddleware.exigirPagina, enviarPagina("auth", "minhaConta.html"));
app.get("/admin/usuarios", authMiddleware.exigirPagina, authMiddleware.exigirAdminPagina, enviarPagina("usuarioAdmin", "usuarioAdmin.html"));
app.get(
    "/admin/parametros",
    authMiddleware.exigirSuperPagina,
    enviarPagina("parametroAdmin", "parametroAdmin.html")
);

/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

app.use("/auth/login", onlineSecurity.limitarLogin);
app.use("/auth", authRoutes);
app.use("/documentos", authMiddleware.exigirApi, documentRoutes);
app.use("/produtos", authMiddleware.exigirApi, productRoutes);
app.use("/clientes", authMiddleware.exigirApi, clientRoutes);
app.use("/empresa", authMiddleware.exigirApi, companyRoutes);
app.use("/empresas", authMiddleware.exigirApi, companyManagementRoutes);
app.use("/usuarios", authMiddleware.exigirApi, userRoutes);
app.use("/parametros", authMiddleware.exigirApi, systemParameterRoutes);

app.use((erro, req, res, next) => {
    if (res.headersSent) return next(erro);

    if (erro.type === "entity.parse.failed") {
        return res.status(400).json({
            sucesso: false,
            mensagem: "O conteúdo JSON enviado é inválido."
        });
    }

    if (erro.type === "entity.too.large") {
        return res.status(413).json({
            sucesso: false,
            mensagem: "O conteúdo enviado excede o limite permitido."
        });
    }

    logger.error("Erro não tratado na requisição", erro, {
        idRequisicao: req.idRequisicao,
        metodo: req.method,
        caminho: req.originalUrl.split("?")[0]
    });
    return res.status(500).json({
        sucesso: false,
        mensagem: "Não foi possível concluir a operação.",
        idRequisicao: req.idRequisicao
    });
});

/*
|--------------------------------------------------------------------------
| Inicialização do servidor
|--------------------------------------------------------------------------
*/

let servidor = null;
let encerrando = false;
let limpezaRateLimit = null;

function iniciarServidor() {
    if (servidor) return servidor;
    servidor = app.listen(config.porta, config.host, () => {
        logger.info("ComDoc iniciado", {
            ambiente: config.ambiente,
            host: config.host,
            porta: config.porta
        });
    });
    limpezaRateLimit = setInterval(
        onlineSecurity.limparRateLimitExpirado,
        Math.min(config.janelaLoginMs, 15 * 60 * 1000)
    );
    limpezaRateLimit.unref();
    return servidor;
}

function encerrar(sinal) {
    if (encerrando) return;
    encerrando = true;
    logger.info("Encerramento iniciado", { sinal });

    const forcar = setTimeout(() => {
        logger.error("Encerramento excedeu o tempo limite", null);
        process.exit(1);
    }, config.tempoEncerramentoMs);
    forcar.unref();

    const finalizar = () => {
        try {
            if (limpezaRateLimit) clearInterval(limpezaRateLimit);
            encerrarDatabase();
            logger.info("ComDoc encerrado");
            process.exit(0);
        } catch (erro) {
            logger.error("Falha ao encerrar o ComDoc", erro);
            process.exit(1);
        }
    };

    if (servidor) servidor.close(finalizar);
    else finalizar();
}

if (require.main === module) {
    iniciarServidor();
    process.on("SIGTERM", () => encerrar("SIGTERM"));
    process.on("SIGINT", () => encerrar("SIGINT"));
}

module.exports = { app, iniciarServidor, encerrar };
