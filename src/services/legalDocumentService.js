const repository = require('../repositories/legalDocumentRepository');
const db = require('../database/databaseRepository');
const audit = require('../repositories/auditRepository');
const sanitizeHtml = require('sanitize-html');

function higienizarHtml(valor) {
    const html = sanitizeHtml(String(valor || '').trim(), {
        allowedTags: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
            'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a'
        ],
        allowedAttributes: { a: ['href', 'target', 'rel'] },
        allowedSchemes: ['http', 'https', 'mailto'],
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
        }
    });
    if (!html.replace(/<[^>]+>/g, '').trim()) throw new Error('O conteúdo do documento é obrigatório.');
    return html;
}

function listar() { return repository.listar(); }
function vigentesPublicos() {
    return ['TERMOS_USO', 'POLITICA_PRIVACIDADE']
        .map(repository.buscarVigente).filter(Boolean);
}

function criar(dados, contexto) {
    const idDocumento = Number(dados.idDocumento);
    const versao = String(dados.versao || '').trim();
    if (!Number.isInteger(idDocumento) || idDocumento <= 0) throw new Error('Documento inválido.');
    if (!versao) throw new Error('Informe a versão.');
    const criada = repository.criarVersao(idDocumento, versao, higienizarHtml(dados.conteudo), contexto.idUsuario);
    audit.registrar({ ...contexto, acao: 'CRIAR', recurso: 'DOCUMENTO_LEGAL_VERSAO', codigo: criada.idVersao });
    return criada;
}

function atualizar(id, dados, contexto) {
    const existente = repository.buscarVersao(Number(id));
    if (!existente) return null;
    if (existente.publicadaEm) throw new Error('Uma versão publicada não pode ser alterada.');
    const versao = String(dados.versao || '').trim();
    if (!versao) throw new Error('Informe a versão.');
    const atualizada = repository.atualizarVersao(existente.idVersao, versao, higienizarHtml(dados.conteudo), contexto.idUsuario);
    audit.registrar({ ...contexto, acao: 'ALTERAR', recurso: 'DOCUMENTO_LEGAL_VERSAO', codigo: id });
    return atualizada;
}

function publicar(id, contexto) {
    const existente = repository.buscarVersao(Number(id));
    if (!existente) return null;
    if (existente.publicadaEm) throw new Error('Esta versão já foi publicada.');
    const publicada = db.executarTransacaoImediata(() => repository.publicar(existente.idVersao, existente.idDocumento, contexto.idUsuario));
    audit.registrar({ ...contexto, acao: 'PUBLICAR', recurso: 'DOCUMENTO_LEGAL_VERSAO', codigo: id });
    return publicada;
}

module.exports = { listar, vigentesPublicos, criar, atualizar, publicar };
