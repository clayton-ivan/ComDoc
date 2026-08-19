const { colunaExiste, definirVersaoDatabase } = require("../support/databaseStructure");

function migration013IdentidadePdf(database) {
    const colunas = [
        ["nom_arquivo_capa", "TEXT"],
        ["fg_usar_capa_propria", "INTEGER NOT NULL DEFAULT 0 CHECK (fg_usar_capa_propria IN (0, 1))"],
        ["fg_logo_marca_dagua", "INTEGER NOT NULL DEFAULT 0 CHECK (fg_logo_marca_dagua IN (0, 1))"]
    ];
    colunas.forEach(([nome, definicao]) => {
        if (!colunaExiste(database, "empresa", nome)) {
            database.exec(`ALTER TABLE empresa ADD COLUMN ${nome} ${definicao};`);
        }
    });
    definirVersaoDatabase(database, 13);
}

module.exports = migration013IdentidadePdf;
