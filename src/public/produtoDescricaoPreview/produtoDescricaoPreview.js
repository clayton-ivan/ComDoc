const documentoPreview = document.getElementById(
    "documentoPreview"
);

const mensagemPreview = document.getElementById(
    "mensagemPreview"
);

const botaoFechar = document.getElementById(
    "botaoFechar"
);

let urlPdf = null;

function obterCodigoProduto() {
    const resultado = window.location.pathname.match(
        /^\/admin\/produtos\/([^/]+)\/descricao\/preview\/?$/
    );

    return resultado
        ? decodeURIComponent(resultado[1])
        : null;
}

function obterDadosPreview() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const chave = parametros.get("chave");

    if (!chave) {
        throw new Error(
            "Dados da pré-visualização não informados."
        );
    }

    const conteudo = sessionStorage.getItem(chave);
    sessionStorage.removeItem(chave);

    if (!conteudo) {
        throw new Error(
            "A pré-visualização expirou. Abra-a novamente pela tela de edição."
        );
    }

    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
            {
                tipo: "comdoc-preview-consumido",
                chave
            },
            window.location.origin
        );
    }

    return JSON.parse(conteudo);
}

async function gerarPreview(dados) {
    const resposta = await fetch(
        "/documentos/preview-produto",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                codigoProduto:
                    dados.produto.codigo,
                blocos: dados.blocos
            })
        }
    );

    if (!resposta.ok) {
        let mensagem =
            "Não foi possível gerar a pré-visualização.";

        try {
            const erro = await resposta.json();
            mensagem = erro.mensagem || mensagem;
        } catch {
            // Mantém a mensagem padrão.
        }

        throw new Error(mensagem);
    }

    const arquivo = await resposta.blob();
    urlPdf = URL.createObjectURL(arquivo);

    documentoPreview.src =
        `${urlPdf}#toolbar=0&navpanes=0`;
    documentoPreview.hidden = false;
    mensagemPreview.hidden = true;
}

function fechar() {
    if (window.opener && !window.opener.closed) {
        window.close();
        return;
    }

    const codigoProduto = obterCodigoProduto();
    window.location.href =
        `/admin/produtos/${encodeURIComponent(
            codigoProduto
        )}/descricao`;
}

function liberarPdf() {
    if (urlPdf) {
        URL.revokeObjectURL(urlPdf);
        urlPdf = null;
    }
}

botaoFechar.addEventListener("click", fechar);
window.addEventListener("pagehide", liberarPdf);

gerarPreview(obterDadosPreview()).catch(
    (erro) => {
        console.error(
            "Erro ao gerar pré-visualização:",
            erro
        );

        mensagemPreview.hidden = false;
        mensagemPreview.textContent = erro.message;
        mensagemPreview.classList.add(
            "mensagem-erro"
        );
    }
);
