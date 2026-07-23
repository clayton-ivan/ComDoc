const databaseRepository = require(
    "../database/databaseRepository"
);

/*
|--------------------------------------------------------------------------
| Campos de consulta
|--------------------------------------------------------------------------
*/

const CAMPOS_CLIENTE = `
    id_cliente,
    id_empresa,
    nom_cliente,
    end_email,
    num_telefone,
    num_cpf,
    num_cnpj,
    nom_logradouro,
    num_endereco,
    nom_complem,
    nom_cidade,
    sg_uf,
    dt_criacao,
    dt_edicao,
    cod_usu_edicao
`;

/*
|--------------------------------------------------------------------------
| Mapeamento
|--------------------------------------------------------------------------
*/

function mapearCliente(registro) {
    if (!registro) {
        return null;
    }

    return {
        idCliente: registro.id_cliente,

        /*
         * O id da empresa é mantido no objeto interno.
         * O frontend não precisa enviá-lo em nenhuma operação.
         */
        idEmpresa: registro.id_empresa,

        nome: registro.nom_cliente,
        email: registro.end_email,
        telefone: registro.num_telefone,
        cpf: registro.num_cpf,
        cnpj: registro.num_cnpj,
        logradouro: registro.nom_logradouro,
        numeroEndereco: registro.num_endereco,
        complemento: registro.nom_complem,
        cidade: registro.nom_cidade,
        uf: registro.sg_uf,
        dataCriacao: registro.dt_criacao,
        dataEdicao: registro.dt_edicao,
        usuarioEdicao: registro.cod_usu_edicao
    };
}

/*
|--------------------------------------------------------------------------
| Consultas
|--------------------------------------------------------------------------
*/

function listar(idEmpresa) {
    const registros =
        databaseRepository.buscarTodos(
            `
                SELECT
                    ${CAMPOS_CLIENTE}
                FROM cliente
                WHERE id_empresa = ?
                ORDER BY
                    nom_cliente,
                    id_cliente
            `,
            [idEmpresa]
        );

    return registros.map(mapearCliente);
}

function buscarPorId(
    idEmpresa,
    idCliente
) {
    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    ${CAMPOS_CLIENTE}
                FROM cliente
                WHERE id_empresa = ?
                  AND id_cliente = ?
            `,
            [
                idEmpresa,
                idCliente
            ]
        );

    return mapearCliente(registro);
}

function buscarPorCpf(
    idEmpresa,
    cpf
) {
    if (!cpf) {
        return null;
    }

    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    ${CAMPOS_CLIENTE}
                FROM cliente
                WHERE id_empresa = ?
                  AND num_cpf = ?
            `,
            [
                idEmpresa,
                cpf
            ]
        );

    return mapearCliente(registro);
}

function buscarPorCnpj(
    idEmpresa,
    cnpj
) {
    if (!cnpj) {
        return null;
    }

    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    ${CAMPOS_CLIENTE}
                FROM cliente
                WHERE id_empresa = ?
                  AND num_cnpj = ?
            `,
            [
                idEmpresa,
                cnpj
            ]
        );

    return mapearCliente(registro);
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(
    idEmpresa,
    cliente,
    codUsuarioEdicao = null
) {
    const resultado =
        databaseRepository.executar(
            `
                INSERT INTO cliente (
                    id_empresa,
                    nom_cliente,
                    end_email,
                    num_telefone,
                    num_cpf,
                    num_cnpj,
                    nom_logradouro,
                    num_endereco,
                    nom_complem,
                    nom_cidade,
                    sg_uf,
                    dt_criacao,
                    dt_edicao,
                    cod_usu_edicao
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    ),
                    NULL,
                    ?
                )
            `,
            [
                idEmpresa,
                cliente.nome,
                cliente.email,
                cliente.telefone,
                cliente.cpf,
                cliente.cnpj,
                cliente.logradouro,
                cliente.numeroEndereco,
                cliente.complemento,
                cliente.cidade,
                cliente.uf,
                codUsuarioEdicao
            ]
        );

    const idCliente = Number(
        resultado.lastInsertRowid
    );

    return buscarPorId(
        idEmpresa,
        idCliente
    );
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(
    idEmpresa,
    idCliente,
    cliente,
    codUsuarioEdicao = null
) {
    const resultado =
        databaseRepository.executar(
            `
                UPDATE cliente
                SET
                    nom_cliente = ?,
                    end_email = ?,
                    num_telefone = ?,
                    num_cpf = ?,
                    num_cnpj = ?,
                    nom_logradouro = ?,
                    num_endereco = ?,
                    nom_complem = ?,
                    nom_cidade = ?,
                    sg_uf = ?,
                    dt_edicao = strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    ),
                    cod_usu_edicao = ?
                WHERE id_empresa = ?
                  AND id_cliente = ?
            `,
            [
                cliente.nome,
                cliente.email,
                cliente.telefone,
                cliente.cpf,
                cliente.cnpj,
                cliente.logradouro,
                cliente.numeroEndereco,
                cliente.complemento,
                cliente.cidade,
                cliente.uf,
                codUsuarioEdicao,
                idEmpresa,
                idCliente
            ]
        );

    if (
        Number(resultado.changes) === 0
    ) {
        return null;
    }

    return buscarPorId(
        idEmpresa,
        idCliente
    );
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(
    idEmpresa,
    idCliente
) {
    const resultado =
        databaseRepository.executar(
            `
                DELETE FROM cliente
                WHERE id_empresa = ?
                  AND id_cliente = ?
            `,
            [
                idEmpresa,
                idCliente
            ]
        );

    return (
        Number(resultado.changes) > 0
    );
}

module.exports = {
    listar,
    buscarPorId,
    buscarPorCpf,
    buscarPorCnpj,
    criar,
    atualizar,
    excluir
};