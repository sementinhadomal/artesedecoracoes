document.addEventListener("DOMContentLoaded", function () {
    const typeBtns = document.querySelectorAll(".type-btn");
    const tipoCadastroInput = document.getElementById("tipo-cadastro");
    const docLabel = document.getElementById("label-documento");
    const docInput = document.getElementById("input-documento");
    const b2bNotice = document.getElementById("b2b-notice");
    const cadastroForm = document.getElementById("cadastro-form");

    // Mask for Phone
    const phoneInput = document.getElementById("input-telefone");
    phoneInput.addEventListener("input", function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    // CEP API call (ViaCEP)
    const cepInput = document.getElementById("input-cep");
    cepInput.addEventListener("blur", function (e) {
        let cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        document.getElementById("input-rua").value = data.logradouro;
                        document.getElementById("input-bairro").value = data.bairro;
                        document.getElementById("input-cidade").value = data.localidade;
                    }
                });
        }
    });

    // Toggle PF / PJ
    typeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            typeBtns.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");

            const type = btn.dataset.type;
            tipoCadastroInput.value = type;

            if (type === "PJ") {
                docLabel.innerText = "CNPJ";
                docInput.placeholder = "00.000.000/0000-00";
                b2bNotice.style.display = "block";
            } else {
                docLabel.innerText = "CPF";
                docInput.placeholder = "000.000.000-00";
                b2bNotice.style.display = "none";
            }
        });
    });

    // Submission via WhatsApp
    cadastroForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const tipo = tipoCadastroInput.value;
        const nome = document.getElementById("input-nome").value;
        const email = document.getElementById("input-email").value;
        const tel = document.getElementById("input-telefone").value;
        const doc = docInput.value;
        const cep = document.getElementById("input-cep").value;
        const rua = document.getElementById("input-rua").value;
        const num = document.getElementById("input-numero").value;
        const bairro = document.getElementById("input-bairro").value;
        const cidade = document.getElementById("input-cidade").value;
        const interesse = document.getElementById("input-interesse").value;

        let message = "";

        if (tipo === "PJ") {
            message += `*🚨 NOVO CADASTRO PJ (B2B)*\n`;
            message += `_Este cadastro precisa ser analisado para liberação da tabela corporativa._\n\n`;
        } else {
            message += `*📝 NOVO CADASTRO PF*\n\n`;
        }

        message += `*Nome/Empresa:* ${nome}\n`;
        message += `*${tipo === "PJ" ? "CNPJ" : "CPF"}:* ${doc}\n`;
        message += `*E-mail:* ${email}\n`;
        message += `*Telefone:* ${tel}\n\n`;

        message += `*Endereço:* ${rua}, ${num} - ${bairro}, ${cidade} (CEP: ${cep})\n`;
        message += `*Principal Interesse:* ${interesse}\n`;

        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://wa.me/5511999201062?text=${encodedMessage}`;

        // Feedback
        alert(`Cadastro preenchido! Você será redirecionado para enviar os dados no nosso WhatsApp.`);
        window.open(waLink, '_blank');

        // Optionally reset form
        // cadastroForm.reset();
    });
});
