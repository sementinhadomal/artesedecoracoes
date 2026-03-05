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
    grid.innerHTML = ""; // Limpa o loader

    // Determinar se há um filtro de categoria ativo no menu da loja
    const activeCategory = document.querySelector('.category-item.active')?.dataset.categoryId;

    let filteredProducts = products;

    // Se estivermos usando o sistema de categorias do dashboard
    if (activeCategory && activeCategory !== 'all') {
        filteredProducts = products.filter(p => {
            const item = p.produto || p;
            return item.targetCategory === activeCategory;
        });
    }

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-search fa-2x" style="margin-bottom: 10px;"></i>
                <p>Nenhum produto encontrado nesta categoria no momento.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(p => {
        const item = p.produto || p;
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-name", item.nome || item.descricao);
        card.style.cssText = "background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; transition: 0.3s; cursor: pointer;";

        // Redirecionar para página individual no clique do card
        card.onclick = () => window.location.href = `produto.html?sku=${item.sku || item.codigo}`;

        const preco = parseFloat(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const imagem = item.imagem || item.urlImagem || 'https://via.placeholder.com/400x300?text=Sem+Imagem';

        card.innerHTML = `
            <div style="height: 200px; background: #f8f9fa; position: relative; overflow: hidden;">
                <img src="${imagem}" alt="${item.nome || item.descricao}" style="width:100%; height:100%; object-fit:cover; transition: 0.5s;">
            </div>
            <div style="padding: 20px;">
                <h4 style="margin-bottom: 10px; font-size: 1rem; font-weight: 600; min-height: 2.4em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #334155;">
                    ${item.nome || item.descricao}
                </h4>
                <div style="color: var(--primary-blue); font-weight: 700; font-size: 1.25rem; margin-bottom: 15px;">
                    ${preco}
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 10px;">SKU: ${item.sku || item.codigo}</div>
                <button class="btn btn-primary" style="width: 100%; font-size: 0.85rem; padding: 10px; background: #3b82f6; border: none; border-radius: 6px; color: white;">
                    Ver Detalhes
                </button>
            </div>
        `;

        // Efeito de zoom na imagem ao passar o mouse no card
        card.onmouseover = () => card.querySelector('img').style.transform = 'scale(1.1)';
        card.onmouseout = () => card.querySelector('img').style.transform = 'scale(1)';

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
