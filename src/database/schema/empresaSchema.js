const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require("../../constants/application");

function criarTabelaEmpresa(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS empresa (
            id_empresa INTEGER
                PRIMARY KEY AUTOINCREMENT,

            nom_empresa TEXT
                NOT NULL,

            num_cnpj TEXT,

            dt_criacao TEXT
                NOT NULL
                DEFAULT (
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    )
                ),

            dt_edicao TEXT,

            cod_usu_edicao TEXT
        ) STRICT;
    `);
}

function criarEmpresaPadrao(database) {
    const empresaExistente = database
        .prepare(`
            SELECT id_empresa
            FROM empresa
            WHERE id_empresa = ?
        `)
        .get(ID_EMPRESA_PADRAO);

    if (empresaExistente) {
        return;
    }

    database
        .prepare(`
            INSERT INTO empresa (
                id_empresa,
                nom_empresa,
                num_cnpj,
                cod_usu_edicao
            )
            VALUES (
                ?,
                ?,
                NULL,
                ?
            )
        `)
        .run(
            ID_EMPRESA_PADRAO,
            "Empresa padrão",
            COD_USUARIO_SISTEMA
        );
}

module.exports = {
    criarTabelaEmpresa,
    criarEmpresaPadrao
};
