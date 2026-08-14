const { criarTabelaUsuario } = require("../schema/usuarioSchema");
const { definirVersaoDatabase } = require("../support/databaseStructure");

function migration011Usuarios(database) {
    criarTabelaUsuario(database);
    definirVersaoDatabase(database, 11);
}

module.exports = migration011Usuarios;
