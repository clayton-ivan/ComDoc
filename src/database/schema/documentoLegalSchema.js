function criarTabelasDocumentoLegal(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS documento_legal (
            id_documento_legal INTEGER PRIMARY KEY AUTOINCREMENT,
            sg_tipo TEXT NOT NULL UNIQUE,
            nom_documento TEXT NOT NULL,
            fg_status INTEGER NOT NULL DEFAULT 1 CHECK (fg_status IN (0, 1)),
            dt_criacao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            id_usu_criacao INTEGER,
            dt_edicao TEXT,
            id_usu_edicao INTEGER,
            FOREIGN KEY (id_usu_criacao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_usu_edicao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            CHECK (sg_tipo IN ('TERMOS_USO', 'POLITICA_PRIVACIDADE'))
        ) STRICT;

        CREATE TABLE IF NOT EXISTS documento_legal_versao (
            id_documento_legal_versao INTEGER PRIMARY KEY AUTOINCREMENT,
            id_documento_legal INTEGER NOT NULL,
            num_versao TEXT NOT NULL,
            dsc_conteudo TEXT NOT NULL,
            fg_vigente INTEGER NOT NULL DEFAULT 0 CHECK (fg_vigente IN (0, 1)),
            dt_criacao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            id_usu_criacao INTEGER,
            dt_edicao TEXT,
            id_usu_edicao INTEGER,
            dt_publicacao TEXT,
            id_usu_publicacao INTEGER,
            FOREIGN KEY (id_documento_legal) REFERENCES documento_legal (id_documento_legal) ON DELETE RESTRICT,
            FOREIGN KEY (id_usu_criacao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_usu_edicao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_usu_publicacao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            UNIQUE (id_documento_legal, num_versao),
            CHECK (length(trim(num_versao)) > 0),
            CHECK (length(trim(dsc_conteudo)) > 0)
        ) STRICT;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_documento_legal_versao_vigente
        ON documento_legal_versao (id_documento_legal)
        WHERE fg_vigente = 1;
    `);

    const inserir = database.prepare(`
        INSERT OR IGNORE INTO documento_legal (sg_tipo, nom_documento)
        VALUES (?, ?)
    `);
    inserir.run('TERMOS_USO', 'Termos de Uso');
    inserir.run('POLITICA_PRIVACIDADE', 'Política de Privacidade');
}

module.exports = { criarTabelasDocumentoLegal };
