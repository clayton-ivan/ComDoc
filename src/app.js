const express = require("express");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Arquivos estáticos
|--------------------------------------------------------------------------
*/

app.use(express.static(path.join(__dirname, "public")));

/*
|--------------------------------------------------------------------------
| Página inicial
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

/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

app.use("/documentos", documentRoutes);
app.use("/produtos", productRoutes);

/*
|--------------------------------------------------------------------------
| Inicialização
|--------------------------------------------------------------------------
*/

const PORT = 3000;

app.listen(PORT, () => {

    console.log(`ComDoc iniciado em http://localhost:${PORT}`);

});