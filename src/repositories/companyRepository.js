const databaseRepository = require(
    "../database/databaseRepository"
);

function formatarTelefone(valor) {
    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length === 11) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }

    if (digitos.length === 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }

    return valor || "";
}

function formatarCep(valor) {
    const digitos = String(valor || "").replace(/\D/g, "");
    return digitos.length === 8
        ? `${digitos.slice(0, 5)}-${digitos.slice(5)}`
        : valor || "";
}

function mapear(registro) {
    if (!registro) {
        return null;
    }

    return {
        id: registro.id_empresa,
        nome: registro.nom_empresa,
        nomeFantasia: registro.nom_fantasia,
        cnpj: registro.num_cnpj || "",
        email: registro.end_email,
        telefone: registro.num_telefone,
        telefoneFormatado:
            formatarTelefone(registro.num_telefone),
        whatsapp: registro.num_whatsapp,
        whatsappFormatado:
            formatarTelefone(registro.num_whatsapp),
        logradouro: registro.nom_logradouro,
        numeroEndereco: registro.num_endereco,
        complemento: registro.nom_complem,
        bairro: registro.nom_bairro,
        cidade: registro.nom_cidade,
        uf: registro.sg_uf,
        cep: registro.num_cep,
        cepFormatado:
            formatarCep(registro.num_cep),
        site: registro.end_site,
        instagram: registro.nom_instagram,
        slogan: registro.dsc_slogan,
        corPrimaria: registro.cod_cor_primaria,
        corSecundaria: registro.cod_cor_secundaria,
        arquivoLogo: registro.nom_arquivo_logo,
        logoUrl: registro.nom_arquivo_logo
            ? `/uploads/empresas/${registro.id_empresa}/${registro.nom_arquivo_logo}`
            : null
    };
}

function buscarPorId(idEmpresa) {
    return mapear(
        databaseRepository.buscarUm(
            `SELECT * FROM empresa WHERE id_empresa = ?`,
            [idEmpresa]
        )
    );
}

function atualizar(idEmpresa, empresa) {
    const resultado = databaseRepository.executar(
        `
            UPDATE empresa
            SET
                nom_empresa = ?,
                nom_fantasia = ?,
                num_cnpj = ?,
                end_email = ?,
                num_telefone = ?,
                num_whatsapp = ?,
                nom_logradouro = ?,
                num_endereco = ?,
                nom_complem = ?,
                nom_bairro = ?,
                nom_cidade = ?,
                sg_uf = ?,
                num_cep = ?,
                end_site = ?,
                nom_instagram = ?,
                dsc_slogan = ?,
                cod_cor_primaria = ?,
                cod_cor_secundaria = ?,
                dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                cod_usu_edicao = ?
            WHERE id_empresa = ?
        `,
        [
            empresa.nome,
            empresa.nomeFantasia,
            empresa.cnpj || null,
            empresa.email,
            empresa.telefone,
            empresa.whatsapp,
            empresa.logradouro,
            empresa.numeroEndereco,
            empresa.complemento,
            empresa.bairro,
            empresa.cidade,
            empresa.uf,
            empresa.cep,
            empresa.site,
            empresa.instagram,
            empresa.slogan,
            empresa.corPrimaria,
            empresa.corSecundaria,
            empresa.usuarioEdicao,
            idEmpresa
        ]
    );

    return Number(resultado.changes) > 0
        ? buscarPorId(idEmpresa)
        : null;
}

function atualizarLogo(idEmpresa, arquivoLogo, usuarioEdicao) {
    const resultado = databaseRepository.executar(
        `
            UPDATE empresa
            SET
                nom_arquivo_logo = ?,
                dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                cod_usu_edicao = ?
            WHERE id_empresa = ?
        `,
        [arquivoLogo, usuarioEdicao, idEmpresa]
    );

    return Number(resultado.changes) > 0
        ? buscarPorId(idEmpresa)
        : null;
}

module.exports = {
    buscarPorId,
    atualizar,
    atualizarLogo
};
