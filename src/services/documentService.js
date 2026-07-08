const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const gerar = async ({ template, dados }) => {
	
    const caminhoTemplate = path.join(
		__dirname,
		"..",
		"templates",
		`${template}.html`
	);
	
	const templateHtml = fs.readFileSync(
		caminhoTemplate,
		"utf8"
	);

    const html = Handlebars.compile(template)(dados);

    const css = fs.readFileSync(
        path.join(__dirname, "..", "assets", "css", "estilo.css"),
        "utf8"
    );

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: "networkidle0"
    });

    await page.addStyleTag({
        content: css
    });

    const caminhoPdf = path.join(
        __dirname,
        "..",
        "..",
        "output",
        "relatorio.pdf"
    );

    await page.pdf({
        path: caminhoPdf,
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            right: "20mm",
            bottom: "20mm",
            left: "20mm"
        }
    });

    await browser.close();

    return {
		sucesso: true,
		caminhoPdf
	};

};

module.exports = {
    gerar
};