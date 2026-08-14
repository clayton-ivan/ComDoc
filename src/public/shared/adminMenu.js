document
    .querySelectorAll(".menu-administracao")
    .forEach((menu) => {
        const botao = menu.querySelector(
            ".botao-menu-admin"
        );

        const opcoes = menu.querySelector(
            ".opcoes-menu-admin"
        );

        function definirAberto(aberto) {
            opcoes.hidden = !aberto;

            botao.setAttribute(
                "aria-expanded",
                String(aberto)
            );

            botao.setAttribute(
                "aria-label",
                aberto
                    ? "Fechar menu"
                    : "Abrir menu"
            );
        }

        botao.addEventListener("click", () => {
            definirAberto(opcoes.hidden);
        });

        document.addEventListener(
            "click",
            (evento) => {
                if (
                    !opcoes.hidden &&
                    !menu.contains(evento.target)
                ) {
                    definirAberto(false);
                }
            }
        );

        document.addEventListener(
            "keydown",
            (evento) => {
                if (
                    evento.key === "Escape" &&
                    !opcoes.hidden
                ) {
                    definirAberto(false);
                    botao.focus();
                }
            }
        );
    });

fetch("/auth/sessao")
    .then((resposta) => resposta.json())
    .then((sessao) => {
        if (!sessao.autenticado) return;

        document.querySelectorAll(".opcoes-menu-admin").forEach((menu) => {
            if (["SUPER", "ADMIN"].includes(sessao.usuario.perfil) && !menu.querySelector('[href="/admin/usuarios"]')) {
                const usuarios = document.createElement("a");
                usuarios.href = "/admin/usuarios";
                usuarios.textContent = "Usuários";
                menu.appendChild(usuarios);
            }
            if (sessao.usuario.perfil === "SUPER") {
                const empresa = document.createElement("a");
                empresa.href = "/selecionar-empresa";
                empresa.textContent = "Trocar empresa";
                menu.appendChild(empresa);
            }
            const conta = document.createElement("a");
            conta.href = "/minha-conta";
            conta.textContent = `${sessao.usuario.nome.split(" ")[0]} (${sessao.usuario.perfil.toLowerCase()})`;
            menu.appendChild(conta);
            const sair = document.createElement("button");
            sair.type = "button";
            sair.className = "sair-menu-admin";
            sair.textContent = "Sair";
            sair.addEventListener("click", async () => {
                await fetch("/auth/logout", { method: "POST" });
                location.href = "/login";
            });
            menu.appendChild(sair);
        });
    });
