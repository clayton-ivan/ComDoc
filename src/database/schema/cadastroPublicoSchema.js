function criarTabelasCadastroPublico(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS aceite_documento_legal (
            id_aceite_documento_legal INTEGER PRIMARY KEY AUTOINCREMENT,
            id_empresa INTEGER NOT NULL,
            id_usuario INTEGER NOT NULL,
            id_documento_legal_versao INTEGER NOT NULL,
            dt_aceite TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            end_ip TEXT,
            dsc_agente_usuario TEXT,
            id_requisicao TEXT,
            FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON DELETE RESTRICT,
            FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE RESTRICT,
            FOREIGN KEY (id_documento_legal_versao) REFERENCES documento_legal_versao (id_documento_legal_versao) ON DELETE RESTRICT,
            UNIQUE (id_usuario, id_documento_legal_versao)
        ) STRICT;

        CREATE TABLE IF NOT EXISTS ativacao_empresa (
            id_ativacao_empresa INTEGER PRIMARY KEY AUTOINCREMENT,
            id_empresa INTEGER NOT NULL,
            id_usuario_admin INTEGER NOT NULL,
            id_ativacao_anterior INTEGER,
            end_email_destino TEXT NOT NULL,
            cod_token_hash TEXT NOT NULL UNIQUE,
            dt_expiracao TEXT NOT NULL,
            dt_utilizacao TEXT,
            dt_invalidacao TEXT,
            sg_motivo_invalidacao TEXT,
            end_ip_solicitacao TEXT,
            dsc_agente_usuario TEXT,
            id_requisicao TEXT,
            dt_criacao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON DELETE RESTRICT,
            FOREIGN KEY (id_usuario_admin) REFERENCES usuario (id_usuario) ON DELETE RESTRICT,
            FOREIGN KEY (id_ativacao_anterior) REFERENCES ativacao_empresa (id_ativacao_empresa) ON DELETE SET NULL
        ) STRICT;

        CREATE INDEX IF NOT EXISTS idx_ativacao_empresa_usuario_data
        ON ativacao_empresa (id_usuario_admin, dt_criacao DESC);

        CREATE TABLE IF NOT EXISTS auditoria (
            id_auditoria INTEGER PRIMARY KEY AUTOINCREMENT,
            id_empresa INTEGER,
            id_usuario INTEGER,
            sg_acao TEXT NOT NULL,
            sg_recurso TEXT,
            cod_recurso TEXT,
            dsc_dados TEXT,
            end_ip TEXT,
            dsc_agente_usuario TEXT,
            id_requisicao TEXT,
            dt_auditoria TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON DELETE SET NULL,
            FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE SET NULL
        ) STRICT;

        CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_data
        ON auditoria (id_empresa, dt_auditoria DESC);
        CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_data
        ON auditoria (id_usuario, dt_auditoria DESC);
        CREATE INDEX IF NOT EXISTS idx_auditoria_acao_data
        ON auditoria (sg_acao, dt_auditoria DESC);
    `);
}

module.exports = { criarTabelasCadastroPublico };
