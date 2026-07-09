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
        "cotacao.html"
    );

    const caminhoCss = path.join(
        pastaTemplate,
        "cotacao.css"
    );

    const html = fs.readFileSync(
        caminhoTemplate,
        "utf8"
    );

    const css = fs.readFileSync(
        caminhoCss,
        "utf8"
    );
	
	const caminhoTextos = path.join(
		pastaTemplate,
		"textos"
	);

	const garantia = fs.readFileSync(
		path.join(caminhoTextos, "garantia.html"),
		"utf8"
	);

	const importacao = fs.readFileSync(
		path.join(caminhoTextos, "importacao.html"),
		"utf8"
	);

	const rodape = fs.readFileSync(
		path.join(caminhoTextos, "rodape.html"),
		"utf8"
	);

    const templateCompilado = Handlebars.compile(html);

    const htmlFinal = templateCompilado({
		...contexto,
		garantia,
		importacao,
		rodape,
		css
	});

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlFinal, {
        waitUntil: "networkidle0"
    });
	
	const pastaOutput = path.join(
		__dirname,
		"..",
		"..",
		"output"
	);

	if (!fs.existsSync(pastaOutput)) {
		fs.mkdirSync(pastaOutput);
	}

	const caminhoPdf = path.join(
		pastaOutput,
		"cotacao.pdf"
	);
	
    await page.pdf({
        path: caminhoPdf,
        format: "A4",
        printBackground: true
    });

    await browser.close();

    return {
		caminhoPdf
	};
};

module.exports = {
    gerar
};