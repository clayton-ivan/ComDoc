const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('./loggerService');

let transportador;
function obterTransportador() {
    if (!transportador) {
        transportador = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.porta,
            secure: config.email.seguro,
            auth: { user: config.email.usuario, pass: config.email.senha }
        });
    }
    return transportador;
}

async function enviarAtivacao({ email, nome, link }) {
    if (config.email.modo === 'console') {
        logger.info('E-mail de ativação simulado', { destinatario: email, linkAtivacao: link });
        return;
    }
    await obterTransportador().sendMail({
        from: config.email.remetente,
        replyTo: config.email.responderPara || undefined,
        to: email,
        subject: 'Confirme seu cadastro no ComDoc',
        text: `Olá, ${nome}. Confirme seu cadastro no ComDoc pelo link abaixo. Ele expira em 1 hora:\n\n${link}`,
        html: `<p>Olá, ${String(nome).replace(/[<>&]/g, '')}.</p><p>Confirme seu cadastro no ComDoc pelo link abaixo. Ele expira em 1 hora.</p><p><a href="${link}">Confirmar meu e-mail</a></p>`
    });
}

module.exports = { enviarAtivacao };
