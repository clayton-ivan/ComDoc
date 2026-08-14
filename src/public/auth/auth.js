async function requisitar(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new Error(dados?.mensagem || "Não foi possível concluir a operação.");
    return dados;
}

function configurarSenhas() {
    document.querySelectorAll("[data-mostrar-senha]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const campo = document.getElementById(botao.dataset.mostrarSenha);
            campo.type = campo.type === "password" ? "text" : "password";
            botao.textContent = campo.type === "password" ? "Mostrar" : "Ocultar";
        });
    });
}

let temporizadorToast;

function mostrarToast(mensagem, erro = false) {
    let toast = document.getElementById("toastGlobal");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toastGlobal";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }

    window.clearTimeout(temporizadorToast);
    toast.textContent = mensagem;
    toast.classList.toggle("erro", erro);
    toast.classList.add("visivel");
    temporizadorToast = window.setTimeout(
        () => toast.classList.remove("visivel"),
        3000
    );
}

function mostrarErroCampo(campo, elementoMensagem, mensagem) {
    elementoMensagem.textContent = mensagem;
    campo.closest("label")?.classList.add("campo-com-erro");
    campo.scrollIntoView({ behavior: "smooth", block: "center" });
    campo.focus({ preventScroll: true });
}

function limparErroCampo(campo, elementoMensagem) {
    elementoMensagem.textContent = "";
    campo.closest("label")?.classList.remove("campo-com-erro");
}

export {
    requisitar,
    configurarSenhas,
    mostrarToast,
    mostrarErroCampo,
    limparErroCampo
};
