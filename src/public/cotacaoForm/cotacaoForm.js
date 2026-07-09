document
    .getElementById("formCotacao")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const dados = {

            empresa: document.getElementById("empresa").value,
            cnpj: document.getElementById("cnpj").value,
            cidade: document.getElementById("cidade").value,
            contato: document.getElementById("contato").value,

            produto: document.getElementById("produto").value,
            quantidade: document.getElementById("quantidade").value,
            valor: document.getElementById("valor").value,

            validade: document.getElementById("validade").value,
            pagamento: document.getElementById("pagamento").value,
            entrega: document.getElementById("entrega").value,

            observacoes: document.getElementById("observacoes").value

        };
		console.log(dados);
        const resposta = await fetch("/documentos/gerar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dados)

        });

        if (!resposta.ok) {

            alert("Erro ao gerar documento.");
			console.log(resposta);

            return;

        }

        const blob = await resposta.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "cotacao.pdf";

        link.click();

        window.URL.revokeObjectURL(url);

    });