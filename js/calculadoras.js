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
function togglePisoInputs() {
    const tipo = document.querySelector('input[name="piso-tipo-medida"]:checked').value;
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
    const tipo = document.querySelector('input[name="piso-tipo-medida"]:checked').value;
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

    document.getElementById("res-piso-area").innerText = formatNum(areaComPerda) + " m²";
    document.getElementById("res-piso-caixas").innerText = caixas + " Cx";
    document.getElementById("res-piso-rodape").innerText = formatNum(rodapeLinear) + " m" + (tipo === 'area' ? '*' : '');

    document.getElementById("results-piso").classList.add("show");
}

// FORRO PVC
function togglePVCInputs() {
    const tipo = document.querySelector('input[name="pvc-tipo-medida"]:checked').value;
    const containerMedidas = document.getElementById("pvc-medidas-container");
    const containerArea = document.getElementById("pvc-area-container");
    const inputLargura = document.getElementById("pvc-largura");
    const inputComprimento = document.getElementById("pvc-comprimento");
    const inputAreaTotal = document.getElementById("pvc-area-total");

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

function calcularPVC() {
    const tipo = document.querySelector('input[name="pvc-tipo-medida"]:checked').value;
    let areaTotal = 0;
    let rodaforroLinear = 0;

    if (tipo === "lxc") {
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

    const quantReguas = Math.ceil(areaComPerda / 1.2); // 1.2m^2

    document.getElementById("res-pvc-area").innerText = formatNum(areaComPerda) + " m²";
    document.getElementById("res-pvc-reguas").innerText = quantReguas + " pçs";
    document.getElementById("res-pvc-rodaforro").innerText = formatNum(rodaforroLinear) + " m" + (tipo === 'area' ? '*' : '');

    document.getElementById("results-pvc").classList.add("show");
}

// DRYWALL PAREDE
function toggleDrywallInputs() {
    const tipo = document.querySelector('input[name="drywall-tipo-medida"]:checked').value;
    const containerMedidas = document.getElementById("drywall-medidas-container");
    const containerArea = document.getElementById("drywall-area-container");
    const inputLargura = document.getElementById("drywall-largura");
    const inputAltura = document.getElementById("drywall-altura");
    const inputAreaTotal = document.getElementById("drywall-area-total");

    if (tipo === "lxc") {
        containerMedidas.style.display = "grid";
        containerArea.style.display = "none";
        inputLargura.required = true;
        inputAltura.required = true;
        inputAreaTotal.required = false;
    } else {
        containerMedidas.style.display = "none";
        containerArea.style.display = "grid";
        inputLargura.required = false;
        inputAltura.required = false;
        inputAreaTotal.required = true;
    }
}

function calcularDrywall() {
    const tipo = document.querySelector('input[name="drywall-tipo-medida"]:checked').value;
    let areaTotal = 0;
    let largura = 0;
    let altura = 0;

    if (tipo === "lxc") {
        largura = parseFloat(document.getElementById("drywall-largura").value);
        altura = parseFloat(document.getElementById("drywall-altura").value);
        if (!largura || !altura) return;

        areaTotal = largura * altura;
    } else {
        const areaDigitada = parseFloat(document.getElementById("drywall-area-total").value);
        if (!areaDigitada) return;

        areaTotal = areaDigitada;
        largura = Math.sqrt(areaTotal);
        altura = Math.sqrt(areaTotal);
    }

    const perda = areaTotal * 0.10;
    const areaComPerda = areaTotal + perda;

    // Standard ST plate: 1.2 x 1.8m = 2.16m^2 per face
    // For a single wall facing both sides, multiply by 2 (usually done, but let's assume single generic partition: 2 faces)
    const areaTotalDupla = areaComPerda * 2;
    const chapas = Math.ceil(areaTotalDupla / 2.16);

    // Rough framing estimate
    const guias = Math.ceil((largura * 2) / 3); // Top and bottom, 3m bars
    const montantes = Math.ceil((largura / 0.6) * (altura / 3) * 1.1); // ~60cm distance

    document.getElementById("res-drywall-area").innerText = formatNum(areaComPerda) + " m²";
    document.getElementById("res-drywall-chapas").innerText = chapas + " un";
    document.getElementById("res-drywall-estrutura").innerText = (guias + montantes) + " pçs" + (tipo === 'area' ? '*' : '');

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
