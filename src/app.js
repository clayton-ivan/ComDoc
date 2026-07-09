const express = require("express");
const path = require("path");

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
            "index.html"
        )
    );

});

/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

app.use("/documentos", documentRoutes);

/*
|--------------------------------------------------------------------------
| Inicialização
|--------------------------------------------------------------------------
*/

const PORT = 3000;

app.listen(PORT, () => {

    console.log(`ComDoc iniciado em http://localhost:${PORT}`);

});