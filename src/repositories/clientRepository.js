const databaseRepository =
    require("../database/databaseRepository");

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

function listar() {
    const registros =
        databaseRepository.buscarTodos(
            `
                SELECT
                    id_cliente,
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
                FROM cliente
                ORDER BY
                    nom_cliente,
                    id_cliente
            `
        );

    return registros.map(mapearCliente);
}

function buscarPorId(idCliente) {
    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    id_cliente,
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
                FROM cliente
                WHERE id_cliente = ?
            `,
            [idCliente]
        );

    return mapearCliente(registro);
}

function buscarPorCpf(cpf) {
    if (!cpf) {
        return null;
    }

    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    id_cliente,
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
                FROM cliente
                WHERE num_cpf = ?
            `,
            [cpf]
        );

    return mapearCliente(registro);
}

function buscarPorCnpj(cnpj) {
    if (!cnpj) {
        return null;
    }

    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    id_cliente,
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
                FROM cliente
                WHERE num_cnpj = ?
            `,
            [cnpj]
        );

    return mapearCliente(registro);
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(cliente) {
    const resultado =
        databaseRepository.executar(
            `
                INSERT INTO cliente (
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
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    ),
                    NULL,
                    NULL
                )
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
                cliente.uf
            ]
        );

    const idCliente =
        Number(resultado.lastInsertRowid);

    return buscarPorId(idCliente);
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(idCliente, cliente) {
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
                    cod_usu_edicao = NULL
                WHERE id_cliente = ?
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
                idCliente
            ]
        );

    if (Number(resultado.changes) === 0) {
        return null;
    }

    return buscarPorId(idCliente);
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(idCliente) {
    const resultado =
        databaseRepository.executar(
            `
                DELETE FROM cliente
                WHERE id_cliente = ?
            `,
            [idCliente]
        );

    return Number(resultado.changes) > 0;
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