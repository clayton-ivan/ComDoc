const express = require("express");
const path = require("path");

const app = express();

const pdfRoutes = require("./routes/pdfRoutes");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/pdf", pdfRoutes);

app.listen(3000, () => {

    console.log("Servidor iniciado!");

});