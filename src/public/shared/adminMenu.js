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

        document.querySelectorAll(".empresa-selecionada-super").forEach((item) => item.remove());
        if (sessao.usuario.perfil === "SUPER" && sessao.empresaSelecionada) {
            const indicador = document.createElement("a");
            indicador.className = "empresa-selecionada-super";
            indicador.href = "/admin/empresas";
            indicador.textContent = `Empresa selecionada: ${sessao.empresaSelecionada.nomeFantasia}`;
            document.querySelector(".topbar")?.insertAdjacentElement("afterend", indicador);
        }

        document.querySelectorAll(".opcoes-menu-admin").forEach((menu) => {
            function adicionarLink(texto, destino) {
                const link = document.createElement("a");
                link.href = destino;
                link.textContent = texto;
                menu.appendChild(link);
            }

            function adicionarSeparador() {
                const separador = document.createElement("div");
                separador.className = "separador-menu-admin";
                separador.setAttribute("role", "separator");
                menu.appendChild(separador);
            }

            menu.replaceChildren();
            adicionarLink("Nova cotação", "/");
            if (sessao.usuario.perfil === "SUPER") {
                adicionarLink("Gerenciar empresas", "/admin/empresas");
            }
            adicionarSeparador();
            adicionarLink("Clientes", "/admin/clientes");
            adicionarLink("Produtos", "/admin/produtos");

            if (["SUPER", "ADMIN"].includes(sessao.usuario.perfil)) {
                adicionarSeparador();
                adicionarLink("Empresa", "/admin/empresa");
                adicionarLink("Usuários", "/admin/usuarios");
            }

            adicionarSeparador();
            adicionarLink("Minha conta", "/minha-conta");

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
