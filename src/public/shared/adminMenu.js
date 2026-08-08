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
