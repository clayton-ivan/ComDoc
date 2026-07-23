const express = require("express");
const path = require("path");

const productRoutes =
    require("./routes/productRoutes");

const clientRoutes =
    require("./routes/clientRoutes");

const documentRoutes =
    require("./routes/documentRoutes");

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