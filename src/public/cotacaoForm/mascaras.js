export function somenteDigitos(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

export function formatarTelefone(valor) {
    const digitos = somenteDigitos(valor).slice(0, 11);

    if (digitos.length <= 2) {
        return digitos;
    }

    if (digitos.length <= 6) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }

    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }

    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function formatarCnpj(valor) {
    const digitos = somenteDigitos(valor).slice(0, 14);

    return digitos
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatarMoeda(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

export function moedaParaNumero(valor) {
    const digitos = somenteDigitos(valor);

    if (!digitos) {
        return 0;
    }

    return Number(digitos) / 100;
}

export function permitirSomenteInteiros(campo, aoAlterar) {
    campo.addEventListener("beforeinput", (evento) => {
        const operacaoPermitida =
            evento.inputType.startsWith("delete") ||
            evento.inputType === "insertFromPaste" ||
            evento.inputType === "insertFromDrop";

        if (operacaoPermitida) {
            return;
        }

        if (evento.data && !/^\d+$/.test(evento.data)) {
            evento.preventDefault();
        }
    });

    campo.addEventListener("input", () => {
        campo.value = somenteDigitos(campo.value);

        if (aoAlterar) {
            aoAlterar();
        }
    });
}

export function aplicarMascaraTelefone(campo) {
    campo.addEventListener("input", () => {
        campo.value = formatarTelefone(campo.value);
    });
}

export function aplicarMascaraCnpj(campo) {
    campo.addEventListener("input", () => {
        campo.value = formatarCnpj(campo.value);
    });
}

export function aplicarMascaraMoeda(campo, aoAlterar) {
    campo.addEventListener("beforeinput", (evento) => {
        const operacaoPermitida =
            evento.inputType.startsWith("delete") ||
            evento.inputType === "insertFromPaste" ||
            evento.inputType === "insertFromDrop";

        if (operacaoPermitida) {
            return;
        }

        if (evento.data && !/^\d+$/.test(evento.data)) {
            evento.preventDefault();
        }
    });

    campo.addEventListener("input", () => {
        const numero = moedaParaNumero(campo.value);

        campo.value = formatarMoeda(numero);

        if (aoAlterar) {
            aoAlterar();
        }
    });
}