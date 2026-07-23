const campoPesquisa =
    document.getElementById("pesquisaCliente");

const containerClientes =
    document.getElementById("clientes");

const mensagemLista =
    document.getElementById("mensagemLista");

const botaoNovoCliente =
    document.getElementById("botaoNovoCliente");

const dialogCliente =
    document.getElementById("dialogCliente");

const formCliente =
    document.getElementById("formCliente");

const tituloDialog =
    document.getElementById("tituloDialog");

const botaoFecharDialog =
    document.getElementById("botaoFecharDialog");

const botaoCancelar =
    document.getElementById("botaoCancelar");

const botaoSalvar =
    document.getElementById("botaoSalvar");

const campoNomeCliente =
    document.getElementById("nomeCliente");

const campoCpfCliente =
    document.getElementById("cpfCliente");

const campoCnpjCliente =
    document.getElementById("cnpjCliente");

const campoTelefoneCliente =
    document.getElementById("telefoneCliente");

const campoEmailCliente =
    document.getElementById("emailCliente");

const campoLogradouroCliente =
    document.getElementById("logradouroCliente");

const campoNumeroEnderecoCliente =
    document.getElementById("numeroEnderecoCliente");

const campoComplementoCliente =
    document.getElementById("complementoCliente");

const campoCidadeCliente =
    document.getElementById("cidadeCliente");

const campoUfCliente =
    document.getElementById("ufCliente");

let clientes = [];
let idClienteEmEdicao = null;

/*
|--------------------------------------------------------------------------
| Utilitários
|--------------------------------------------------------------------------
*/

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function somenteDigitos(valor) {
    return String(valor ?? "")
        .replace(/\D/g, "");
}

function permitirSomenteInteiros(
    campo,
    quantidadeMaxima = null
) {
    campo.setAttribute("type", "text");
    campo.setAttribute("inputmode", "numeric");

    if (quantidadeMaxima) {
        campo.setAttribute(
            "maxlength",
            String(quantidadeMaxima)
        );
    }

    campo.addEventListener(
        "beforeinput",
        (evento) => {
            const operacaoPermitida =
                evento.inputType.startsWith("delete") ||
                evento.inputType === "insertFromPaste" ||
                evento.inputType === "insertFromDrop";

            if (operacaoPermitida) {
                return;
            }

            if (
                evento.data &&
                !/^\d+$/.test(evento.data)
            ) {
                evento.preventDefault();
            }
        }
    );

    campo.addEventListener("input", () => {
        let valor = somenteDigitos(campo.value);

        if (quantidadeMaxima) {
            valor = valor.slice(
                0,
                quantidadeMaxima
            );
        }

        campo.value = valor;
    });
}

function normalizarTextoPesquisa(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

function formatarCpf(cpf) {
    const digitos = somenteDigitos(cpf);

    if (digitos.length !== 11) {
        return cpf || "";
    }

    return digitos.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );
}

function formatarCnpj(cnpj) {
    const digitos = somenteDigitos(cnpj);

    if (digitos.length !== 14) {
        return cnpj || "";
    }

    return digitos.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
    );
}

function formatarTelefone(telefone) {
    const digitos = somenteDigitos(telefone);

    if (digitos.length === 11) {
        return digitos.replace(
            /(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3"
        );
    }

    if (digitos.length === 10) {
        return digitos.replace(
            /(\d{2})(\d{4})(\d{4})/,
            "($1) $2-$3"
        );
    }

    return telefone || "";
}

function obterDocumentoCliente(cliente) {
    if (cliente.cpf) {
        return `CPF: ${formatarCpf(cliente.cpf)}`;
    }

    if (cliente.cnpj) {
        return `CNPJ: ${formatarCnpj(cliente.cnpj)}`;
    }

    return "Documento não informado";
}

function obterMensagemErro(
    resultado,
    mensagemPadrao
) {
    return (
        resultado?.mensagem ||
        resultado?.erro ||
        mensagemPadrao
    );
}

/*
|--------------------------------------------------------------------------
| Configuração dos campos
|--------------------------------------------------------------------------
*/

permitirSomenteInteiros(
    campoCpfCliente,
    11
);

permitirSomenteInteiros(
    campoCnpjCliente,
    14
);

permitirSomenteInteiros(
    campoTelefoneCliente,
    11
);

permitirSomenteInteiros(
    campoNumeroEnderecoCliente,
    10
);

campoUfCliente.addEventListener(
    "input",
    () => {
        campoUfCliente.value =
            campoUfCliente.value
                .replace(/[^a-zA-Z]/g, "")
                .toUpperCase()
                .slice(0, 2);
    }
);

/*
|--------------------------------------------------------------------------
| Formulário
|--------------------------------------------------------------------------
*/

function limparFormularioCliente() {
    formCliente.reset();
    idClienteEmEdicao = null;
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar";
}

function abrirNovoCliente() {
    limparFormularioCliente();

    tituloDialog.textContent =
        "Novo cliente";

    dialogCliente.showModal();
    dialogCliente.scrollTop = 0;

    campoNomeCliente.focus();
}

async function abrirEdicaoCliente(idCliente) {
    try {
        const resposta = await fetch(
            `/clientes/${encodeURIComponent(idCliente)}`
        );

        let resultado = null;

        try {
            resultado = await resposta.json();
        } catch {
            resultado = null;
        }

        if (!resposta.ok) {
            throw new Error(
                obterMensagemErro(
                    resultado,
                    "Não foi possível carregar o cliente."
                )
            );
        }

        limparFormularioCliente();

        idClienteEmEdicao =
            resultado.idCliente;

        tituloDialog.textContent =
            "Editar cliente";

        campoNomeCliente.value =
            resultado.nome ?? "";

        campoCpfCliente.value =
            resultado.cpf ?? "";

        campoCnpjCliente.value =
            resultado.cnpj ?? "";

        campoTelefoneCliente.value =
            resultado.telefone ?? "";

        campoEmailCliente.value =
            resultado.email ?? "";

        campoLogradouroCliente.value =
            resultado.logradouro ?? "";

        campoNumeroEnderecoCliente.value =
            resultado.numeroEndereco ?? "";

        campoComplementoCliente.value =
            resultado.complemento ?? "";

        campoCidadeCliente.value =
            resultado.cidade ?? "";

        campoUfCliente.value =
            resultado.uf ?? "";

        dialogCliente.showModal();
        dialogCliente.scrollTop = 0;

        campoNomeCliente.focus();
    } catch (erro) {
        console.error(
            "Erro ao abrir cliente:",
            erro
        );

        alert(erro.message);
    }
}

function fecharDialog() {
    dialogCliente.close();
    limparFormularioCliente();
}

function obterClienteFormulario() {
    const numeroEndereco =
        campoNumeroEnderecoCliente.value.trim();

    return {
        nome:
            campoNomeCliente.value.trim(),

        cpf:
            campoCpfCliente.value.trim(),

        cnpj:
            campoCnpjCliente.value.trim(),

        telefone:
            campoTelefoneCliente.value.trim(),

        email:
            campoEmailCliente.value.trim(),

        logradouro:
            campoLogradouroCliente.value.trim(),

        numeroEndereco:
            numeroEndereco
                ? Number(numeroEndereco)
                : null,

        complemento:
            campoComplementoCliente.value.trim(),

        cidade:
            campoCidadeCliente.value.trim(),

        uf:
            campoUfCliente.value
                .trim()
                .toUpperCase()
    };
}

function validarClienteFormulario(cliente) {
    if (!cliente.nome) {
        throw new Error(
            "O nome do cliente é obrigatório."
        );
    }

    if (cliente.cpf && cliente.cnpj) {
        throw new Error(
            "Informe apenas CPF ou CNPJ, não os dois."
        );
    }

    if (
        cliente.cpf &&
        cliente.cpf.length !== 11
    ) {
        throw new Error(
            "O CPF deve possuir exatamente 11 dígitos."
        );
    }

    if (
        cliente.cnpj &&
        cliente.cnpj.length !== 14
    ) {
        throw new Error(
            "O CNPJ deve possuir exatamente 14 dígitos."
        );
    }

    if (
        cliente.telefone &&
        !/^\d{10,11}$/.test(cliente.telefone)
    ) {
        throw new Error(
            "O telefone deve possuir 10 ou 11 dígitos."
        );
    }

    if (
        cliente.uf &&
        !/^[A-Z]{2}$/.test(cliente.uf)
    ) {
        throw new Error(
            "A UF deve possuir exatamente duas letras."
        );
    }
}

async function salvarCliente(evento) {
    evento.preventDefault();

    try {
        const cliente =
            obterClienteFormulario();

        validarClienteFormulario(cliente);

        const estaEditando =
            idClienteEmEdicao !== null;

        const url = estaEditando
            ? `/clientes/${encodeURIComponent(
                idClienteEmEdicao
            )}`
            : "/clientes";

        const metodo = estaEditando
            ? "PUT"
            : "POST";

        botaoSalvar.disabled = true;
        botaoSalvar.textContent =
            estaEditando
                ? "Atualizando..."
                : "Salvando...";

        const resposta = await fetch(
            url,
            {
                method: metodo,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(cliente)
            }
        );

        let resultado = null;

        try {
            resultado = await resposta.json();
        } catch {
            resultado = null;
        }

        if (!resposta.ok) {
            throw new Error(
                obterMensagemErro(
                    resultado,
                    "Não foi possível salvar o cliente."
                )
            );
        }

        fecharDialog();
        await carregarClientes();
    } catch (erro) {
        console.error(
            "Erro ao salvar cliente:",
            erro
        );

        alert(erro.message);

        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar";
    }
}

/*
|--------------------------------------------------------------------------
| Listagem
|--------------------------------------------------------------------------
*/

function renderizarClientes(lista) {
    containerClientes.innerHTML = "";

    if (lista.length === 0) {
        mensagemLista.style.display =
            "block";

        mensagemLista.textContent =
            "Nenhum cliente encontrado.";

        containerClientes.appendChild(
            mensagemLista
        );

        return;
    }

    mensagemLista.style.display = "none";

    lista.forEach((cliente) => {
        const elemento =
            document.createElement("article");

        elemento.className = "cliente";

        const cidadeUf = [
            cliente.cidade,
            cliente.uf
        ]
            .filter(Boolean)
            .join(" - ");

        elemento.innerHTML = `
            <div class="cliente-informacoes">
                <h2>
                    ${escaparHtml(cliente.nome)}
                </h2>

                <div class="cliente-detalhes">
                    <p>
                        ${escaparHtml(
                            obterDocumentoCliente(cliente)
                        )}
                    </p>

                    ${
                        cliente.telefone
                            ? `
                                <p>
                                    Telefone:
                                    ${escaparHtml(
                                        formatarTelefone(
                                            cliente.telefone
                                        )
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${
                        cliente.email
                            ? `
                                <p>
                                    ${escaparHtml(cliente.email)}
                                </p>
                            `
                            : ""
                    }

                    ${
                        cidadeUf
                            ? `
                                <p>
                                    ${escaparHtml(cidadeUf)}
                                </p>
                            `
                            : ""
                    }
                </div>
            </div>

            <div class="acoes-cliente">
                <button
                    class="botao-secundario botao-editar"
                    type="button"
                >
                    Editar
                </button>

                <button
                    class="botao-perigo botao-excluir"
                    type="button"
                >
                    Excluir
                </button>
            </div>
        `;

        elemento
            .querySelector(".botao-editar")
            .addEventListener(
                "click",
                () => {
                    abrirEdicaoCliente(
                        cliente.idCliente
                    );
                }
            );

        elemento
            .querySelector(".botao-excluir")
            .addEventListener(
                "click",
                () => {
                    excluirCliente(cliente);
                }
            );

        containerClientes.appendChild(
            elemento
        );
    });
}

async function carregarClientes() {
    containerClientes.innerHTML = "";

    mensagemLista.style.display = "block";
    mensagemLista.textContent =
        "Carregando clientes...";

    containerClientes.appendChild(
        mensagemLista
    );

    try {
        const resposta =
            await fetch("/clientes");

        let resultado = null;

        try {
            resultado = await resposta.json();
        } catch {
            resultado = null;
        }

        if (!resposta.ok) {
            throw new Error(
                obterMensagemErro(
                    resultado,
                    "Não foi possível carregar os clientes."
                )
            );
        }

        clientes = Array.isArray(resultado)
            ? resultado
            : [];

        renderizarClientes(clientes);
    } catch (erro) {
        console.error(
            "Erro ao carregar clientes:",
            erro
        );

        mensagemLista.style.display =
            "block";

        mensagemLista.textContent =
            erro.message;

        containerClientes.innerHTML = "";
        containerClientes.appendChild(
            mensagemLista
        );
    }
}

function pesquisarClientes() {
    const termo =
        normalizarTextoPesquisa(
            campoPesquisa.value.trim()
        );

    const termoNumerico =
        somenteDigitos(termo);

    const filtrados =
        clientes.filter((cliente) => {
            const textoCliente =
                normalizarTextoPesquisa(
                    [
                        cliente.nome,
                        cliente.email,
                        cliente.cidade,
                        cliente.uf,
                        cliente.telefone,
                        cliente.cpf,
                        cliente.cnpj
                    ]
                        .filter(Boolean)
                        .join(" ")
                );

            const documentosCliente =
                somenteDigitos(
                    [
                        cliente.telefone,
                        cliente.cpf,
                        cliente.cnpj
                    ]
                        .filter(Boolean)
                        .join(" ")
                );

            return (
                textoCliente.includes(termo) ||
                (
                    termoNumerico &&
                    documentosCliente.includes(
                        termoNumerico
                    )
                )
            );
        });

    renderizarClientes(filtrados);
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

async function excluirCliente(cliente) {
    const confirmou = window.confirm(
        `Deseja realmente excluir o cliente "${cliente.nome}"?`
    );

    if (!confirmou) {
        return;
    }

    try {
        const resposta = await fetch(
            `/clientes/${encodeURIComponent(
                cliente.idCliente
            )}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {
            let resultado = null;

            try {
                resultado =
                    await resposta.json();
            } catch {
                resultado = null;
            }

            throw new Error(
                obterMensagemErro(
                    resultado,
                    "Não foi possível excluir o cliente."
                )
            );
        }

        await carregarClientes();
    } catch (erro) {
        console.error(
            "Erro ao excluir cliente:",
            erro
        );

        alert(erro.message);
    }
}

/*
|--------------------------------------------------------------------------
| Eventos
|--------------------------------------------------------------------------
*/

botaoNovoCliente.addEventListener(
    "click",
    abrirNovoCliente
);

botaoFecharDialog.addEventListener(
    "click",
    fecharDialog
);

botaoCancelar.addEventListener(
    "click",
    fecharDialog
);

campoPesquisa.addEventListener(
    "input",
    pesquisarClientes
);

formCliente.addEventListener(
    "submit",
    salvarCliente
);

dialogCliente.addEventListener(
    "cancel",
    (evento) => {
        evento.preventDefault();
        fecharDialog();
    }
);

carregarClientes();