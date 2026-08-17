const express = require("express");
const path = require("path");

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
const authMiddleware = require("./middleware/authMiddleware");
const requestContext = require("./context/requestContext");

const {
    inicializarDatabase
} = require("./database/database");

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Banco de dados
|--------------------------------------------------------------------------
*/

inicializarDatabase();

app.use(requestContext.middleware);
app.use(authMiddleware.carregar);

app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origem = req.headers.origin;
    if (origem && origem !== `${req.protocol}://${req.get("host")}`) {
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
    express.static(
        path.join(__dirname, "uploads")
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

/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

app.use("/auth", authRoutes);
app.use("/documentos", authMiddleware.exigirApi, documentRoutes);
app.use("/produtos", authMiddleware.exigirApi, productRoutes);
app.use("/clientes", authMiddleware.exigirApi, clientRoutes);
app.use("/empresa", authMiddleware.exigirApi, companyRoutes);
app.use("/empresas", authMiddleware.exigirApi, companyManagementRoutes);
app.use("/usuarios", authMiddleware.exigirApi, userRoutes);

/*
|--------------------------------------------------------------------------
| Inicialização do servidor
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `ComDoc iniciado em http://localhost:${PORT}`
    );
});
