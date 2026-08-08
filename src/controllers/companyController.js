const multer = require("multer");

const companyService = require(
    "../services/companyService"
);

const companyLogoService = require(
    "../services/companyLogoService"
);

const HTTP = require("../constants/httpStatus");

const receberLogo = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
}).single("logo");

function buscar(req, res) {
    const empresa = companyService.obterAtual();

    if (!empresa) {
        return res.status(HTTP.NOT_FOUND).json({
            sucesso: false,
            mensagem: "Empresa não encontrada."
        });
    }

    return res.json(empresa);
}

function atualizar(req, res) {
    try {
        const empresa = companyService.atualizarAtual(
            req.body
        );

        return res.json({ sucesso: true, empresa });
    } catch (erro) {
        return res.status(HTTP.BAD_REQUEST).json({
            sucesso: false,
            mensagem: erro.message
        });
    }
}

function uploadLogo(req, res) {
    receberLogo(req, res, (erroUpload) => {
        if (erroUpload) {
            return res.status(HTTP.BAD_REQUEST).json({
                sucesso: false,
                mensagem:
                    erroUpload.code === "LIMIT_FILE_SIZE"
                        ? "A logo deve possuir no máximo 5 MB."
                        : "Não foi possível receber a logo."
            });
        }

        try {
            const empresa =
                companyLogoService.salvarAtual(
                    req.file
                );

            return res.status(HTTP.CREATED).json({
                sucesso: true,
                empresa
            });
        } catch (erro) {
            return res.status(HTTP.BAD_REQUEST).json({
                sucesso: false,
                mensagem: erro.message
            });
        }
    });
}

function excluirLogo(req, res) {
    const empresa = companyLogoService.excluirAtual();

    if (!empresa) {
        return res.status(HTTP.NOT_FOUND).json({
            sucesso: false,
            mensagem: "Empresa não encontrada."
        });
    }

    return res.json({ sucesso: true, empresa });
}

module.exports = {
    buscar,
    atualizar,
    uploadLogo,
    excluirLogo
};
