/**
 * Integração Artes e Decorações & Bling ERP
 * Este script carrega os produtos do Bling e os exibe na página Loja.
 */

const BLING_CONFIG = {
    // A chave da API foi removida para segurança (conforme normas do dashboard)
    // Os produtos agora são gerenciados e publicados pelo Dashboard Administrativo.

    CHECKOUT_URL: 'https://seu-checkout.com/cart?product=',
    USE_LOCAL_STORAGE: true // Permite sincronia imediata com o Dashboard no mesmo navegador
};

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

async function loadProducts() {
    const grid = document.getElementById("product-grid");
    const loading = document.getElementById("loading-products");

    try {
        let products = [];

        // 1. Tentar ler da Nuvem (API /api/products/list) - Fonte de Verdade para o Cliente
        console.log("Buscando produtos na nuvem...");
        const cloudResponse = await fetch('/api/products/list');
        if (cloudResponse.ok) {
            const cloudData = await cloudResponse.json();
            products = cloudData.products || [];
            console.log("Produtos da nuvem carregados:", products.length);
        }

        // 2. Fallback para LocalStorage (Cache para o Admin ou Modo Offline)
        if (products.length === 0 && BLING_CONFIG.USE_LOCAL_STORAGE) {
            const storedData = localStorage.getItem('financial_data');
            if (storedData) {
                const data = JSON.parse(storedData);
                products = (data.importedProducts || []).filter(p => p.status === 'published');
                console.log("Usando produtos do storage local (fallback):", products.length);
            }
        }

        // 3. Renderizar resultados
        if (products.length > 0) {
            renderProducts(products);
        } else {
            // Se ainda assim não houver nada, mostrar exemplos (mock) ou erro amigável
            console.warn("Nenhum produto publicado encontrado.");
            renderProducts(getMockProducts());
        }

    } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
        showError("Não foi possível carregar os produtos no momento. Tente novamente mais tarde.");
    } finally {
        if (loading) loading.style.display = "none";
    }
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const activeCategory = document.querySelector('.cat-tag.active')?.dataset.category || 'all';

    let filteredProducts = products;
    if (activeCategory && activeCategory !== 'all') {
        filteredProducts = products.filter(p => {
            const item = p.produto || p;
            return item.targetCategory === activeCategory;
        });
    }

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8;">
                <i class="fas fa-search fa-2x" style="margin-bottom:12px;"></i>
                <p>Nenhum produto encontrado nesta categoria no momento.</p>
            </div>
        `;
        return;
    }

    const rc = document.getElementById('results-count');
    if (rc) rc.textContent = filteredProducts.length + ' produto(s)';

    filteredProducts.forEach(p => {
        const item = p.produto || p;
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-name", item.nome || item.descricao || '');
        card.setAttribute("data-category", item.targetCategory || 'all');

        card.onclick = () => window.location.href = `produto.html?sku=${item.sku || item.codigo}`;

        const precoNum = parseFloat(item.preco);
        const preco = precoNum > 0 ? precoNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Consulte-nos';
        const imagem = item.imagem || item.urlImagem || 'https://placehold.co/400x300/e9edf4/94a3b8?text=Sem+Imagem';
        const nome = item.nome || item.descricao || 'Produto';
        const sku = item.sku || item.codigo || '';

        card.innerHTML = `
            <div class="product-card-img">
                <img src="${imagem}" alt="${nome}" loading="lazy">
            </div>
            <div class="product-card-body">
                <h4>${nome}</h4>
                <div class="product-card-price">${preco}</div>
                ${sku ? `<div class="product-card-sku">SKU: ${sku}</div>` : ''}
                <button class="product-card-btn">
                    <i class="fas fa-eye" style="margin-right:6px;"></i> Ver Detalhes
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function showError(message) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--alert-red);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-outline" style="margin-top: 15px;">Tentar Novamente</button>
        </div>
    `;
}

function getMockProducts() {
    return [
        {
            descricao: "Piso Laminado Durafloor (Demo)",
            preco: "89.90",
            codigo: "PISO-001",
            urlImagem: "https://images.unsplash.com/photo-1581850518616-bcb8077fa2aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        {
            descricao: "Forro PVC Branco 8mm (Demo)",
            preco: "35.00",
            codigo: "FORRO-002",
            urlImagem: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        {
            descricao: "Chapa Drywall Standard (Demo)",
            preco: "42.00",
            codigo: "DRY-003",
            urlImagem: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }
    ];
}
