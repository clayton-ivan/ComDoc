import {
    requisitar,
    configurarSenhas,
    mostrarErroCampo,
    limparErroCampo
} from "./auth.js";
configurarSenhas();
document.getElementById("formSenha").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const senha = document.getElementById("senha");
    const confirmacao = document.getElementById("confirmacao");
    const mensagemSenha = document.getElementById("mensagemSenha");
    const mensagemConfirmacao = document.getElementById("mensagemConfirmacao");
    limparErroCampo(senha, mensagemSenha);
    limparErroCampo(confirmacao, mensagemConfirmacao);
    if (senha.value !== confirmacao.value) {
        mostrarErroCampo(confirmacao, mensagemConfirmacao, "As senhas não coincidem.");
        return;
    }
    try { const r=await requisitar("/auth/alterar-senha",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senha:senha.value,confirmacao:confirmacao.value})}); location.href=r.destino; }
    catch(e){mostrarErroCampo(senha, mensagemSenha, e.message);}
});
