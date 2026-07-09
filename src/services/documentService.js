const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const gerar = async ({ template, contexto }) => {
	
    const pastaTemplate = path.join(
		__dirname,
		"..",
		"templates",
		template
	);
	
	const caminhoTemplate = path.join(
		pastaTemplate,
		`${template}.html`
	);

	const caminhoCss = path.join(
		pastaTemplate,
		`${template}.css`
	);
	
	const html = fs.readFileSync(caminhoTemplate, "utf8");

	const css = fs.readFileSync(caminhoCss, "utf8");

	const Handlebars = require("handlebars");

	const templateCompilado = Handlebars.compile(html);

	const htmlFinal = templateCompilado({
		...contexto.dados,
		css
	});

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlFinal, {
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