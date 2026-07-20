const productService = require(
    "../services/productService"
);

function listar(req, res) {
    try {
        const produtos = productService.listar();

        return res.json(produtos);
    } catch (erro) {
        console.error(
            "Erro ao listar produtos:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Não foi possível listar os produtos."
        });
    }
}

function buscarPorCodigo(req, res) {
    try {
        const produto =
            productService.buscarPorCodigo(
                req.params.codigo
            );

        if (!produto) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Produto não encontrado."
            });
        }

        return res.json(produto);
    } catch (erro) {
        console.error(
            "Erro ao buscar produto:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Não foi possível buscar o produto."
        });
    }
}

function criar(req, res) {
    try {
        const produto =
            productService.criar(req.body);

        return res.status(201).json({
            sucesso: true,
            produto
        });
    } catch (erro) {
        console.error(
            "Erro ao criar produto:",
            erro
        );

        return res.status(400).json({
            sucesso: false,
            mensagem: erro.message
        });
    }
}

function atualizar(req, res) {
    try {
        const produto =
            productService.atualizar(
                req.params.codigo,
                req.body
            );

        if (!produto) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Produto não encontrado."
            });
        }

        return res.json({
            sucesso: true,
            produto
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar produto:",
            erro
        );

        return res.status(400).json({
            sucesso: false,
            mensagem: erro.message
        });
    }
}

function excluir(req, res) {
    try {
        const produtoExcluido =
            productService.excluir(
                req.params.codigo
            );

        if (!produtoExcluido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Produto não encontrado."
            });
        }

        return res.status(204).send();
    } catch (erro) {
        console.error(
            "Erro ao excluir produto:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Não foi possível excluir o produto."
        });
    }
}

function obterProximoCodigo(req, res) {
    try {
        const codigo =
            productService.obterProximoCodigo();

        return res.json({
            codigo
        });
    } catch (erro) {
        console.error(
            "Erro ao gerar próximo código:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Não foi possível gerar o próximo código."
        });
    }
}

module.exports = {
    listar,
    buscarPorCodigo,
    criar,
    atualizar,
    excluir,
	obterProximoCodigo
};