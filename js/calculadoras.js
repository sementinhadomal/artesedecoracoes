document.addEventListener("DOMContentLoaded", function () {
    // Tab switching logic
    const tabs = document.querySelectorAll(".calc-tab");
    const contents = document.querySelectorAll(".calc-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active classes
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // Add active class to clicked tab and target content
            tab.classList.add("active");
            document.getElementById(tab.dataset.target).classList.add("active");
        });
    });

    // Form submission handlers
    document.getElementById("form-piso").addEventListener("submit", function (e) {
        e.preventDefault();
        calcularPiso()
    });

    document.getElementById("form-pvc").addEventListener("submit", function (e) {
        e.preventDefault();
        calcularPVC()
    });

    document.getElementById("form-drywall").addEventListener("submit", function (e) {
        e.preventDefault();
        calcularDrywall()
    });

    document.getElementById("form-papel").addEventListener("submit", function (e) {
        e.preventDefault();
        calcularPapel()
    });

    document.getElementById("form-persiana").addEventListener("submit", function (e) {
        e.preventDefault();
        calcularPersiana()
    });
});

// Helper to format numbers safely
function formatNum(num) {
    return Number.isInteger(num) ? num : num.toFixed(2);
}

// LAMINADO / VINÍLICO
function setPisoMeasureType(type, element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.segment-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.getElementById("piso-tipo-medida-val").value = type;
    togglePisoInputs();
}

function togglePisoInputs() {
    const tipo = document.getElementById("piso-tipo-medida-val").value;
    const containerMedidas = document.getElementById("piso-medidas-container");
    const containerArea = document.getElementById("piso-area-container");
    const inputLargura = document.getElementById("piso-largura");
    const inputComprimento = document.getElementById("piso-comprimento");
    const inputAreaTotal = document.getElementById("piso-area-total");

    if (tipo === "lxc") {
        containerMedidas.style.display = "grid";
        containerArea.style.display = "none";
        inputLargura.required = true;
        inputComprimento.required = true;
        inputAreaTotal.required = false;
    } else {
        containerMedidas.style.display = "none";
        containerArea.style.display = "grid";
        inputLargura.required = false;
        inputComprimento.required = false;
        inputAreaTotal.required = true;
    }
}

function calcularPiso() {
    const tipo = document.getElementById("piso-tipo-medida-val").value;
    const rendimentoCaixa = parseFloat(document.getElementById("piso-rendimento").value) || 2.5;

    let areaTotal = 0;
    let rodapeLinear = 0;

    if (tipo === "lxc") {
        const largura = parseFloat(document.getElementById("piso-largura").value);
        const comprimento = parseFloat(document.getElementById("piso-comprimento").value);
        if (!largura || !comprimento) return;

        areaTotal = largura * comprimento;
        rodapeLinear = (largura * 2) + (comprimento * 2);
    } else {
        const areaDigitada = parseFloat(document.getElementById("piso-area-total").value);
        if (!areaDigitada) return;

        areaTotal = areaDigitada;
        // Estimate perimeter for a square room: sqrt(area) * 4
        rodapeLinear = Math.sqrt(areaTotal) * 4;
    }

    const perda = areaTotal * 0.10;
    const areaComPerda = areaTotal + perda;
    const caixas = Math.ceil(areaComPerda / rendimentoCaixa);

    // Door deduction for baseboard
    const portasQtd = parseInt(document.getElementById("piso-portas-qtd").value) || 0;
    const portasLargura = parseFloat(document.getElementById("piso-portas-largura").value) || 0;
    const descontoLinear = portasQtd * portasLargura;

    rodapeLinear = Math.max(0, rodapeLinear - descontoLinear);

    // Manta calculation: area with loss / roll width (1.20m)
    const mantaLinear = areaComPerda / 1.20;

    // Insumos do rodapé
    const pregos = Math.ceil(rodapeLinear / 0.50);
    const colaBranca = Math.ceil(rodapeLinear / 8.4);
    const silicone = Math.ceil(rodapeLinear / 10.5);

    document.getElementById("res-piso-area-pura").innerText = formatNum(areaTotal) + " m²";
    document.getElementById("res-piso-area").innerText = formatNum(areaComPerda) + " m²";
    document.getElementById("res-piso-caixas").innerText = caixas + " Cx";
    document.getElementById("res-piso-manta").innerText = formatNum(mantaLinear) + " m lin.";
    document.getElementById("res-piso-rodape").innerText = formatNum(rodapeLinear) + " m lin.";
    document.getElementById("res-piso-portas").innerText = formatNum(descontoLinear) + " m lin.";
    document.getElementById("res-piso-pregos").innerText = pregos + " un";
    document.getElementById("res-piso-cola").innerText = colaBranca + " kg";
    document.getElementById("res-piso-silicone").innerText = silicone + " tubos";

    document.getElementById("results-piso").classList.add("show");
}// FORRO
function setForroType(type, element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.system-card, .segment-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.getElementById("pvc-tipo-forro-val").value = type;
    toggleForroOptions();
}

function setPVCMeasureType(type, element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.segment-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.getElementById("pvc-tipo-medida-val").value = type;
    togglePVCInputs();
}

function toggleForroOptions() {
    const tipo = document.getElementById("pvc-tipo-forro-val").value;
    const opcoesRegua = document.getElementById("pvc-opcoes-regua");
    const opcoesModular = document.getElementById("pvc-opcoes-modular");

    if (tipo === "regua") {
        opcoesRegua.style.display = "grid";
        opcoesModular.style.display = "none";
    } else {
        opcoesRegua.style.display = "none";
        opcoesModular.style.display = "grid";
        updateModularRendimento();
    }
}

function updateModularRendimento() {
    const tipo = document.getElementById("pvc-modular-tipo").value;
    const inputRendimento = document.getElementById("pvc-modular-rendimento");
    const labelRendimento = document.getElementById("label-modular-rendimento");

    if (tipo === "isopor") {
        inputRendimento.value = "0.781";
        inputRendimento.readOnly = true;
        labelRendimento.innerText = "Rendimento Placa (1.25x0.625)";
    } else if (tipo === "fibra") {
        inputRendimento.value = "0.744"; // 1.22 x 0.61
        inputRendimento.readOnly = true;
        labelRendimento.innerText = "Rendimento Placa (1.22x0.61)";
    } else if (tipo === "pvc") {
        inputRendimento.value = "0.781";
        inputRendimento.readOnly = true;
        labelRendimento.innerText = "Rendimento Placa (1.25x0.625)";
    } else {
        inputRendimento.readOnly = false;
        labelRendimento.innerText = "Rendimento Manual (m²)";
    }
}

function togglePVCInputs() {
    const tipoMedida = document.getElementById("pvc-tipo-medida-val").value;
    const containerMedidas = document.getElementById("pvc-medidas-container");
    const containerArea = document.getElementById("pvc-area-container");
    const inputLargura = document.getElementById("pvc-largura");
    const inputComprimento = document.getElementById("pvc-comprimento");
    const inputAreaTotal = document.getElementById("pvc-area-total");

    if (tipoMedida === "lxc") {
        containerMedidas.style.display = "grid";
        containerArea.style.display = "none";
        inputLargura.required = true;
        inputComprimento.required = true;
        inputAreaTotal.required = false;
    } else {
        containerMedidas.style.display = "none";
        containerArea.style.display = "grid";
        inputLargura.required = false;
        inputComprimento.required = false;
        inputAreaTotal.required = true;
    }
}

function calcularPVC() {
    const tipoAfericao = document.getElementById("pvc-tipo-medida-val").value;
    const tipoForro = document.getElementById("pvc-tipo-forro-val").value;

    let areaTotal = 0;
    let rodaforroLinear = 0;

    if (tipoAfericao === "lxc") {
        const largura = parseFloat(document.getElementById("pvc-largura").value);
        const comprimento = parseFloat(document.getElementById("pvc-comprimento").value);
        if (!largura || !comprimento) return;

        areaTotal = largura * comprimento;
        rodaforroLinear = (largura * 2) + (comprimento * 2);
    } else {
        const areaDigitada = parseFloat(document.getElementById("pvc-area-total").value);
        if (!areaDigitada) return;

        areaTotal = areaDigitada;
        rodaforroLinear = Math.sqrt(areaTotal) * 4;
    }

    const perda = areaTotal * 0.10;
    const areaComPerda = areaTotal + perda;

    let quantidade = 0;
    let labelQtd = "";
    let unidadeQtd = "";
    let notaAdicional = "";

    if (tipoForro === "regua") {
        const rendimentoRegua = parseFloat(document.getElementById("pvc-regua-tamanho").value) || 1.2;
        quantidade = Math.ceil(areaComPerda / rendimentoRegua);

        let tamanhoTexto = "6m";
        if (rendimentoRegua === 1.0) tamanhoTexto = "5m";
        else if (rendimentoRegua === 1.4) tamanhoTexto = "7m";
        else if (rendimentoRegua === 1.6) tamanhoTexto = "8m";

        const metalonLinear = areaComPerda / 0.60;
        const metalonBarras = Math.ceil(metalonLinear / 6);
        document.getElementById("res-pvc-metalon").innerText = metalonBarras + " un";
        document.getElementById("box-pvc-metalon").style.display = "";

        labelQtd = `Réguas (${tamanhoTexto})`;
        unidadeQtd = "pçs";
        notaAdicional = `Calculado com base em réguas de ${tamanhoTexto} x 20cm. Estrutura: 1 barra metalon a cada 60cm.`;
    } else {
        const rendimentoPlaca = parseFloat(document.getElementById("pvc-modular-rendimento").value) || 0.781;
        const subTipo = document.getElementById("pvc-modular-tipo").value;
        quantidade = Math.ceil(areaComPerda / rendimentoPlaca);
        document.getElementById("box-pvc-metalon").style.display = "none";

        let nomePlaca = "Placas Modulares";
        if (subTipo === "isopor") nomePlaca = "Placas de Isopor";
        else if (subTipo === "fibra") nomePlaca = "Placas de Fibra Mineral";
        else if (subTipo === "pvc") nomePlaca = "Placas de PVC Modular";

        labelQtd = nomePlaca;
        unidadeQtd = "unidades";
        notaAdicional = `Calculado com base no rendimento de ${rendimentoPlaca}m² por placa. Estrutura não incluída.`;
    }

    document.getElementById("res-pvc-area").innerText = formatNum(areaComPerda) + " m²";

    document.getElementById("label-pvc-qtd").innerText = labelQtd;
    document.getElementById("res-pvc-reguas").innerText = quantidade + " " + unidadeQtd;

    const rodaforroBarras = Math.ceil(rodaforroLinear / 6);
    document.getElementById("res-pvc-rodaforro").innerText = rodaforroBarras + " un" + (tipoAfericao === 'area' ? '*' : '');
    document.getElementById("pvc-result-note").innerText = `* Cálculo considera 10% de perda para recortes. Rodaforro (ou cantoneira) estimado pelo perímetro bruto. ${notaAdicional}`;

    document.getElementById("results-pvc").classList.add("show");
}

// DRYWALL PAREDE
function selectDrywallSystem(sistema, element) {
    // Atualizar UI dos cards (escopado ao grid pai)
    const parent = element.parentElement;
    parent.querySelectorAll('.system-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');

    // Atualizar select oculto e disparar toggle
    const select = document.getElementById("drywall-sistema");
    select.value = sistema;
    toggleDrywallInputs();
}

function setDrywallMeasureType(type, element) {
    // Atualizar UI do seletor segmentado
    const parent = element.parentElement;
    parent.querySelectorAll('.segment-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Atualizar valor oculto
    document.getElementById("drywall-tipo-medida-val").value = type;
    
    // Disparar lógica de toggle
    toggleDrywallInputs();
}

function toggleDrywallInputs() {
    const sistema = document.getElementById("drywall-sistema").value;
    const tipoMedida = document.getElementById("drywall-tipo-medida-val").value;
    
    const containerMedidas = document.getElementById("drywall-medidas-container");
    const containerArea = document.getElementById("drywall-area-container");
    const labelLXC = document.getElementById("label-drywall-lxc");
    const inputLargura = document.getElementById("drywall-largura");
    const inputAltura = document.getElementById("drywall-altura");
    const inputAreaTotal = document.getElementById("drywall-area-total");

    // Forros só usam Área
    if (sistema.startsWith("forro")) {
        document.getElementById("drywall-medida-toggle-row").style.display = "none";
        containerMedidas.style.display = "none";
        containerArea.style.display = "grid";
        inputLargura.required = false;
        inputAltura.required = false;
        inputAreaTotal.required = true;
    } else {
        document.getElementById("drywall-medida-toggle-row").style.display = "flex";
        if (tipoMedida === "lxc") {
            containerMedidas.style.display = "grid";
            containerArea.style.display = "none";
            inputLargura.required = true;
            inputAltura.required = true;
            inputAreaTotal.required = false;
            labelLXC.innerText = (sistema.startsWith("revest")) ? "Largura x Altura" : "Largura x Altura";
        } else {
            containerMedidas.style.display = "none";
            containerArea.style.display = "grid";
            inputLargura.required = false;
            inputAltura.required = false;
            inputAreaTotal.required = true;
        }
    }
}

function calcularDrywall() {
    const sistema = document.getElementById("drywall-sistema").value;
    const tipoAfericao = sistema.startsWith("forro") ? "area" : document.getElementById("drywall-tipo-medida-val").value;
    
    let areaTotal = 0;
    let linearMetragem = 0;
    let alturaParede = 0;

    if (tipoAfericao === "lxc") {
        linearMetragem = parseFloat(document.getElementById("drywall-largura").value);
        alturaParede = parseFloat(document.getElementById("drywall-altura").value);
        if (!linearMetragem || !alturaParede) return;
        areaTotal = linearMetragem * alturaParede;
    } else {
        areaTotal = parseFloat(document.getElementById("drywall-area-total").value);
        if (!areaTotal) return;
        // Para estimativa de perfis quando só tem área:
        linearMetragem = Math.sqrt(areaTotal); 
        alturaParede = Math.sqrt(areaTotal);
    }

    const grid = document.getElementById("drywall-results-grid");
    const resArea = document.getElementById("res-drywall-area");
    const resChapas = document.getElementById("res-drywall-chapas");
    const labelChapas = document.getElementById("label-drywall-chapas");
    const resultNote = document.getElementById("drywall-result-note");

    // Limpar itens anteriores (manter Área e Chapas que são fixos no HTML)
    while (grid.children.length > 2) {
        grid.removeChild(grid.lastChild);
    }

    let materials = [];
    let note = "";

    if (sistema === "parede") {
        // SAD - Parede Simples (2 faces)
        materials = [
            { label: "Guia 70mm (3m)", val: Math.ceil(areaTotal * 0.70 / 3), unit: "un" },
            { label: "Montante 70mm (3m)", val: Math.ceil(areaTotal * 2.30 / 3), unit: "un" },
            { label: "Parafuso TA 25", val: Math.ceil(areaTotal * 25), unit: "un" },
            { label: "Parafuso LA 9.5", val: Math.ceil(areaTotal * 2), unit: "un" },
            { label: "Massa Rejunte", val: (areaTotal * 0.70).toFixed(1), unit: "kg" },
            { label: "Fita de Junta", val: (areaTotal * 3).toFixed(1), unit: "m" }
        ];
        resArea.innerText = formatNum(areaTotal) + " m²";
        labelChapas.innerText = "Chapas ST 12.5mm (2 faces)";
        resChapas.innerText = formatNum(areaTotal * 2.10) + " m²";
        note = "* Sistema Gypsum SAD (Simples Alvenaria Drywall). Coeficientes oficiais por m² de parede.";
    } 
    else if (sistema === "forro-fga") {
        // FGA - Aramado
        materials = [
            { label: "FGA Cola", val: (areaTotal * 1.25).toFixed(1), unit: "kg" },
            { label: "Junção H (FGA)", val: Math.ceil(areaTotal * 1.5), unit: "un" },
            { label: "Arame 18", val: (areaTotal * 0.05).toFixed(2), unit: "kg" },
            { label: "Fita de Junta", val: (areaTotal * 1.5).toFixed(1), unit: "m" },
            { label: "Massa Rejunte", val: (areaTotal * 0.45).toFixed(1), unit: "kg" }
        ];
        resArea.innerText = formatNum(areaTotal) + " m²";
        labelChapas.innerText = "Chapas ST FGA";
        resChapas.innerText = formatNum(areaTotal * 1.05) + " m²";
        note = "* Sistema Gypsum FGA (Forro Gesso Aramado). Ideal para vãos pequenos e acabamento liso.";
    }
    else if (sistema === "forro-fge") {
        // FGE - Estruturado
        materials = [
            { label: "Perfil S47 (3m)", val: Math.ceil(areaTotal * 1.70 / 3), unit: "un" },
            { label: "Regulador S47", val: Math.ceil(areaTotal * 1.25), unit: "un" },
            { label: "Parafuso TA 25", val: Math.ceil(areaTotal * 15), unit: "un" },
            { label: "Massa Rejunte", val: (areaTotal * 0.45).toFixed(1), unit: "kg" },
            { label: "Fita de Junta", val: (areaTotal * 1.5).toFixed(1), unit: "m" }
        ];
        resArea.innerText = formatNum(areaTotal) + " m²";
        labelChapas.innerText = "Chapas ST 12.5mm";
        resChapas.innerText = formatNum(areaTotal * 1.05) + " m²";
        note = "* Sistema Gypsum FGE (Forro Gesso Estruturado). Recomenda-se uso de Perfis S47 e Tirantes.";
    }
    else if (sistema === "revest-colado") {
        // Revestimento Colado
        materials = [
            { label: "Cola Gypsum (Gesso Cola)", val: (areaTotal * 2.5).toFixed(1), unit: "kg" },
            { label: "Massa Rejunte", val: (areaTotal * 0.40).toFixed(1), unit: "kg" },
            { label: "Fita de Junta", val: (areaTotal * 1.5).toFixed(1), unit: "m" }
        ];
        resArea.innerText = formatNum(areaTotal) + " m²";
        labelChapas.innerText = "Chapas ST/RU 12.5mm";
        resChapas.innerText = formatNum(areaTotal * 1.05) + " m²";
        note = "* Revestimento Colado. Aplicação direta em paredes de alvenaria niveladas.";
    }
    else if (sistema === "revest-estrut") {
        // Revestimento Estruturado (Contra-parede)
        materials = [
            { label: "Montante 48/60/70mm", val: Math.ceil(areaTotal * 2.50 / 3), unit: "un" },
            { label: "Guia Correspondente", val: Math.ceil(areaTotal * 0.80 / 3), unit: "un" },
            { label: "Parafuso TA 25", val: Math.ceil(areaTotal * 18), unit: "un" },
            { label: "Massa Rejunte", val: (areaTotal * 0.45).toFixed(1), unit: "kg" },
            { label: "Fita de Junta", val: (areaTotal * 1.5).toFixed(1), unit: "m" }
        ];
        resArea.innerText = formatNum(areaTotal) + " m²";
        labelChapas.innerText = "Chapas ST/RU/RF 12.5mm";
        resChapas.innerText = formatNum(areaTotal * 1.05) + " m²";
        note = "* Revestimento Estruturado. Ideal para isolamento termoacústico e correção de prumo.";
    }

    // Renderizar materiais dinâmicos
    materials.forEach(item => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.innerHTML = `
            <div class="result-label">${item.label}</div>
            <div class="result-value">${item.val} ${item.unit}</div>
        `;
        grid.appendChild(div);
    });

    resultNote.innerText = note;
    document.getElementById("results-drywall").classList.add("show");
}

// PAPEL DE PAREDE
function calcularPapel() {
    const larguraParede = parseFloat(document.getElementById("papel-largura").value);
    const alturaParede = parseFloat(document.getElementById("papel-altura").value);
    const larguraRolo = parseFloat(document.getElementById("papel-rolo-largura").value);
    const comprimentoRolo = parseFloat(document.getElementById("papel-rolo-comprimento").value);

    if (!larguraParede || !alturaParede || !larguraRolo || !comprimentoRolo) return;

    const areaParede = larguraParede * alturaParede;
    const areaRolo = larguraRolo * comprimentoRolo;

    // 15% safety margin for pattern alignment (rapport)
    const areaComPerda = areaParede * 1.15;
    const rolos = Math.ceil(areaComPerda / areaRolo);

    document.getElementById("res-papel-area").innerText = formatNum(areaParede) + " m²";
    document.getElementById("res-papel-rolos").innerText = rolos + " un";
    document.getElementById("res-papel-area-rolo").innerText = formatNum(areaRolo) + " m²";

    document.getElementById("results-papel").classList.add("show");
}

// PERSIANAS
function calcularPersiana() {
    const larguraJanela = parseFloat(document.getElementById("persiana-largura").value);
    const alturaJanela = parseFloat(document.getElementById("persiana-altura").value);

    if (!larguraJanela || !alturaJanela) return;

    // Standard overlap: 10cm each side (0.20m total)
    const larguraFinal = larguraJanela + 0.20;
    const alturaFinal = alturaJanela + 0.20;
    const areaTotal = larguraFinal * alturaFinal;

    document.getElementById("res-persiana-largura").innerText = formatNum(larguraFinal) + " m";
    document.getElementById("res-persiana-area").innerText = formatNum(areaTotal) + " m²";
    document.getElementById("res-persiana-altura").innerText = formatNum(alturaFinal) + " m";

    document.getElementById("results-persiana").classList.add("show");
}
