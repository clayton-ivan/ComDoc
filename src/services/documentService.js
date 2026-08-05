const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const productImageService = require(
    "./productImageService"
);

function organizarLinhasTabela(itens = []) {
    const linhas = new Map();

    itens.forEach((item) => {
        if (!linhas.has(item.linha)) {
            linhas.set(item.linha, []);
        }

        linhas.get(item.linha).push(item);
    });

    return Array.from(linhas.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([numero, celulas]) => ({
            numero,
            celulas: celulas.sort(
                (a, b) => a.coluna - b.coluna
            )
        }));
}

function prepararBloco(
    bloco,
    codigoProduto
) {
    const preparado = {
        ...bloco,
        classeAlinhamento:
            `alinhamento-${String(
                bloco.alinhamento || "ESQUERDA"
            ).toLowerCase()}`,
        ehTexto: bloco.tipo === "TEXTO",
        ehLista: bloco.tipo === "LISTA",
        ehTabela: bloco.tipo === "TABELA",
        ehImagem: bloco.tipo === "IMAGEM",
        listaNumerada:
            bloco.tipoLista === "NUMERADOR",
        imagemPequena:
            bloco.tamanhoImagem === "PEQUENO",
        imagemGrande:
            bloco.tamanhoImagem === "GRANDE"
    };

    if (preparado.ehTabela) {
        const linhas = organizarLinhasTabela(
            bloco.itens
        );

        const primeiraLinha = linhas[0];
        const primeiraEhCabecalho =
            primeiraLinha &&
            primeiraLinha.celulas.length > 0 &&
            primeiraLinha.celulas.every(
                (celula) => celula.cabecalho
            );

        preparado.linhasCabecalho =
            primeiraEhCabecalho
                ? [primeiraLinha]
                : [];

        preparado.linhasCorpo =
            primeiraEhCabecalho
                ? linhas.slice(1)
                : linhas;
    }

    if (preparado.ehImagem) {
        preparado.imagemDataUrl =
            productImageService.obterDataUrl(
                codigoProduto,
                bloco.conteudo
            );
    }

    return preparado;
}

function prepararProduto(contexto) {
    const blocos = Array.isArray(
        contexto.produtoBlocos
    )
        ? contexto.produtoBlocos
        : [];

    const blocosPreparados = blocos.map(
        (bloco) => prepararBloco(
            bloco,
            contexto.produtoCodigo
        )
    );

    return {
        ...contexto,
        produtoBlocos: blocosPreparados,
        possuiProdutoBlocos:
            blocosPreparados.length > 0
    };
}

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

    const contextoPreparado =
        prepararProduto(contexto);

    const htmlFinal = templateCompilado({
		...contextoPreparado,
		capa,
		garantia,
		importacao,
		rodape,
		css
	});

    const browser = await puppeteer.launch();

    try {
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

        return {
		    caminhoPdf
	    };
    } finally {
        await browser.close();
    }
};

module.exports = {
    gerar
};
