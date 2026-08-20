const { criarTabelaParametroSistema } = require("../schema/parametroSistemaSchema");
const { definirVersaoDatabase } = require("../support/databaseStructure");

function migration014ParametrosSistema(database) {
    criarTabelaParametroSistema(database);
    definirVersaoDatabase(database, 14);
}

module.exports = migration014ParametrosSistema;
