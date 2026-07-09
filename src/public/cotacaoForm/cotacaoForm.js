document
    .getElementById("formulario")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const dados = {
            contato: document.getElementById("contato").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            endereco: document.getElementById("endereco").value,
            cnpj: document.getElementById("cnpj").value,

            produto: document.getElementById("produto").value,

            valorTotal: document.getElementById("valorTotal").value,

            prazoEntrega: document.getElementById("prazoEntrega").value,
            pagamento: document.getElementById("pagamento").value,

            dataGeracao: new Date().toLocaleDateString("pt-BR")
        };

        try {

            const resposta = await fetch("/documentos/gerar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            if (!resposta.ok) {
                throw new Error("Erro ao gerar documento.");
            }

            const blob = await resposta.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "cotacao.pdf";

            link.click();

            window.URL.revokeObjectURL(url);

        } catch (erro) {

            console.error(erro);

            alert("Erro ao gerar documento.");

        }

    });