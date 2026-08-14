import {
    requisitar,
    configurarSenhas,
    mostrarErroCampo,
    limparErroCampo
} from "./auth.js";
configurarSenhas();
const form = document.getElementById("formLogin");
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const botao = form.querySelector("button[type=submit]");
    const mensagem = document.getElementById("mensagem");
    const senha = document.getElementById("senha");
    botao.disabled = true;
    limparErroCampo(senha, mensagem);
    try {
        const resultado = await requisitar("/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:document.getElementById("email").value,senha:document.getElementById("senha").value,manterConectado:document.getElementById("manter").checked}) });
        location.href = resultado.destino;
    } catch (erro) {
        mostrarErroCampo(senha, mensagem, erro.message);
        botao.disabled = false;
    }
});
