const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const {
    prepararProduto,
    registrarParcialProduto
} = require("./documentService");

const gerar = async (contexto) => {
    const pastaTemplate = path.join(
        __dirname,
        "..",
        "templates",
        "cotacao"
    );

    const css = fs.readFileSync(
        path.join(
            pastaTemplate,
            "cotacao.css"
        ),
        "utf8"
    );

    registrarParcialProduto(
        pastaTemplate
    );

    const templateCompilado =
        Handlebars.compile(`
            <!DOCTYPE html>
            <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <style>${css}</style>
                </head>
                <body>
                    {{> produto}}
                </body>
            </html>
        `);

    const htmlFinal = templateCompilado(
        prepararProduto(contexto)
    );

    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.setContent(htmlFinal, {
            waitUntil: "networkidle0"
        });

        const pdf = await page.pdf({
            width: "210mm",
            height: "297mm",
            margin: {
                top: "0mm",
                right: "0mm",
                bottom: "0mm",
                left: "0mm"
            },
            printBackground: true,
            preferCSSPageSize: true
        });

        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
};

module.exports = {
    gerar
};
