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

            nom_fantasia TEXT
                NOT NULL
                DEFAULT '',

            end_email TEXT
                NOT NULL
                DEFAULT '',

            num_telefone TEXT
                NOT NULL
                DEFAULT '',

            num_whatsapp TEXT
                NOT NULL
                DEFAULT '',

            nom_logradouro TEXT
                NOT NULL
                DEFAULT '',

            num_endereco TEXT
                NOT NULL
                DEFAULT '',

            nom_complem TEXT
                NOT NULL
                DEFAULT '',

            nom_bairro TEXT
                NOT NULL
                DEFAULT '',

            nom_cidade TEXT
                NOT NULL
                DEFAULT '',

            sg_uf TEXT
                NOT NULL
                DEFAULT '',

            num_cep TEXT
                NOT NULL
                DEFAULT '',

            end_site TEXT
                NOT NULL
                DEFAULT '',

            nom_instagram TEXT
                NOT NULL
                DEFAULT '',

            dsc_slogan TEXT
                NOT NULL
                DEFAULT '',

            cod_cor_primaria TEXT
                NOT NULL
                DEFAULT '#F36B21',

            cod_cor_secundaria TEXT
                NOT NULL
                DEFAULT '#1F2937',

            nom_arquivo_logo TEXT,

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
                nom_fantasia,
                num_whatsapp,
                nom_logradouro,
                num_endereco,
                nom_bairro,
                nom_cidade,
                sg_uf,
                num_cep,
                end_site,
                nom_instagram,
                dsc_slogan,
                cod_cor_primaria,
                cod_cor_secundaria,
                cod_usu_edicao
            )
            VALUES (
                ?,
                ?,
                NULL,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?
            )
        `)
        .run(
            ID_EMPRESA_PADRAO,
            "Alfa Gruas e Elevadores",
            "Alfa Gruas e Elevadores",
            "47996254427",
            "Rua Ver. Milton Ribeiro da Luz",
            "160",
            "Fazenda",
            "Itajaí",
            "SC",
            "88306025",
            "www.alfaelevadorescremlaheira.com.br",
            "@alfaelevadoresegruas",
            "Transformando projetos em grandes obras.",
            "#F36B21",
            "#1F2937",
            COD_USUARIO_SISTEMA
        );
}

module.exports = {
    criarTabelaEmpresa,
    criarEmpresaPadrao
};
