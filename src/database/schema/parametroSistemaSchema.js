const { PARAMETROS_SISTEMA } = require("../../constants/systemParameters");

function criarTabelaParametroSistema(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS parametro_sistema (
            id_parametro INTEGER PRIMARY KEY AUTOINCREMENT,
            cod_parametro TEXT NOT NULL UNIQUE,
            vlr_parametro TEXT NOT NULL,
            dt_criacao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            dt_edicao TEXT,
            id_usu_edicao INTEGER,
            FOREIGN KEY (id_usu_edicao) REFERENCES usuario (id_usuario) ON DELETE SET NULL
        ) STRICT;
    `);

    const inserir = database.prepare(`
        INSERT OR IGNORE INTO parametro_sistema (cod_parametro, vlr_parametro)
        VALUES (?, ?)
    `);

    PARAMETROS_SISTEMA.forEach((parametro) => {
        inserir.run(parametro.codigo, String(Number.isInteger(parametro.valorPadrao)
            ? parametro.valorPadrao
            : Number(Boolean(parametro.valorPadrao))));
    });
}

module.exports = { criarTabelaParametroSistema };
