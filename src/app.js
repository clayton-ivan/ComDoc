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
    express.static(
        path.join(__dirname, "uploads")
    )
);

/*
|--------------------------------------------------------------------------
| Páginas
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "cotacaoForm",
            "cotacaoForm.html"
        )
    );
});

app.get("/admin/produtos", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "produtoAdmin",
            "produtoAdmin.html"
        )
    );
});

app.get("/admin/empresa", (req, res) => {
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
    "/admin/produtos/:codigo/descricao/preview",
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

app.get("/admin/clientes", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "clienteAdmin",
            "clienteAdmin.html"
        )
    );
});

/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

app.use("/documentos", documentRoutes);
app.use("/produtos", productRoutes);
app.use("/clientes", clientRoutes);
app.use("/empresa", companyRoutes);

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
