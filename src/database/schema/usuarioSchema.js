function criarTabelaUsuario(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            id_empresa INTEGER,
            nom_usuario TEXT NOT NULL,
            end_email TEXT NOT NULL COLLATE NOCASE,
            cod_senha_hash TEXT NOT NULL,
            sg_perfil TEXT NOT NULL,
            fg_status INTEGER NOT NULL DEFAULT 1,
            fg_trocar_senha INTEGER NOT NULL DEFAULT 1,
            qtd_tentativas_login INTEGER NOT NULL DEFAULT 0,
            dt_bloqueado_ate TEXT,
            num_versao_sessao INTEGER NOT NULL DEFAULT 1,
            dt_senha_alterada TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            dt_ultimo_login TEXT,
            dt_criacao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            id_usu_criacao INTEGER,
            dt_edicao TEXT,
            id_usu_edicao INTEGER,
            FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON DELETE RESTRICT,
            FOREIGN KEY (id_usu_criacao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_usu_edicao) REFERENCES usuario (id_usuario) ON DELETE SET NULL,
            UNIQUE (end_email),
            CHECK (sg_perfil IN ('SUPER', 'ADMIN', 'VENDEDOR')),
            CHECK (fg_status IN (0, 1)),
            CHECK (fg_trocar_senha IN (0, 1)),
            CHECK (qtd_tentativas_login >= 0),
            CHECK (num_versao_sessao > 0),
            CHECK (
                (sg_perfil = 'SUPER' AND id_empresa IS NULL) OR
                (sg_perfil IN ('ADMIN', 'VENDEDOR') AND id_empresa IS NOT NULL)
            )
        ) STRICT;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_usuario_admin_empresa
        ON usuario (id_empresa)
        WHERE sg_perfil = 'ADMIN' AND fg_status = 1;

        CREATE INDEX IF NOT EXISTS idx_usuario_empresa
        ON usuario (id_empresa, nom_usuario);
    `);
}

module.exports = { criarTabelaUsuario };
