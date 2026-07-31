const {
    definirVersaoDatabase
} = require("../support/databaseStructure");

function migration002Clientes(database) {
    /*
     * A tabela da versão 2 não tinha id_empresa.
     * Ela é criada nesse formato para manter a sequência
     * histórica das migrations.
     */
    database.exec(`
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER
                PRIMARY KEY AUTOINCREMENT,

            nom_cliente TEXT
                NOT NULL,

            end_email TEXT,

            num_telefone TEXT,

            num_cpf TEXT,

            num_cnpj TEXT,

            nom_logradouro TEXT,

            num_endereco INTEGER,

            nom_complem TEXT,

            nom_cidade TEXT,

            sg_uf TEXT,

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

    definirVersaoDatabase(database, 2);
}

module.exports = migration002Clientes;
