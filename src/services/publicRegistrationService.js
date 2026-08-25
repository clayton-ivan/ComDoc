const crypto = require('node:crypto');
const db = require('../database/databaseRepository');
const companyRepository = require('../repositories/companyRepository');
const userRepository = require('../repositories/userRepository');
const legalRepository = require('../repositories/legalDocumentRepository');
const registrationRepository = require('../repositories/publicRegistrationRepository');
const audit = require('../repositories/auditRepository');
const passwordService = require('./passwordService');
const parameters = require('./systemParameterService');
const emailService = require('./emailService');
const config = require('../config/environment');
const { validarCnpj } = require('../util/validators');

const texto = (v) => String(v ?? '').trim();
const digitos = (v) => texto(v).replace(/\D/g, '');
const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function normalizar(dados = {}) {
    const e = dados.empresa || {};
    const a = dados.administrador || {};
    const empresa = {
        nome: texto(e.nome), nomeFantasia: texto(e.nomeFantasia), cnpj: digitos(e.cnpj),
        email: texto(e.email).toLowerCase(), telefone: digitos(e.telefone), whatsapp: digitos(e.whatsapp),
        logradouro: texto(e.logradouro), numeroEndereco: texto(e.numeroEndereco), complemento: texto(e.complemento),
        bairro: texto(e.bairro), cidade: texto(e.cidade), uf: texto(e.uf).toUpperCase(), cep: digitos(e.cep),
        site: '', instagram: '', slogan: '', corPrimaria: '#F36B21', corSecundaria: '#1F2937',
        ativo: !parameters.obter('FG_EXIGIR_ATIVACAO_EMAIL_NOVOS_CADASTROS'),
        origemCadastro: 'PUBLICO', usuarioEdicao: 'CADASTRO_PUBLICO'
    };
    const admin = { nome: texto(a.nome), email: texto(a.email).toLowerCase(), senha: String(a.senha || '') };
    const obrigatorios = [[empresa.nome, 'A razão social'], [empresa.nomeFantasia, 'O nome fantasia'],
        [empresa.cnpj, 'O CNPJ'], [empresa.email, 'O e-mail da empresa'], [empresa.logradouro, 'O logradouro'],
        [empresa.numeroEndereco, 'O número'], [empresa.bairro, 'O bairro'], [empresa.cidade, 'A cidade'],
        [empresa.uf, 'A UF'], [empresa.cep, 'O CEP'], [admin.nome, 'O nome do administrador'],
        [admin.email, 'O e-mail do administrador']];
    const ausente = obrigatorios.find(([valor]) => !valor);
    if (ausente) throw new Error(`Campo obrigatório: ${ausente[1]}.`);
    validarCnpj(empresa.cnpj);
    if (!emailValido(empresa.email) || !emailValido(admin.email)) throw new Error('Informe endereços de e-mail válidos.');
    if (!/^[A-Z]{2}$/.test(empresa.uf)) throw new Error('A UF deve possuir duas letras.');
    if (empresa.cep.length !== 8) throw new Error('O CEP deve possuir 8 dígitos.');
    if (empresa.telefone && !/^\d{10,11}$/.test(empresa.telefone)) throw new Error('O telefone deve possuir 10 ou 11 dígitos.');
    if (empresa.whatsapp && !/^\d{10,11}$/.test(empresa.whatsapp)) throw new Error('O WhatsApp deve possuir 10 ou 11 dígitos.');
    passwordService.validarFormato(admin.senha);
    if (dados.aceitouTermos !== true || dados.aceitouPrivacidade !== true) {
        throw new Error('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
    }
    return { empresa, admin };
}

function urlAtivacao(token) {
    const base = config.urlPublica?.origin || `http://localhost:${config.porta}`;
    return `${base}/confirmar-email?token=${encodeURIComponent(token)}`;
}

function criarToken() {
    const token = crypto.randomBytes(32).toString('base64url');
    return { token, hash: crypto.createHash('sha256').update(token).digest('hex') };
}

async function cadastrar(dados, ctx) {
    const { empresa, admin } = normalizar(dados);
    if (companyRepository.buscarPorCnpj(empresa.cnpj)) throw new Error('Já existe uma empresa com este CNPJ.');
    if (companyRepository.buscarPorEmail(empresa.email)) throw new Error('Já existe uma empresa com este e-mail.');
    if (userRepository.buscarPorEmail(admin.email)) throw new Error('Já existe um usuário com este e-mail.');
    const termos = legalRepository.buscarVigente('TERMOS_USO');
    const privacidade = legalRepository.buscarVigente('POLITICA_PRIVACIDADE');
    if (!termos || !privacidade) throw new Error('O cadastro está temporariamente indisponível: documentos legais não publicados.');
    const senhaHash = await passwordService.criarHash(admin.senha);
    const exigirEmail = parameters.obter('FG_EXIGIR_ATIVACAO_EMAIL_NOVOS_CADASTROS');
    let resultado;
    let ativacao;
    resultado = db.executarTransacaoImediata(() => {
        const criada = companyRepository.criar(empresa);
        const usuario = userRepository.criar({ idEmpresa: criada.id, nome: admin.nome, email: admin.email,
            senhaHash, perfil: 'ADMIN', ativo: !exigirEmail, trocarSenha: false, emailConfirmado: !exigirEmail }, null);
        registrationRepository.registrarAceite(criada.id, usuario.idUsuario, termos.idVersao, ctx);
        registrationRepository.registrarAceite(criada.id, usuario.idUsuario, privacidade.idVersao, ctx);
        if (exigirEmail) {
            const token = criarToken();
            const expiracao = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            registrationRepository.criarAtivacao({ idEmpresa: criada.id, idUsuario: usuario.idUsuario,
                email: admin.email, tokenHash: token.hash, expiracao, ...ctx });
            ativacao = { token: token.token, email: admin.email, nome: admin.nome };
        }
        audit.registrar({ idEmpresa: criada.id, idUsuario: usuario.idUsuario, acao: 'CRIAR',
            recurso: 'CADASTRO_PUBLICO', codigo: criada.id, dados: { exigeAtivacaoEmail: exigirEmail }, ...ctx });
        return { empresa: criada, usuario };
    });
    if (ativacao) await emailService.enviarAtivacao({ ...ativacao, link: urlAtivacao(ativacao.token) });
    return { exigeAtivacaoEmail: exigirEmail, email: resultado.usuario.email };
}

async function confirmar(token, ctx) {
    const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
    const registro = registrationRepository.buscarPorHash(hash);
    if (!registro || registro.dt_utilizacao || registro.dt_invalidacao) throw new Error('O link de ativação é inválido ou já foi utilizado.');
    if (Date.parse(registro.dt_expiracao) <= Date.now()) {
        registrationRepository.invalidar(registro.id_ativacao_empresa, 'EXPIRADO');
        throw new Error('O link de ativação expirou. Solicite um novo e-mail.');
    }
    db.executarTransacaoImediata(() => {
        registrationRepository.utilizar(registro.id_ativacao_empresa);
        companyRepository.ativar(registro.id_empresa);
        userRepository.confirmarEmailEAtivar(registro.id_usuario_admin);
        audit.registrar({ idEmpresa: registro.id_empresa, idUsuario: registro.id_usuario_admin,
            acao: 'CONFIRMAR_EMAIL', recurso: 'CADASTRO_PUBLICO', codigo: registro.id_empresa, ...ctx });
    });
}

async function reenviar(email, ctx) {
    const cadastro = registrationRepository.buscarCadastroPorEmail(texto(email).toLowerCase());
    if (!cadastro || cadastro.fg_email_confirmado || cadastro.fg_status) return;
    const ultima = registrationRepository.ultimaPorUsuario(cadastro.id_usuario);
    if (ultima && Date.now() - Date.parse(ultima.dt_criacao) < 2 * 60 * 1000) {
        throw new Error('Aguarde dois minutos antes de solicitar outro e-mail.');
    }
    if (registrationRepository.quantidadeUltimaHora(cadastro.id_usuario) >= 5) {
        throw new Error('Limite de reenvios atingido. Tente novamente mais tarde.');
    }
    const token = criarToken();
    const idAtivacao = db.executarTransacaoImediata(() => {
        if (ultima) registrationRepository.invalidar(ultima.id_ativacao_empresa, 'REENVIO');
        return registrationRepository.criarAtivacao({ idEmpresa: cadastro.id_empresa,
            idUsuario: cadastro.id_usuario, idAnterior: ultima?.id_ativacao_empresa,
            email: cadastro.end_email, tokenHash: token.hash,
            expiracao: new Date(Date.now() + 60 * 60 * 1000).toISOString(), ...ctx });
    });
    await emailService.enviarAtivacao({ email: cadastro.end_email, nome: 'administrador', link: urlAtivacao(token.token) });
    audit.registrar({ idEmpresa: cadastro.id_empresa, idUsuario: cadastro.id_usuario,
        acao: 'REENVIAR_EMAIL', recurso: 'ATIVACAO_EMPRESA', codigo: idAtivacao, ...ctx });
}

module.exports = { cadastrar, confirmar, reenviar };
