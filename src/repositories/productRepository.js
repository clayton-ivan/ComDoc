const fs = require("fs");
const path = require("path");

const pastaProdutos = path.join(
    __dirname,
    "..",
    "catalogos",
    "produtos"
);

function garantirPastaProdutos() {
    if (!fs.existsSync(pastaProdutos)) {
        fs.mkdirSync(pastaProdutos, {
            recursive: true
        });
    }
}

function obterCaminhoProduto(codigo) {
    return path.join(
        pastaProdutos,
        `${codigo}.json`
    );
}

function listar() {
    garantirPastaProdutos();

    const arquivos = fs.readdirSync(pastaProdutos);

    return arquivos
        .filter((arquivo) => arquivo.endsWith(".json"))
        .map((arquivo) => {
            const caminhoArquivo = path.join(
                pastaProdutos,
                arquivo
            );

            const conteudo = fs.readFileSync(
                caminhoArquivo,
                "utf8"
            );

            return JSON.parse(conteudo);
        });
}

function buscarPorCodigo(codigo) {
    garantirPastaProdutos();

    const caminhoArquivo = obterCaminhoProduto(codigo);

    if (!fs.existsSync(caminhoArquivo)) {
        return null;
    }

    const conteudo = fs.readFileSync(
        caminhoArquivo,
        "utf8"
    );

    return JSON.parse(conteudo);
}

function criar(produto) {
    garantirPastaProdutos();

    const caminhoArquivo = obterCaminhoProduto(
        produto.codigo
    );

    if (fs.existsSync(caminhoArquivo)) {
        throw new Error(
            `Já existe um produto com o código "${produto.codigo}".`
        );
    }

    fs.writeFileSync(
        caminhoArquivo,
        JSON.stringify(produto, null, 4),
        "utf8"
    );

    return produto;
}

function atualizar(codigo, produto) {
    garantirPastaProdutos();

    const caminhoArquivo = obterCaminhoProduto(codigo);

    if (!fs.existsSync(caminhoArquivo)) {
        return null;
    }

    fs.writeFileSync(
        caminhoArquivo,
        JSON.stringify(produto, null, 4),
        "utf8"
    );

    return produto;
}

function excluir(codigo) {
    garantirPastaProdutos();

    const caminhoArquivo = obterCaminhoProduto(codigo);

    if (!fs.existsSync(caminhoArquivo)) {
        return false;
    }

    fs.unlinkSync(caminhoArquivo);

    return true;
}

module.exports = {
    listar,
    buscarPorCodigo,
    criar,
    atualizar,
    excluir
};