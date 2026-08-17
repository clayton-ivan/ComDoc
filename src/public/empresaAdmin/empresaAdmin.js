const PALETA = [
    "#F36B21", "#DC2626", "#DB2777", "#7C3AED", "#2563EB",
    "#0891B2", "#059669", "#65A30D", "#CA8A04", "#1F2937"
];

const DURACAO_TRANSICAO = 220;
const form = document.getElementById("formEmpresa");
const navegacaoEmpresa = document.getElementById("navegacaoEmpresa");
const menuSecoes = document.getElementById("menuSecoes");
const mensagemPagina = document.getElementById("mensagemPagina");
const aviso = document.getElementById("aviso");
const imagemLogo = document.getElementById("imagemLogo");
const semLogo = document.getElementById("semLogo");
const arquivoLogo = document.getElementById("arquivoLogo");
const campoCnpj = document.getElementById("cnpj");
const camposTelefone = [
    document.getElementById("telefone"),
    document.getElementById("whatsapp")
];

let empresaAtual = null;
let sessaoAtual = null;
let secaoAtiva = null;
let logoPendente = null;
let urlPreviewLogo = null;
let condicoesAtuais = {
    prazosEntrega: [],
    formasPagamento: []
};

function aguardarTransicao() {
    return new Promise((resolve) =>
        window.setTimeout(resolve, DURACAO_TRANSICAO)
    );
}

function limparAnimacoes(elemento) {
    elemento.classList.remove(
        "saindo-esquerda",
        "entrando-direita",
        "saindo-direita",
        "entrando-esquerda"
    );
}

async function abrirSecao(nomeSecao) {
    const secao = document.querySelector(`[data-secao="${nomeSecao}"]`);

    if (!secao || secaoAtiva) {
        return;
    }

    restaurarDadosDaTela();
    secaoAtiva = nomeSecao;
    menuSecoes.classList.add("saindo-esquerda");
    await aguardarTransicao();
    menuSecoes.hidden = true;
    limparAnimacoes(menuSecoes);
    secao.hidden = false;
    secao.classList.add("entrando-direita");
    secao.querySelector("h1")?.focus?.();
}

async function voltarAoMenu() {
    if (!secaoAtiva) {
        return;
    }

    const secao = document.querySelector(`[data-secao="${secaoAtiva}"]`);
    secao.classList.remove("entrando-direita");
    secao.classList.add("saindo-direita");
    await aguardarTransicao();
    secao.hidden = true;
    limparAnimacoes(secao);
    secaoAtiva = null;
    menuSecoes.hidden = false;
    menuSecoes.classList.add("entrando-esquerda");
}

function formatarCnpj(valor) {
    const digitos = String(valor || "").replace(/\D/g, "").slice(0, 14);

    return digitos
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\/\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor) {
    const digitos = String(valor || "").replace(/\D/g, "").slice(0, 11);

    if (digitos.length <= 2) {
        return digitos ? `(${digitos}` : "";
    }

    if (digitos.length <= 6) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }

    const inicioHifen = digitos.length === 11 ? 7 : 6;

    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, inicioHifen)}-${digitos.slice(inicioHifen)}`;
}

function mostrarAviso(mensagem, erro = false) {
    aviso.textContent = mensagem;
    aviso.classList.toggle("erro", erro);
    aviso.classList.add("visivel");
    window.setTimeout(() => aviso.classList.remove("visivel"), 6000);
}

async function requisitar(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(dados?.mensagem || "Erro na requisição.");
    }

    return dados;
}

function hexadecimalParaRgb(hexadecimal) {
    return [1, 3, 5].map((inicio) =>
        Number.parseInt(hexadecimal.slice(inicio, inicio + 2), 16)
    );
}

function rgbParaHexadecimal(valores) {
    return `#${valores.map((valor) =>
        Math.max(0, Math.min(255, Number(valor) || 0))
            .toString(16).padStart(2, "0")
    ).join("")}`.toUpperCase();
}

function criarEditorCor(fieldset) {
    const campo = fieldset.dataset.campo;
    fieldset.insertAdjacentHTML("beforeend", `
        <div class="paleta"></div>
        <div class="linha-cor">
            <input class="seletor" type="color" aria-label="Seletor de cor">
            <label>Hexadecimal<input class="hex" maxlength="7" pattern="#[0-9A-Fa-f]{6}" required></label>
        </div>
        <div class="rgb">
            <label>R<input class="r" type="number" min="0" max="255"></label>
            <label>G<input class="g" type="number" min="0" max="255"></label>
            <label>B<input class="b" type="number" min="0" max="255"></label>
        </div>
    `);

    const paleta = fieldset.querySelector(".paleta");
    const seletor = fieldset.querySelector(".seletor");
    const hex = fieldset.querySelector(".hex");
    const rgb = ["r", "g", "b"].map((classe) => fieldset.querySelector(`.${classe}`));

    function definir(cor) {
        const normalizada = cor.toUpperCase();
        seletor.value = normalizada;
        hex.value = normalizada;
        hexadecimalParaRgb(normalizada).forEach((valor, indice) => {
            rgb[indice].value = valor;
        });
        paleta.querySelectorAll("button").forEach((botao) =>
            botao.classList.toggle("selecionada", botao.dataset.cor === normalizada)
        );
    }

    PALETA.forEach((cor) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "amostra-cor";
        botao.dataset.cor = cor;
        botao.title = cor;
        botao.style.backgroundColor = cor;
        botao.addEventListener("click", () => definir(cor));
        paleta.appendChild(botao);
    });

    seletor.addEventListener("input", () => definir(seletor.value));
    hex.addEventListener("change", () => {
        if (/^#[0-9a-f]{6}$/i.test(hex.value)) {
            definir(hex.value);
        }
    });
    rgb.forEach((input) => input.addEventListener("input", () =>
        definir(rgbParaHexadecimal(rgb.map((campoRgb) => campoRgb.value)))
    ));

    return { campo, definir, obter: () => hex.value.toUpperCase() };
}

const editoresCor = Array.from(document.querySelectorAll(".editor-cor"))
    .map(criarEditorCor);

function criarEditorLista(elemento) {
    const campo = elemento.querySelector("input");
    const lista = elemento.querySelector(".lista-opcoes");
    const mensagemVazia = elemento.querySelector(".lista-vazia");
    let registros = [];

    function ordenar() {
        registros.sort((a, b) =>
            a.descricao.localeCompare(b.descricao, "pt-BR", { sensitivity: "base" })
        );
    }

    function renderizar() {
        ordenar();
        lista.replaceChildren();
        mensagemVazia.hidden = registros.length > 0;

        registros.forEach((registro, indice) => {
            const item = document.createElement("li");
            const descricao = document.createElement("span");
            const botaoExcluir = document.createElement("button");

            descricao.textContent = registro.descricao;
            botaoExcluir.type = "button";
            botaoExcluir.textContent = "−";
            botaoExcluir.setAttribute("aria-label", `Excluir ${registro.descricao}`);
            botaoExcluir.addEventListener("click", () => {
                registros.splice(indice, 1);
                renderizar();
            });

            item.append(descricao, botaoExcluir);
            lista.appendChild(item);
        });
    }

    function adicionar() {
        const descricao = campo.value.trim();

        if (!descricao) {
            campo.focus();
            return;
        }

        const existe = registros.some((registro) =>
            registro.descricao.localeCompare(
                descricao,
                "pt-BR",
                { sensitivity: "base" }
            ) === 0
        );

        if (!existe) {
            registros.push({ descricao });
        }

        campo.value = "";
        renderizar();
        campo.focus();
    }

    elemento.querySelector(".adicionar-opcao").addEventListener("click", adicionar);
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            adicionar();
        }
    });

    return {
        tipo: elemento.dataset.tipo,
        definir(novosRegistros) {
            registros = novosRegistros.map((registro) => ({ ...registro }));
            campo.value = "";
            renderizar();
        },
        obterDescricoes() {
            ordenar();
            return registros.map((registro) => registro.descricao);
        }
    };
}

const editoresLista = Array.from(document.querySelectorAll(".editor-lista"))
    .map(criarEditorLista);

function valor(id) {
    return document.getElementById(id).value.trim();
}

function preencher(id, valorCampo) {
    document.getElementById(id).value = valorCampo || "";
}

function revogarPreviewLogo() {
    if (urlPreviewLogo) {
        URL.revokeObjectURL(urlPreviewLogo);
        urlPreviewLogo = null;
    }
}

function exibirLogo(url) {
    imagemLogo.hidden = !url;
    semLogo.hidden = Boolean(url);
    imagemLogo.removeAttribute("src");

    if (url) {
        imagemLogo.src = url;
    }
}

function restaurarLogo() {
    revogarPreviewLogo();
    logoPendente = null;
    arquivoLogo.value = "";
    exibirLogo(
        empresaAtual?.logoUrl
            ? `${empresaAtual.logoUrl}?v=${Date.now()}`
            : null
    );
    document.getElementById("excluirLogo").disabled = !empresaAtual?.logoUrl;
}

function preencherEmpresa(empresa) {
    empresaAtual = empresa;
    [
        "nome", "nomeFantasia", "cnpj", "email", "telefone", "whatsapp",
        "logradouro", "numeroEndereco", "complemento", "bairro", "cidade",
        "uf", "cep", "site", "instagram", "slogan"
    ].forEach((campo) => preencher(campo, empresa[campo]));

    campoCnpj.value = formatarCnpj(empresa.cnpj);
    camposTelefone.forEach((campo) => {
        campo.value = formatarTelefone(empresa[campo.id]);
    });
    editoresCor.forEach((editor) => editor.definir(empresa[editor.campo]));
    document.getElementById("empresaAtiva").checked = empresa.ativo;
    const admin = empresa.administrador;
    preencher("adminNome", admin?.nome);
    preencher("adminEmail", admin?.email);
    preencher("adminUltimoLogin", admin?.ultimoLogin
        ? new Date(admin.ultimoLogin).toLocaleString("pt-BR")
        : "Nenhum acesso");
    preencher("adminBloqueio", admin?.bloqueadoAte
        ? new Date(admin.bloqueadoAte).toLocaleString("pt-BR")
        : "Sem bloqueio");
    document.getElementById("adminTrocarSenha").checked = Boolean(admin?.trocarSenha);
    document.getElementById("adminNovaSenha").value = "";
    restaurarLogo();
}

function preencherCondicoes(condicoes) {
    condicoesAtuais = {
        prazosEntrega: condicoes.prazosEntrega.map((item) => ({ ...item })),
        formasPagamento: condicoes.formasPagamento.map((item) => ({ ...item }))
    };

    editoresLista.find((editor) => editor.tipo === "prazos-entrega")
        .definir(condicoesAtuais.prazosEntrega);
    editoresLista.find((editor) => editor.tipo === "formas-pagamento")
        .definir(condicoesAtuais.formasPagamento);
}

function restaurarDadosDaTela() {
    preencherEmpresa(empresaAtual);
    preencherCondicoes(condicoesAtuais);
}

function montarDadosEmpresa() {
    const corpo = {};

    [
        "nome", "nomeFantasia", "cnpj", "email", "telefone", "whatsapp",
        "logradouro", "numeroEndereco", "complemento", "bairro", "cidade",
        "uf", "cep", "site", "instagram", "slogan"
    ].forEach((campo) => {
        corpo[campo] = valor(campo);
    });
    editoresCor.forEach((editor) => {
        corpo[editor.campo] = editor.obter();
    });
    if (sessaoAtual?.usuario.perfil === "SUPER") {
        corpo.ativo = document.getElementById("empresaAtiva").checked;
    }

    return corpo;
}

function validarSecao(secao) {
    const campos = Array.from(secao.querySelectorAll("input"));
    const invalido = campos.find((campo) => !campo.checkValidity());

    if (invalido) {
        invalido.reportValidity();
        return false;
    }

    return true;
}

async function salvarDadosEmpresa() {
    const resultado = await requisitar("/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarDadosEmpresa())
    });
    preencherEmpresa(resultado.empresa);
}

async function salvarLogo() {
    if (logoPendente === "excluir") {
        const resultado = await requisitar("/empresa/logo", { method: "DELETE" });
        preencherEmpresa(resultado.empresa);
        return;
    }

    if (logoPendente instanceof File) {
        const dados = new FormData();
        dados.append("logo", logoPendente);
        const resultado = await requisitar("/empresa/logo", {
            method: "POST",
            body: dados
        });
        preencherEmpresa(resultado.empresa);
    }
}

async function salvarCondicoes() {
    const prazos = editoresLista.find((editor) => editor.tipo === "prazos-entrega");
    const formas = editoresLista.find((editor) => editor.tipo === "formas-pagamento");
    const resultado = await requisitar("/empresa/condicoes-comerciais", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prazosEntrega: prazos.obterDescricoes(),
            formasPagamento: formas.obterDescricoes()
        })
    });
    preencherCondicoes(resultado);
}

async function salvarAdministrador() {
    const resultado = await requisitar("/empresa/administrador", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: valor("adminNome"),
            email: valor("adminEmail"),
            trocarSenha: document.getElementById("adminTrocarSenha").checked,
            senha: valor("adminNovaSenha")
        })
    });
    empresaAtual.administrador = resultado.administrador;
    preencherEmpresa(empresaAtual);
}

async function carregarCadastroInicial() {
    sessaoAtual = await requisitar("/auth/sessao");
    if (sessaoAtual.usuario.perfil !== "SUPER") {
        location.href = "/";
        return;
    }
    mensagemPagina.hidden = true;
    document.getElementById("cadastroInicial").hidden = false;
}

async function carregar() {
    if (new URLSearchParams(location.search).get("nova") === "1") {
        await carregarCadastroInicial();
        return;
    }
    const [sessao, empresa, prazosEntrega, formasPagamento] = await Promise.all([
        requisitar("/auth/sessao"),
        requisitar("/empresa"),
        requisitar("/empresa/prazos-entrega"),
        requisitar("/empresa/formas-pagamento")
    ]);

    sessaoAtual = sessao;
    preencherEmpresa(empresa);
    const superUsuario = sessao.usuario.perfil === "SUPER";
    document.getElementById("abrirAdministrador").hidden = !superUsuario;
    document.getElementById("campoEmpresaAtiva").hidden = false;
    document.getElementById("empresaAtiva").disabled = !superUsuario;
    preencherCondicoes({ prazosEntrega, formasPagamento });
    mensagemPagina.hidden = true;
    navegacaoEmpresa.hidden = false;
}

campoCnpj.addEventListener("input", () => {
    campoCnpj.value = formatarCnpj(campoCnpj.value);
});

camposTelefone.forEach((campo) => {
    campo.addEventListener("input", () => {
        campo.value = formatarTelefone(campo.value);
    });
});

arquivoLogo.addEventListener("change", () => {
    const arquivo = arquivoLogo.files[0];

    if (!arquivo) {
        restaurarLogo();
        return;
    }

    if (!["image/jpeg", "image/png"].includes(arquivo.type)) {
        arquivoLogo.value = "";
        mostrarAviso("A logo deve estar no formato JPEG ou PNG.", true);
        return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
        arquivoLogo.value = "";
        mostrarAviso("A logo deve possuir no máximo 5 MB.", true);
        return;
    }

    revogarPreviewLogo();
    logoPendente = arquivo;
    urlPreviewLogo = URL.createObjectURL(arquivo);
    exibirLogo(urlPreviewLogo);
    document.getElementById("excluirLogo").disabled = false;
});

document.getElementById("excluirLogo").addEventListener("click", () => {
    revogarPreviewLogo();
    logoPendente = "excluir";
    arquivoLogo.value = "";
    exibirLogo(null);
    document.getElementById("excluirLogo").disabled = true;
});

document.getElementById("novoCnpj").addEventListener("input", (evento) => {
    evento.target.value = formatarCnpj(evento.target.value);
});

document.getElementById("formCadastroInicial").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const botao = evento.submitter;
    botao.disabled = true;
    try {
        const resultado = await requisitar("/empresas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                empresa: {
                    nome: valor("novaNome"),
                    nomeFantasia: valor("novaNomeFantasia"),
                    cnpj: valor("novoCnpj"),
                    email: valor("novoEmailEmpresa")
                },
                administrador: {
                    nome: valor("novoAdminNome"),
                    email: valor("novoAdminEmail"),
                    senha: valor("novoAdminSenha")
                }
            })
        });
        await requisitar("/auth/selecionar-empresa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idEmpresa: resultado.empresa.id })
        });
        location.href = "/admin/empresa";
    } catch (erro) {
        mostrarAviso(erro.message, true);
        botao.disabled = false;
    }
});

document.getElementById("redefinirSenhaAdmin").addEventListener("click", async (evento) => {
    const senha = valor("adminNovaSenha");
    if (!senha) {
        document.getElementById("adminNovaSenha").focus();
        return;
    }
    evento.currentTarget.disabled = true;
    try {
        const resultado = await requisitar("/empresa/administrador/senha", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha })
        });
        empresaAtual.administrador = resultado.administrador;
        preencherEmpresa(empresaAtual);
        mostrarAviso("Senha redefinida. A troca será exigida no próximo acesso.");
    } catch (erro) {
        mostrarAviso(erro.message, true);
    } finally {
        evento.currentTarget.disabled = false;
    }
});

document.querySelectorAll("[data-abrir-secao]").forEach((botao) => {
    botao.addEventListener("click", () => abrirSecao(botao.dataset.abrirSecao));
});

document.querySelectorAll("[data-voltar]").forEach((botao) => {
    botao.addEventListener("click", async () => {
        restaurarDadosDaTela();
        await voltarAoMenu();
    });
});

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const botaoSalvar = evento.submitter;
    const nomeSecao = botaoSalvar?.dataset.salvarSecao;
    const secao = document.querySelector(`[data-secao="${nomeSecao}"]`);

    if (!secao || !validarSecao(secao)) {
        return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        if (nomeSecao === "logo") {
            await salvarLogo();
        } else if (nomeSecao === "condicoesComerciais") {
            await salvarCondicoes();
        } else if (nomeSecao === "administrador") {
            await salvarAdministrador();
        } else {
            await salvarDadosEmpresa();
        }

        await voltarAoMenu();
        mostrarAviso("Dados salvos com sucesso.");
    } catch (erro) {
        mostrarAviso(erro.message, true);
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar";
    }
});

carregar().catch((erro) => {
    mensagemPagina.textContent = erro.message;
    mensagemPagina.classList.add("erro");
});
