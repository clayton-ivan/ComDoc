const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const productImageService = require(
    "./productImageService"
);

const { obterIdEmpresaAtual } = require("../context/requestContext");

const companyLogoService = require(
    "./companyLogoService"
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
    idEmpresa,
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
                idEmpresa,
                codigoProduto,
                bloco.conteudo
            );
    }

    return preparado;
}

function prepararProduto(contexto) {
    const idEmpresa =
        contexto.idEmpresa ||
        obterIdEmpresaAtual();

    const blocos = Array.isArray(
        contexto.produtoBlocos
    )
        ? contexto.produtoBlocos
        : [];

    const blocosPreparados = blocos.map(
        (bloco) => prepararBloco(
            bloco,
            idEmpresa,
            contexto.produtoCodigo
        )
    );

    return {
        ...contexto,
        idEmpresa,
        produtoBlocos: blocosPreparados,
        possuiProdutoBlocos:
            blocosPreparados.length > 0
    };
}

function rgb(cor) {
    const valor = String(cor || "").replace("#", "");
    return [0, 2, 4].map((inicio) => Number.parseInt(valor.slice(inicio, inicio + 2), 16));
}

function luminancia(cor) {
    const canais = rgb(cor).map((canal) => {
        const valor = canal / 255;
        return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function contraste(corA, corB) {
    const [maior, menor] = [luminancia(corA), luminancia(corB)].sort((a, b) => b - a);
    return (maior + 0.05) / (menor + 0.05);
}

function textoSobre(corFundo) {
    return contraste(corFundo, "#FFFFFF") >= contraste(corFundo, "#111827")
        ? "#FFFFFF" : "#111827";
}

function corLegivelEmBranco(cor) {
    return contraste(cor, "#FFFFFF") >= 4.5 ? cor : "#1F2937";
}

function registrarParcialProduto(
    pastaTemplate
) {
    const caminhoParcialProduto = path.join(
        pastaTemplate,
        "parciais",
        "produto.html"
    );

    const parcialProduto = fs.readFileSync(
        caminhoParcialProduto,
        "utf8"
    );

    Handlebars.registerPartial(
        "produto",
        parcialProduto
    );
}

const gerar = async ({
    template,
    contexto,
    caminhoDestino = null
}) => {

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

    registrarParcialProduto(
        pastaTemplate
    );
	
	const caminhoTextos = path.join(
		pastaTemplate,
		"textos"
	);

	const rodape = fs.readFileSync(
		path.join(caminhoTextos, "rodape.html"),
		"utf8"
	);
	
	Handlebars.registerHelper("moeda", (valor) => {
		return Number(valor).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		});
	});
	
    const templateCompilado = Handlebars.compile(html);

    const contextoPreparado =
        prepararProduto(contexto);

    const empresaPreparada = contextoPreparado.empresa
        ? {
            ...contextoPreparado.empresa,
            logoDataUrl:
                companyLogoService.obterDataUrl(
                    contextoPreparado.empresa
                ),
            capaDataUrl:
                companyLogoService.obterCapaDataUrl(
                    contextoPreparado.empresa
                ),
            corTextoPrimaria: textoSobre(contextoPreparado.empresa.corPrimaria),
            corTextoSecundaria: corLegivelEmBranco(contextoPreparado.empresa.corSecundaria)
        }
        : null;

    if (empresaPreparada) {
        empresaPreparada.usarCapaPropria = Boolean(
            empresaPreparada.usarCapaPropria && empresaPreparada.capaDataUrl
        );
        empresaPreparada.logoMarcaDagua = Boolean(
            empresaPreparada.logoMarcaDagua && empresaPreparada.logoDataUrl
        );
    }

    const rodapeFinal = Handlebars.compile(
        rodape
    )({ empresa: empresaPreparada });

    const htmlFinal = templateCompilado({
		...contextoPreparado,
		empresa: empresaPreparada,
		rodape: rodapeFinal,
		css
	});

    const browser = await puppeteer.launch({ timeout: 120000 });

    try {
        const page = await browser.newPage();


        await page.setContent(htmlFinal, {
		    waitUntil: "networkidle0",
            timeout: 120000
	    });
	
	const pastaOutput = caminhoDestino
        ? path.dirname(caminhoDestino)
        : path.join(
		__dirname,
		"..",
		"..",
		"output"
	    );

	if (!fs.existsSync(pastaOutput)) {
		fs.mkdirSync(pastaOutput);
	}

	const caminhoPdf = caminhoDestino ||
        path.join(
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

		preferCSSPageSize: true,
        timeout: 120000
	    });

        return {
		    caminhoPdf
	    };
    } finally {
        await browser.close();
    }
};

module.exports = {
    gerar,
    prepararProduto,
    registrarParcialProduto
};
