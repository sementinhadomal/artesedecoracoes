/**
 * Lógica da Página de Detalhes do Produto
 * Carrega os dados do localStorage (Published) baseados no SKU da URL.
 */

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku');

    if (!sku) {
        window.location.href = 'produtos.html';
        return;
    }

    loadProductDetails(sku);
});

function loadProductDetails(sku) {
    const container = document.getElementById('product-container');

    // 1. Tentar carregar do LocalStorage (Sincronizado com Dashboard)
    const storedData = localStorage.getItem('financial_data');
    let product = null;

    if (storedData) {
        const data = JSON.parse(storedData);
        product = (data.importedProducts || []).find(p => p.sku === sku);
    }

    // 2. Fallback para demonstração se não encontrar (ou se o storage sumir)
    if (!product) {
        // Mock simple products for visual test
        const mocks = [
            { sku: 'PISO-001', nome: 'Piso Laminado Durafloor', preco: 89.90, imagem: 'https://images.unsplash.com/photo-1581850518616-bcb8077fa2aa?w=800' },
            { sku: 'FORRO-002', nome: 'Forro PVC Branco 8mm', preco: 35.00, imagem: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800' }
        ];
        product = mocks.find(m => m.sku === sku);
    }

    if (!product) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 100px;">
                <i class="fas fa-search fa-3x" style="color: #ef4444;"></i>
                <h2 style="margin-top: 20px;">Produto não encontrado</h2>
                <p style="color: #64748b;">O produto com o SKU "${sku}" não está disponível no momento.</p>
                <a href="produtos.html" class="btn-buy" style="max-width: 200px; margin: 30px auto;">Voltar para Produtos</a>
            </div>
        `;
        return;
    }

    // 3. Renderizar Detalhes
    renderDetails(product);
}

function renderDetails(p) {
    const container = document.getElementById('product-container');
    const preco = p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const imagem = p.imagem || 'https://via.placeholder.com/800x800?text=Sem+Imagem';
    const checkoutUrl = `https://seu-checkout.com/cart?product=${p.sku}`; // URL base do checkout

    container.innerHTML = `
        <div class="product-gallery">
            <img src="${imagem}" alt="${p.nome}" id="main-img">
        </div>
        <div class="product-info">
            <div class="sku-badge">SKU: ${p.sku}</div>
            <h1>${p.nome}</h1>
            <div class="product-price">${preco} <small style="font-size: 1rem; color: #94a3b8; font-weight: 400;">/unid</small></div>
            
            <div class="product-description">
                Este produto é de alta qualidade e faz parte do catálogo premium da Artes e Decorações. 
                Ideal para reformas e construções, garantindo durabilidade e um acabamento impecável para o seu ambiente.
            </div>

            <div class="buy-box">
                <div style="margin-bottom: 20px; color: #15803d; font-weight: 600;">
                    <i class="fas fa-check-circle"></i> Disponível para entrega imediata
                </div>
                <a href="${checkoutUrl}" class="btn-buy">
                    <i class="fas fa-shopping-cart"></i> COMPRAR AGORA
                </a>
                <div style="margin-top: 15px; text-align: center; font-size: 0.85rem; color: #64748b;">
                    <i class="fas fa-lock"></i> Compra 100% Segura
                </div>
            </div>

            <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee; display: flex; align-items: center; gap: 12px; font-size: 0.9rem;">
                    <i class="fas fa-truck" style="color: var(--primary-blue);"></i>
                    Frete sob consulta
                </div>
                <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee; display: flex; align-items: center; gap: 12px; font-size: 0.9rem;">
                    <i class="fas fa-shield-alt" style="color: var(--primary-blue);"></i>
                    Garantia de Fábrica
                </div>
            </div>
        </div>
    `;

    // Atualizar o título da página
    document.title = `${p.nome} | Artes e Decorações`;
}
