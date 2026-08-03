const nomeProduto =
    document.getElementById("nomeProduto");

const identificacaoProduto =
    document.getElementById("identificacaoProduto");

const campoTipoNovoBloco =
    document.getElementById("tipoNovoBloco");

const botaoAdicionarBloco =
    document.getElementById("botaoAdicionarBloco");

const botaoSalvar =
    document.getElementById("botaoSalvar");

const mensagemPagina =
    document.getElementById("mensagemPagina");

const editorBlocos =
    document.getElementById("editorBlocos");

const mensagemSemBlocos =
    document.getElementById("mensagemSemBlocos");

const containerBlocos =
    document.getElementById("blocosProduto");

const avisoSalvamento =
    document.getElementById("avisoSalvamento");

let tiposBloco = [];
let possuiAlteracoes = false;
let temporizadorAviso = null;

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function obterCodigoProduto() {
    const resultado = window.location.pathname.match(
        /^\/admin\/produtos\/([^/]+)\/descricao\/?$/
    );

    if (!resultado) {
        return null;
    }

    return decodeURIComponent(resultado[1]);
}

function obterNomeTipo(tipo) {
    const registro = tiposBloco.find(
        (item) => item.codigo === tipo
    );

    return registro
        ? registro.nome
        : tipo;
}

function marcarAlteracao() {
    possuiAlteracoes = true;
}

function exibirAviso(mensagem, erro = false) {
    if (temporizadorAviso) {
        window.clearTimeout(
            temporizadorAviso
        );
    }

    avisoSalvamento.textContent = mensagem;
    avisoSalvamento.classList.toggle(
        "erro",
        erro
    );
    avisoSalvamento.classList.add(
        "visivel"
    );

    temporizadorAviso = window.setTimeout(
        () => {
            avisoSalvamento.classList.remove(
                "visivel"
            );
        },
        4000
    );
}

function atualizarEstadoVazio() {
    mensagemSemBlocos.style.display =
        containerBlocos.children.length === 0
            ? "block"
            : "none";
}

function atualizarOrdemBlocos() {
    const blocos =
        containerBlocos.querySelectorAll(
            ".bloco-produto"
        );

    blocos.forEach((bloco, indice) => {
        bloco.dataset.ordem =
            String(indice + 1);

        bloco
            .querySelector(".bloco-numero")
            .textContent =
                `Bloco ${indice + 1}`;
    });

    atualizarEstadoVazio();
}

function moverBloco(bloco, direcao) {
    if (direcao < 0) {
        const anterior =
            bloco.previousElementSibling;

        if (anterior) {
            containerBlocos.insertBefore(
                bloco,
                anterior
            );
        }
    } else {
        const proximo =
            bloco.nextElementSibling;

        if (proximo) {
            containerBlocos.insertBefore(
                proximo,
                bloco
            );
        }
    }

    atualizarOrdemBlocos();
    marcarAlteracao();
}

function criarBotaoRemoverItem(
    elemento,
    aoRemover
) {
    const botao = document.createElement(
        "button"
    );

    botao.type = "button";
    botao.className =
        "botao botao-perigo";
    botao.textContent = "Remover";

    botao.addEventListener("click", () => {
        elemento.remove();
        aoRemover();
        marcarAlteracao();
    });

    return botao;
}

function atualizarNumeracaoLista(container) {
    const itens = container.querySelectorAll(
        ".item-lista"
    );

    itens.forEach((item, indice) => {
        item
            .querySelector(
                ".item-lista-numero"
            )
            .textContent =
                String(indice + 1);
    });
}

function criarItemLista(container, item = {}) {
    const elemento = document.createElement(
        "div"
    );

    elemento.className = "item-lista";
    elemento.innerHTML = `
        <span class="item-lista-numero"></span>

        <input
            type="text"
            class="item-lista-conteudo"
            value="${escaparHtml(
                item.conteudo || ""
            )}"
            placeholder="Conteúdo do item"
            required>
    `;

    const garantirItem = () => {
        if (container.children.length === 0) {
            criarItemLista(container);
        }

        atualizarNumeracaoLista(container);
    };

    elemento.appendChild(
        criarBotaoRemoverItem(
            elemento,
            garantirItem
        )
    );

    container.appendChild(elemento);
    atualizarNumeracaoLista(container);
}

function criarEditorTexto(bloco) {
    const container = document.createElement(
        "div"
    );

    container.className = "campo-bloco";
    container.innerHTML = `
        <label>Conteúdo</label>

        <textarea
            class="bloco-conteudo"
            rows="12"
            required>${escaparHtml(
                bloco.conteudo || ""
            )}</textarea>
    `;

    return container;
}

function criarEditorLista(bloco) {
    const container = document.createElement(
        "div"
    );

    container.innerHTML = `
        <div class="campo-bloco">
            <label>Texto introdutório</label>

            <textarea
                class="bloco-conteudo"
                rows="4"
                placeholder="Opcional">${escaparHtml(
                    bloco.conteudo || ""
                )}</textarea>
        </div>

        <div class="cabecalho-itens-bloco">
            <strong>Itens da lista</strong>

            <button
                type="button"
                class="botao botao-secundario botao-adicionar-item-lista">
                + Adicionar item
            </button>
        </div>

        <div class="bloco-itens-lista"></div>
    `;

    const itensContainer =
        container.querySelector(
            ".bloco-itens-lista"
        );

    const itens = Array.isArray(bloco.itens)
        ? bloco.itens
        : [];

    if (itens.length === 0) {
        criarItemLista(itensContainer);
    } else {
        itens.forEach((item) => {
            criarItemLista(
                itensContainer,
                item
            );
        });
    }

    container
        .querySelector(
            ".botao-adicionar-item-lista"
        )
        .addEventListener("click", () => {
            criarItemLista(itensContainer);
            marcarAlteracao();
        });

    return container;
}

function obterDimensoesTabela(editor) {
    const celulas = Array.from(
        editor.querySelectorAll(
            ".celula-editor"
        )
    );

    return {
        linhas: Math.max(
            0,
            ...celulas.map(
                (celula) =>
                    Number(celula.dataset.linha)
            )
        ),

        colunas: Math.max(
            0,
            ...celulas.map(
                (celula) =>
                    Number(celula.dataset.coluna)
            )
        )
    };
}

function atualizarGradeTabela(editor) {
    const celulas = Array.from(
        editor.querySelectorAll(
            ".celula-editor"
        )
    );

    celulas.sort((a, b) => {
        const linhaA = Number(a.dataset.linha);
        const linhaB = Number(b.dataset.linha);

        if (linhaA !== linhaB) {
            return linhaA - linhaB;
        }

        return (
            Number(a.dataset.coluna) -
            Number(b.dataset.coluna)
        );
    });

    celulas.forEach((celula) => {
        editor.appendChild(celula);
    });

    const { colunas } =
        obterDimensoesTabela(editor);

    editor.style.gridTemplateColumns =
        `repeat(${colunas}, minmax(150px, 1fr))`;
}

function criarCelulaTabela(
    editor,
    linha,
    coluna,
    item = {}
) {
    const celula = document.createElement(
        "div"
    );

    celula.className = "celula-editor";
    celula.dataset.linha = String(linha);
    celula.dataset.coluna = String(coluna);

    const cabecalhoPadrao = linha === 1;

    celula.innerHTML = `
        <input
            type="text"
            class="celula-conteudo"
            value="${escaparHtml(
                item.conteudo || ""
            )}"
            aria-label="Linha ${linha}, coluna ${coluna}"
            required>

        <label class="celula-cabecalho">
            <input
                type="checkbox"
                class="celula-eh-cabecalho"
                ${
                    item.cabecalho ??
                    cabecalhoPadrao
                        ? "checked"
                        : ""
                }>

            Cabeçalho
        </label>
    `;

    editor.appendChild(celula);
}

function criarEditorTabela(bloco) {
    const container = document.createElement(
        "div"
    );

    container.innerHTML = `
        <div class="campo-bloco">
            <label>Texto introdutório</label>

            <textarea
                class="bloco-conteudo"
                rows="3"
                placeholder="Opcional">${escaparHtml(
                    bloco.conteudo || ""
                )}</textarea>
        </div>

        <div class="acoes-tabela">
            <strong>Estrutura da tabela</strong>

            <div class="acoes-colunas-tabela">
                <button
                    type="button"
                    class="botao botao-secundario adicionar-coluna">
                    + Coluna
                </button>

                <button
                    type="button"
                    class="botao botao-perigo remover-coluna">
                    − Coluna
                </button>
            </div>
        </div>

        <div class="tabela-editor-rolagem">
            <div class="tabela-editor"></div>
        </div>

        <div class="acoes-linhas-tabela">
            <button
                type="button"
                class="botao botao-secundario adicionar-linha">
                + Linha
            </button>

            <button
                type="button"
                class="botao botao-perigo remover-linha">
                − Linha
            </button>
        </div>
    `;

    const editor = container.querySelector(
        ".tabela-editor"
    );

    const itens = Array.isArray(bloco.itens)
        ? bloco.itens
        : [];

    if (itens.length > 0) {
        itens.forEach((item) => {
            criarCelulaTabela(
                editor,
                Number(item.linha),
                Number(item.coluna),
                item
            );
        });
    } else {
        for (let linha = 1; linha <= 2; linha += 1) {
            for (
                let coluna = 1;
                coluna <= 2;
                coluna += 1
            ) {
                criarCelulaTabela(
                    editor,
                    linha,
                    coluna
                );
            }
        }
    }

    atualizarGradeTabela(editor);

    container
        .querySelector(".adicionar-linha")
        .addEventListener("click", () => {
            const dimensoes =
                obterDimensoesTabela(editor);

            const novaLinha =
                dimensoes.linhas + 1;

            for (
                let coluna = 1;
                coluna <= dimensoes.colunas;
                coluna += 1
            ) {
                criarCelulaTabela(
                    editor,
                    novaLinha,
                    coluna,
                    { cabecalho: false }
                );
            }

            atualizarGradeTabela(editor);
            marcarAlteracao();
        });

    container
        .querySelector(".adicionar-coluna")
        .addEventListener("click", () => {
            const dimensoes =
                obterDimensoesTabela(editor);

            const novaColuna =
                dimensoes.colunas + 1;

            for (
                let linha = 1;
                linha <= dimensoes.linhas;
                linha += 1
            ) {
                criarCelulaTabela(
                    editor,
                    linha,
                    novaColuna,
                    { cabecalho: linha === 1 }
                );
            }

            atualizarGradeTabela(editor);
            marcarAlteracao();
        });

    container
        .querySelector(".remover-linha")
        .addEventListener("click", () => {
            const dimensoes =
                obterDimensoesTabela(editor);

            if (dimensoes.linhas <= 1) {
                return;
            }

            editor
                .querySelectorAll(
                    `[data-linha="${dimensoes.linhas}"]`
                )
                .forEach((celula) => {
                    celula.remove();
                });

            atualizarGradeTabela(editor);
            marcarAlteracao();
        });

    container
        .querySelector(".remover-coluna")
        .addEventListener("click", () => {
            const dimensoes =
                obterDimensoesTabela(editor);

            if (dimensoes.colunas <= 1) {
                return;
            }

            editor
                .querySelectorAll(
                    `[data-coluna="${dimensoes.colunas}"]`
                )
                .forEach((celula) => {
                    celula.remove();
                });

            atualizarGradeTabela(editor);
            marcarAlteracao();
        });

    return container;
}

function obterNomeImagemGerenciada(referencia) {
    const resultado = String(referencia || "").match(
        /\/uploads\/produtos\/[^/]+\/(imagem-\d+\.(?:jpg|png))$/i
    );

    return resultado ? resultado[1] : null;
}

async function excluirArquivoImagem(referencia) {
    const nome = obterNomeImagemGerenciada(referencia);

    if (!nome) {
        return;
    }

    const codigoProduto = obterCodigoProduto();

    await buscarJson(
        `/produtos/${encodeURIComponent(
            codigoProduto
        )}/imagens/${encodeURIComponent(nome)}`,
        { method: "DELETE" }
    );
}

function atualizarPreviewImagem(campo, imagem) {
    const referencia = campo.value.trim();

    if (!referencia) {
        imagem.removeAttribute("src");
        imagem.classList.remove("visivel");
        return;
    }

    imagem.src = referencia;
    imagem.classList.add("visivel");
}

function criarEditorImagem(bloco) {
    const container = document.createElement(
        "div"
    );

    container.className = "campo-bloco";
    container.innerHTML = `
        <label>Arquivo da imagem</label>

        <input
            type="hidden"
            class="bloco-conteudo"
            value="${escaparHtml(
                bloco.conteudo || ""
            )}">

        <div class="controles-imagem">
            <label class="botao botao-secundario selecionar-imagem">
                Selecionar imagem

                <input
                    type="file"
                    class="arquivo-imagem"
                    accept="image/jpeg,image/png">
            </label>

            <button
                type="button"
                class="botao botao-perigo remover-imagem">
                Excluir imagem
            </button>

            <span class="estado-upload-imagem"></span>
        </div>

        <p class="ajuda-imagem">
            Formatos aceitos: JPEG e PNG. Tamanho máximo: 5 MB.
        </p>

        <img
            class="imagem-preview"
            alt="Pré-visualização da imagem">
    `;

    const campo = container.querySelector(
        ".bloco-conteudo"
    );

    const imagem = container.querySelector(
        ".imagem-preview"
    );

    const arquivo = container.querySelector(
        ".arquivo-imagem"
    );

    const botaoRemover = container.querySelector(
        ".remover-imagem"
    );

    const estadoUpload = container.querySelector(
        ".estado-upload-imagem"
    );

    const atualizarControles = () => {
        botaoRemover.disabled = !campo.value.trim();
    };

    arquivo.addEventListener("change", async () => {
        const imagemSelecionada = arquivo.files[0];

        if (!imagemSelecionada) {
            return;
        }

        const referenciaAnterior = campo.value.trim();
        const dados = new FormData();
        dados.append("imagem", imagemSelecionada);

        arquivo.disabled = true;
        botaoRemover.disabled = true;
        estadoUpload.textContent = "Enviando imagem...";

        try {
            const codigoProduto = obterCodigoProduto();
            const resultado = await buscarJson(
                `/produtos/${encodeURIComponent(
                    codigoProduto
                )}/imagens`,
                {
                    method: "POST",
                    body: dados
                }
            );

            campo.value = resultado.imagem.caminho;
            atualizarPreviewImagem(campo, imagem);
            estadoUpload.textContent =
                `Imagem enviada: ${resultado.imagem.nome}`;

            if (referenciaAnterior) {
                await excluirArquivoImagem(
                    referenciaAnterior
                );
            }

            marcarAlteracao();
        } catch (erro) {
            console.error("Erro no upload da imagem:", erro);
            estadoUpload.textContent = erro.message;
            exibirAviso(erro.message, true);
        } finally {
            arquivo.value = "";
            arquivo.disabled = false;
            atualizarControles();
        }
    });

    botaoRemover.addEventListener("click", async () => {
        const referencia = campo.value.trim();

        if (!referencia) {
            return;
        }

        botaoRemover.disabled = true;
        estadoUpload.textContent = "Excluindo imagem...";

        try {
            await excluirArquivoImagem(referencia);
            campo.value = "";
            atualizarPreviewImagem(campo, imagem);
            estadoUpload.textContent = "Imagem excluída.";
            marcarAlteracao();
        } catch (erro) {
            console.error("Erro ao excluir imagem:", erro);
            estadoUpload.textContent = erro.message;
            exibirAviso(erro.message, true);
        } finally {
            atualizarControles();
        }
    });

    imagem.addEventListener("error", () => {
        imagem.classList.remove("visivel");
    });

    atualizarPreviewImagem(campo, imagem);
    atualizarControles();

    return container;
}

function criarEditorTipo(tipo, bloco) {
    if (tipo === "TEXTO") {
        return criarEditorTexto(bloco);
    }

    if (tipo === "LISTA") {
        return criarEditorLista(bloco);
    }

    if (tipo === "TABELA") {
        return criarEditorTabela(bloco);
    }

    if (tipo === "IMAGEM") {
        return criarEditorImagem(bloco);
    }

    throw new Error(
        `Tipo de bloco não suportado: ${tipo}.`
    );
}

function criarBloco(
    tipo,
    bloco = {},
    iniciarMinimizado = false
) {
    const elemento = document.createElement(
        "article"
    );

    elemento.className = iniciarMinimizado
        ? "bloco-produto bloco-minimizado"
        : "bloco-produto";
    elemento.dataset.tipo = tipo;

    elemento.innerHTML = `
        <div class="bloco-cabecalho">
            <div class="bloco-identificacao">
                <span class="bloco-numero">Bloco</span>

                <span class="bloco-tipo">
                    ${escaparHtml(
                        obterNomeTipo(tipo)
                    )}
                </span>

                <span class="bloco-resumo-titulo"></span>
            </div>

            <div class="bloco-acoes">
                <button
                    type="button"
                    class="alternar-bloco"
                    aria-expanded="${String(
                        !iniciarMinimizado
                    )}">
                    ${iniciarMinimizado
                        ? "Expandir"
                        : "Minimizar"}
                </button>

                <button
                    type="button"
                    class="mover-cima"
                    aria-label="Mover bloco para cima">
                    ↑
                </button>

                <button
                    type="button"
                    class="mover-baixo"
                    aria-label="Mover bloco para baixo">
                    ↓
                </button>

                <button
                    type="button"
                    class="botao-perigo remover-bloco">
                    Remover
                </button>
            </div>
        </div>

        <div class="bloco-corpo">
            <div class="campo-bloco">
                <label>Título</label>

                <input
                    type="text"
                    class="bloco-titulo"
                    value="${escaparHtml(
                        bloco.titulo || ""
                    )}"
                    placeholder="Opcional">
            </div>
        </div>
    `;

    const corpo = elemento.querySelector(
        ".bloco-corpo"
    );

    corpo.appendChild(
        criarEditorTipo(tipo, bloco)
    );

    const campoTitulo = elemento.querySelector(
        ".bloco-titulo"
    );

    const tituloResumo = elemento.querySelector(
        ".bloco-resumo-titulo"
    );

    const botaoAlternar = elemento.querySelector(
        ".alternar-bloco"
    );

    const atualizarTituloResumo = () => {
        const titulo = campoTitulo.value.trim();

        tituloResumo.textContent = titulo;
        tituloResumo.hidden = !titulo;
    };

    atualizarTituloResumo();

    campoTitulo.addEventListener(
        "input",
        atualizarTituloResumo
    );

    botaoAlternar.addEventListener(
        "click",
        () => {
            const minimizado =
                elemento.classList.toggle(
                    "bloco-minimizado"
                );

            botaoAlternar.textContent = minimizado
                ? "Expandir"
                : "Minimizar";

            botaoAlternar.setAttribute(
                "aria-expanded",
                String(!minimizado)
            );
        }
    );

    elemento
        .querySelector(".mover-cima")
        .addEventListener("click", () => {
            moverBloco(elemento, -1);
        });

    elemento
        .querySelector(".mover-baixo")
        .addEventListener("click", () => {
            moverBloco(elemento, 1);
        });

    elemento
        .querySelector(".remover-bloco")
        .addEventListener("click", async (evento) => {
            const botao = evento.currentTarget;
            const referenciaImagem = tipo === "IMAGEM"
                ? elemento
                    .querySelector(".bloco-conteudo")
                    .value
                    .trim()
                : "";

            botao.disabled = true;

            try {
                await excluirArquivoImagem(
                    referenciaImagem
                );

                elemento.remove();
                atualizarOrdemBlocos();
                marcarAlteracao();
            } catch (erro) {
                console.error(
                    "Erro ao excluir imagem do bloco:",
                    erro
                );

                exibirAviso(erro.message, true);
                botao.disabled = false;
            }
        });

    containerBlocos.appendChild(elemento);
    atualizarOrdemBlocos();
}

function obterItensLista(bloco) {
    return Array.from(
        bloco.querySelectorAll(
            ".item-lista"
        )
    ).map((item) => ({
        conteudo:
            item
                .querySelector(
                    ".item-lista-conteudo"
                )
                .value
                .trim()
    }));
}

function obterCelulasTabela(bloco) {
    return Array.from(
        bloco.querySelectorAll(
            ".celula-editor"
        )
    )
        .map((celula) => ({
            linha:
                Number(celula.dataset.linha),

            coluna:
                Number(celula.dataset.coluna),

            conteudo:
                celula
                    .querySelector(
                        ".celula-conteudo"
                    )
                    .value
                    .trim(),

            cabecalho:
                celula
                    .querySelector(
                        ".celula-eh-cabecalho"
                    )
                    .checked
        }))
        .sort((a, b) => {
            if (a.linha !== b.linha) {
                return a.linha - b.linha;
            }

            return a.coluna - b.coluna;
        });
}

function obterBlocosFormulario() {
    return Array.from(
        containerBlocos.querySelectorAll(
            ".bloco-produto"
        )
    ).map((bloco, indice) => {
        const tipo = bloco.dataset.tipo;

        const resultado = {
            tipo,
            ordem: indice + 1,

            titulo:
                bloco
                    .querySelector(
                        ".bloco-titulo"
                    )
                    .value
                    .trim(),

            conteudo:
                bloco
                    .querySelector(
                        ".bloco-conteudo"
                    )
                    .value
                    .trim(),

            itens: []
        };

        if (tipo === "LISTA") {
            resultado.itens =
                obterItensLista(bloco);
        }

        if (tipo === "TABELA") {
            resultado.itens =
                obterCelulasTabela(bloco);
        }

        return resultado;
    });
}

function carregarBlocos(
    blocos,
    iniciarMinimizados = false
) {
    containerBlocos.innerHTML = "";

    blocos.forEach((bloco) => {
        criarBloco(
            bloco.tipo,
            bloco,
            iniciarMinimizados
        );
    });

    atualizarOrdemBlocos();
    possuiAlteracoes = false;
}

function preencherTipos() {
    campoTipoNovoBloco.innerHTML = "";

    tiposBloco.forEach((tipo) => {
        const opcao = document.createElement(
            "option"
        );

        opcao.value = tipo.codigo;
        opcao.textContent = tipo.nome;

        campoTipoNovoBloco.appendChild(opcao);
    });

    const habilitado = tiposBloco.length > 0;

    campoTipoNovoBloco.disabled =
        !habilitado;

    botaoAdicionarBloco.disabled =
        !habilitado;
}

async function buscarJson(url, opcoes) {
    const resposta = await fetch(url, opcoes);

    let dados = null;

    try {
        dados = await resposta.json();
    } catch {
        dados = null;
    }

    if (!resposta.ok) {
        throw new Error(
            dados?.mensagem ||
            `Erro na requisição. Status: ${resposta.status}`
        );
    }

    return dados;
}

async function carregarPagina() {
    const codigoProduto =
        obterCodigoProduto();

    if (!codigoProduto) {
        throw new Error(
            "Código do produto não informado."
        );
    }

    const [produto, tipos, blocos] =
        await Promise.all([
            buscarJson(
                `/produtos/${encodeURIComponent(
                    codigoProduto
                )}`
            ),

            buscarJson(
                "/produtos/tipos-bloco"
            ),

            buscarJson(
                `/produtos/${encodeURIComponent(
                    codigoProduto
                )}/blocos`
            )
        ]);

    tiposBloco = tipos;
    preencherTipos();

    nomeProduto.textContent = produto.nome;

    identificacaoProduto.textContent =
        `Código ${produto.codigo} · ${produto.descricao}`;

    carregarBlocos(blocos, true);

    mensagemPagina.hidden = true;
    editorBlocos.hidden = false;
}

async function salvarDescricao() {
    const blocoImagemSemArquivo = Array.from(
        containerBlocos.querySelectorAll(
            '.bloco-produto[data-tipo="IMAGEM"]'
        )
    ).find(
        (bloco) =>
            !bloco
                .querySelector(".bloco-conteudo")
                .value
                .trim()
    );

    if (blocoImagemSemArquivo) {
        blocoImagemSemArquivo.classList.remove(
            "bloco-minimizado"
        );

        const botaoAlternar = blocoImagemSemArquivo
            .querySelector(".alternar-bloco");

        botaoAlternar.textContent = "Minimizar";
        botaoAlternar.setAttribute(
            "aria-expanded",
            "true"
        );

        exibirAviso(
            "Selecione o arquivo de todos os blocos de imagem.",
            true
        );
        return;
    }

    const campoInvalido =
        document.querySelector(":invalid");

    if (campoInvalido) {
        campoInvalido.reportValidity();
        campoInvalido.focus();
        return;
    }

    const codigoProduto =
        obterCodigoProduto();

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        const resultado = await buscarJson(
            `/produtos/${encodeURIComponent(
                codigoProduto
            )}/blocos`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    blocos:
                        obterBlocosFormulario()
                })
            }
        );

        carregarBlocos(resultado.blocos);
        possuiAlteracoes = false;

        exibirAviso(
            "Descrição detalhada salva com sucesso."
        );
    } catch (erro) {
        console.error(
            "Erro ao salvar descrição detalhada:",
            erro
        );

        exibirAviso(erro.message, true);
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent =
            "Salvar descrição";
    }
}

botaoAdicionarBloco.addEventListener(
    "click",
    () => {
        const tipo = campoTipoNovoBloco.value;

        if (!tipo) {
            return;
        }

        criarBloco(tipo);
        marcarAlteracao();
    }
);

botaoSalvar.addEventListener(
    "click",
    salvarDescricao
);

containerBlocos.addEventListener(
    "input",
    marcarAlteracao
);

containerBlocos.addEventListener(
    "change",
    marcarAlteracao
);

window.addEventListener(
    "beforeunload",
    (evento) => {
        if (!possuiAlteracoes) {
            return;
        }

        evento.preventDefault();
        evento.returnValue = "";
    }
);

carregarPagina().catch((erro) => {
    console.error(
        "Erro ao carregar descrição detalhada:",
        erro
    );

    mensagemPagina.textContent = erro.message;
    mensagemPagina.classList.add(
        "mensagem-erro"
    );
});
