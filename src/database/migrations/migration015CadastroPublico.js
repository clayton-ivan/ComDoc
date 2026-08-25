const { criarTabelasDocumentoLegal } = require('../schema/documentoLegalSchema');
const { criarTabelasCadastroPublico } = require('../schema/cadastroPublicoSchema');
const { criarTabelaParametroSistema } = require('../schema/parametroSistemaSchema');
const { definirVersaoDatabase } = require('../support/databaseStructure');

function colunaExiste(database, tabela, coluna) {
    return database.prepare(`PRAGMA table_info(${tabela})`).all()
        .some((item) => item.name === coluna);
}

function migration015CadastroPublico(database) {
    if (!colunaExiste(database, 'empresa', 'sg_origem_cadastro')) {
        database.exec(`ALTER TABLE empresa ADD COLUMN sg_origem_cadastro TEXT NOT NULL DEFAULT 'INTERNO' CHECK (sg_origem_cadastro IN ('INTERNO', 'PUBLICO'))`);
    }
    if (!colunaExiste(database, 'empresa', 'dt_ativacao')) {
        database.exec(`ALTER TABLE empresa ADD COLUMN dt_ativacao TEXT`);
        database.exec(`UPDATE empresa SET dt_ativacao = COALESCE(dt_ativacao, dt_criacao) WHERE fg_status = 1`);
    }
    if (!colunaExiste(database, 'usuario', 'fg_email_confirmado')) {
        database.exec(`ALTER TABLE usuario ADD COLUMN fg_email_confirmado INTEGER NOT NULL DEFAULT 1 CHECK (fg_email_confirmado IN (0, 1))`);
    }
    if (!colunaExiste(database, 'usuario', 'dt_email_confirmado')) {
        database.exec(`ALTER TABLE usuario ADD COLUMN dt_email_confirmado TEXT`);
        database.exec(`UPDATE usuario SET dt_email_confirmado = COALESCE(dt_email_confirmado, dt_criacao) WHERE fg_email_confirmado = 1`);
    }

    const duplicado = database.prepare(`
        SELECT num_cnpj FROM empresa
        WHERE num_cnpj IS NOT NULL AND trim(num_cnpj) <> ''
        GROUP BY num_cnpj HAVING COUNT(*) > 1 LIMIT 1
    `).get();
    if (!duplicado) {
        database.exec(`CREATE UNIQUE INDEX IF NOT EXISTS uq_empresa_cnpj ON empresa (num_cnpj) WHERE num_cnpj IS NOT NULL AND trim(num_cnpj) <> ''`);
    }

    criarTabelasDocumentoLegal(database);
    criarTabelasCadastroPublico(database);
    criarTabelaParametroSistema(database);
    definirVersaoDatabase(database, 15);
}

module.exports = migration015CadastroPublico;
