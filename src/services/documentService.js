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
	
	const caminhoCapa = path.join(
		pastaTemplate,
		"imagens",
		"capa.png"
	);

	const capaBase64 = fs.readFileSync(caminhoCapa, "base64");

	const capa = `data:image/png;base64,${capaBase64}`;
	
	Handlebars.registerHelper("moeda", (valor) => {
		return Number(valor).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		});
	});
	
    const templateCompilado = Handlebars.compile(html);

    const htmlFinal = templateCompilado({
		...contexto,
		capa,
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

    await browser.close();

    return {
		caminhoPdf
	};
};

module.exports = {
    gerar
};