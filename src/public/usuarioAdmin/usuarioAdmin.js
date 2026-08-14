import {
    requisitar,
    mostrarToast,
    mostrarErroCampo,
    limparErroCampo
} from "/auth/auth.js";

const lista = document.getElementById("lista");
const form = document.getElementById("formUsuario");
let usuarios = [];
let sessao;

function limparMensagens() {
    [
        ["nome", "mensagemNome"],
        ["email", "mensagemEmail"],
        ["senha", "mensagemSenha"]
    ].forEach(([campo, mensagem]) =>
        limparErroCampo(
            document.getElementById(campo),
            document.getElementById(mensagem)
        )
    );
}

async function redefinirSenha(usuario) {
    const novaSenha = window.prompt(
        "Informe a nova senha provisória:"
    );

    if (!novaSenha) return;

    try {
        await requisitar(`/usuarios/${usuario.idUsuario}/senha`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha: novaSenha })
        });
        mostrarToast(
            "Senha redefinida. A troca será exigida no próximo acesso."
        );
    } catch (erro) {
        mostrarToast(erro.message, true);
    }
}

function renderizar() {
    lista.replaceChildren();

    usuarios.forEach((usuario) => {
        const cartao = document.createElement("article");
        cartao.className = "usuario";
        const titulo = document.createElement("h2");
        titulo.textContent = usuario.nome;
        const detalhes = document.createElement("p");
        detalhes.textContent = [
            usuario.email,
            usuario.perfil,
            usuario.ativo ? "Ativo" : "Inativo"
        ].join(" • ");
        const acoes = document.createElement("div");
        acoes.className = "acoes";
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => abrir(usuario));
        const senha = document.createElement("button");
        senha.type = "button";
        senha.className = "secundario";
        senha.textContent = "Redefinir senha";
        senha.addEventListener("click", () => redefinirSenha(usuario));
        acoes.append(editar, senha);
        cartao.append(titulo, detalhes);
        if (usuario.bloqueadoAte) {
            const bloqueio = document.createElement("p");
            bloqueio.className = "bloqueio-usuario";
            bloqueio.textContent = `Bloqueio temporário: ${new Date(
                usuario.bloqueadoAte
            ).toLocaleString("pt-BR")}`;
            cartao.appendChild(bloqueio);
        }
        cartao.appendChild(acoes);
        lista.appendChild(cartao);
    });
}

function abrir(usuario = null) {
    limparMensagens();
    form.hidden = false;
    lista.hidden = true;
    document.getElementById("novo").hidden = true;
    document.getElementById("idUsuario").value = usuario?.idUsuario || "";
    document.getElementById("nome").value = usuario?.nome || "";
    document.getElementById("email").value = usuario?.email || "";
    document.getElementById("perfil").value = usuario?.perfil || "VENDEDOR";
    document.getElementById("idEmpresa").value =
        usuario?.idEmpresa || sessao.idEmpresaAtiva || "";
    document.getElementById("ativo").checked = usuario?.ativo ?? true;
    document.getElementById("trocarSenha").checked =
        usuario?.trocarSenha ?? true;
    document.getElementById("bloqueadoAte").value = usuario?.bloqueadoAte
        ? new Date(usuario.bloqueadoAte).toLocaleString("pt-BR")
        : "Sem bloqueio";
    document.getElementById("campoBloqueio").hidden = !usuario;
    document.getElementById("campoSenha").hidden = Boolean(usuario);
    document.getElementById("senha").required = !usuario;
    document.getElementById("tituloForm").textContent = usuario
        ? "Editar usuário"
        : "Novo usuário";

    if (sessao.usuario.perfil === "ADMIN") {
        document.getElementById("perfil").disabled = true;
        const propriaConta =
            usuario?.idUsuario === sessao.usuario.idUsuario;
        document.getElementById("ativo").disabled = propriaConta;
        document.getElementById("trocarSenha").disabled = propriaConta;
    }
}

function fechar() {
    limparMensagens();
    form.hidden = true;
    lista.hidden = false;
    document.getElementById("novo").hidden = false;
    form.reset();
    document.getElementById("perfil").disabled = false;
    document.getElementById("ativo").disabled = false;
    document.getElementById("trocarSenha").disabled = false;
}

function exibirErroFormulario(erro) {
    const mensagem = erro.message;
    const texto = mensagem.toLocaleLowerCase("pt-BR");

    if (texto.includes("senha")) {
        mostrarErroCampo(
            document.getElementById("senha"),
            document.getElementById("mensagemSenha"),
            mensagem
        );
    } else if (texto.includes("e-mail")) {
        mostrarErroCampo(
            document.getElementById("email"),
            document.getElementById("mensagemEmail"),
            mensagem
        );
    } else if (texto.includes("nome")) {
        mostrarErroCampo(
            document.getElementById("nome"),
            document.getElementById("mensagemNome"),
            mensagem
        );
    } else {
        mostrarToast(mensagem, true);
    }
}

async function carregar() {
    sessao = await requisitar("/auth/sessao");

    if (!["SUPER", "ADMIN"].includes(sessao.usuario.perfil)) {
        location.href = "/";
        return;
    }

    const campoPerfil = document.getElementById("perfil");
    const campoEmpresa = document.getElementById("campoEmpresa");

    if (sessao.usuario.perfil === "ADMIN") {
        campoEmpresa.hidden = true;
    } else {
        const empresas = await requisitar("/auth/empresas");
        const select = document.getElementById("idEmpresa");
        empresas.forEach((empresa) => {
            const opcao = document.createElement("option");
            opcao.value = empresa.id;
            opcao.textContent = empresa.nomeFantasia;
            select.appendChild(opcao);
        });
    }

    usuarios = await requisitar("/usuarios");
    renderizar();
}

document.getElementById("novo").addEventListener("click", () => abrir());
document.getElementById("cancelar").addEventListener("click", fechar);
document.getElementById("voltar").addEventListener("click", () => {
    location.href = "/";
});

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limparMensagens();

    const idUsuario = document.getElementById("idUsuario").value;
    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        idEmpresa:
            Number(document.getElementById("idEmpresa").value) ||
            sessao.usuario.idEmpresa,
        perfil: document.getElementById("perfil").value,
        senha: document.getElementById("senha").value,
        ativo: document.getElementById("ativo").checked,
        trocarSenha: document.getElementById("trocarSenha").checked
    };

    try {
        await requisitar(
            idUsuario ? `/usuarios/${idUsuario}` : "/usuarios",
            {
                method: idUsuario ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            }
        );
        usuarios = await requisitar("/usuarios");
        renderizar();
        fechar();
        mostrarToast(
            idUsuario
                ? "Usuário atualizado com sucesso."
                : "Usuário cadastrado com sucesso."
        );
    } catch (erro) {
        exibirErroFormulario(erro);
    }
});

carregar().catch((erro) => mostrarToast(erro.message, true));
