// State Management
let financialData = JSON.parse(localStorage.getItem('financialData')) || {};

// Migration Logic (Old format to Unified format)
if (financialData.sales || financialData.expenses) {
    const oldEntries = [];
    if (financialData.sales) {
        financialData.sales.forEach(s => oldEntries.push({ ...s, type: 'sale', category: 'Venda - Balcão', categoryId: 'venda_balcao', status: 'paid' }));
    }
    if (financialData.expenses) {
        financialData.expenses.forEach(e => oldEntries.push({ ...e, type: 'expense', category: 'Gasto - Loja', categoryId: 'gasto_loja' }));
    }
    financialData = { entries: oldEntries };
    localStorage.setItem('financialData', JSON.stringify(financialData));
}

if (!financialData.entries) financialData.entries = [];

// Current Page Context
let currentPage = 'main';

const PAGE_CONFIG = {
    'main': { title: 'Página Principal', type: 'summary' },
    // Canais de Venda
    'venda_balcao': { title: 'Frente de Balcão', type: 'sale', category: 'Venda - Balcão' },
    'venda_shibata': { title: 'Supermercado Shibata', type: 'sale', category: 'Venda - Shibata' },
    'venda_shopee': { title: 'Shopee', type: 'sale', category: 'Venda - Shopee' },
    'venda_ml': { title: 'Mercado Livre', type: 'sale', category: 'Venda - ML' },
    // Categorias de Produtos
    'venda_drywall': { title: 'Drywall', type: 'sale', category: 'Venda - Drywall' },
    'venda_divisorias': { title: 'Divisórias', type: 'sale', category: 'Venda - Divisórias' },
    'venda_papel': { title: 'Papel de Parede', type: 'sale', category: 'Venda - Papel de Parede' },
    'venda_persianas': { title: 'Persianas', type: 'sale', category: 'Venda - Persianas' },
    'venda_espelhos': { title: 'Espelhos e Box', type: 'sale', category: 'Venda - Espelhos/Box' },
    'venda_hidraulica': { title: 'Hidráulica', type: 'sale', category: 'Venda - Hidráulica' },
    'venda_eletrica': { title: 'Elétrica', type: 'sale', category: 'Venda - Elétrica' },
    'venda_ferramentas': { title: 'Ferramentas', type: 'sale', category: 'Venda - Ferramentas' },
    'venda_geral': { title: 'Materiais em Geral', type: 'sale', category: 'Venda - Materiais Geral' },
    // Despesas
    'gasto_loja': { title: 'Contas da Loja', type: 'expense', category: 'Gasto - Loja' },
    'gasto_familia': { title: 'Contas Família', type: 'expense', category: 'Gasto - Família' },
    'gasto_funcionarios': { title: 'Funcionários', type: 'expense', category: 'Gasto - Funcionários' },
    // Integrações
    'bling_integration': { title: 'Integração Bling ERP', type: 'integration' }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderPage();
});

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('pt-BR', options);
}

function saveData() {
    localStorage.setItem('financialData', JSON.stringify(financialData));
    renderPage();

    // Sincronização em Background com a Nuvem (Dashboard -> Vercel KV)
    syncWithCloud();
}

async function syncWithCloud() {
    // Pegar apenas os produtos que têm configurações (importados)
    const productsToSync = financialData.importedProducts || [];

    try {
        await fetch('/api/products/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: productsToSync })
        });
        console.log('Dados sincronizados com a nuvem.');
    } catch (err) {
        console.warn('Falha na sincronização cloud (Offline ou falta de KV):', err);
    }
}

// Navigation Logic
function switchPage(pageId) {
    currentPage = pageId;

    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${pageId}'`)) {
            item.classList.add('active');
        }
    });

    renderPage();
}

function renderPage() {
    const config = PAGE_CONFIG[currentPage];
    document.getElementById('page-title').innerText = config.title;

    // Update Form visibility and labels
    const statusGroup = document.getElementById('status-group');
    const formContainer = document.getElementById('form-container');
    const submitBtn = document.getElementById('submit-btn');

    if (config.type === 'summary') {
        formContainer.style.display = 'none';
        document.getElementById('stat-label').innerText = 'Consolidado';
        document.getElementById('stat-label-exp').innerText = 'Consolidado';
    } else if (config.type === 'integration') {
        formContainer.style.display = 'none';
        renderIntegrationPage(currentPage);
        return;
    } else {
        formContainer.style.display = 'block';
        statusGroup.style.display = config.type === 'expense' ? 'block' : 'none';
        submitBtn.innerText = config.type === 'sale' ? 'Registrar Venda' : 'Registrar Gasto';
        document.getElementById('stat-label').innerText = config.title;
        document.getElementById('stat-label-exp').innerText = config.title;
    }

    renderDashboard();
    renderHistory();
}

function renderIntegrationPage(pageId) {
    const content = document.getElementById('dashboard-content');
    if (pageId === 'bling_integration') {
        content.innerHTML = `
            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h2>Sincronização com Bling ERP</h2>
                        <p class="text-muted" style="font-size: 0.9rem;">Gerencie seus produtos e estoque do Bling diretamente no site.</p>
                    </div>
                    <button class="btn-primary" onclick="syncBlingProducts()" id="sync-btn" style="padding: 10px 20px;">
                        <i class="fas fa-sync-alt"></i> Sincronizar Agora
                    </button>
                </div>
                
                <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
                    <div class="glass-card" style="padding: 15px; text-align: center;">
                        <div class="text-muted" style="font-size: 0.8rem;">Status da Conexão</div>
                        <div style="color: #22c55e; font-weight: 600;"><i class="fas fa-check-circle"></i> Conectado</div>
                    </div>
                    <div class="glass-card" style="padding: 15px; text-align: center;">
                        <div class="text-muted" style="font-size: 0.8rem;">Última Sincronização</div>
                        <div id="last-sync-date">Nunca</div>
                    </div>
                    <div class="glass-card" style="padding: 15px; text-align: center;">
                        <div class="text-muted" style="font-size: 0.8rem;">Produtos Importados</div>
                        <div id="imported-count">0</div>
                    </div>
                </div>

                <div class="table-controls" style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <input type="text" id="bling-search" placeholder="Buscar por nome ou SKU..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;">
                    <select id="bling-filter-status" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;">
                        <option value="all">Todos os Status</option>
                        <option value="not_imported">Não Importados</option>
                        <option value="imported">Importados</option>
                        <option value="update_available">Atualização Disponível</option>
                    </select>
                </div>

                <div class="list-container" id="bling_products_list">
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        Clique em "Sincronizar Agora" para carregar seus produtos.
                    </div>
                </div>
            </div>
        `;
        renderBlingProductsList();
    }
}
async function syncBlingProducts() {
    const btn = document.getElementById('sync-btn');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/bling/sync');
        const data = await response.json();

        if (response.ok) {
            financialData.blingProducts = data.products;
            financialData.lastBlingSync = data.syncDate;
            saveData();
            renderIntegrationPage('bling_integration');
            alert('Sincronização concluída com sucesso!');
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
        alert('Erro ao conectar com a API de sincronização.');
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

function renderBlingProductsList() {
    const list = document.getElementById('bling_products_list');
    const products = financialData.blingProducts || [];
    const importedProducts = financialData.importedProducts || [];

    // Categorias disponíveis no site
    const categories = [
        { id: 'venda_piso_laminado', name: 'Piso Laminado' },
        { id: 'venda_piso_vinilico', name: 'Piso Vinílico' },
        { id: 'venda_drywall', name: 'Drywall' },
        { id: 'venda_divisorias', name: 'Divisórias' },
        { id: 'venda_papel', name: 'Papel de Parede' },
        { id: 'venda_persianas', name: 'Persianas' },
        { id: 'venda_espelhos', name: 'Espelhos e Box' },
        { id: 'venda_hidraulica', name: 'Hidráulica' },
        { id: 'venda_eletrica', name: 'Elétrica' },
        { id: 'venda_ferramentas', name: 'Ferramentas' },
        { id: 'venda_geral', name: 'Geral' }
    ];

    if (products.length === 0) return;

    list.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 10px;">Gestão de Catálogo (Estilo Shopify)</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.85rem;">
                        <th style="padding: 12px;">Produto</th>
                        <th style="padding: 12px;">Categoria No Site</th>
                        <th style="padding: 12px;">Preço</th>
                        <th style="padding: 12px;">Status</th>
                        <th style="padding: 12px; text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody id="bling-table-body">
                    ${products.map(product => {
        const localCopy = importedProducts.find(p => p.sku === product.sku);
        const isImported = !!localCopy;
        const isPublished = localCopy?.status === 'published';

        return `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 12px; display: flex; gap: 10px; align-items: center;">
                                <img src="${product.imagem || 'img/placeholder.png'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                                <div>
                                    <div style="font-weight: 500; font-size: 0.85rem;">${product.nome}</div>
                                    <div style="font-size: 0.7rem; color: #94a3b8;">SKU: ${product.sku}</div>
                                </div>
                            </td>
                            <td style="padding: 12px;">
                                <select onchange="updateProductCategory('${product.sku}', this.value)" style="padding: 5px; font-size: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 4px;">
                                    <option value="">Selecionar...</option>
                                    ${categories.map(c => `
                                        <option value="${c.id}" ${localCopy?.targetCategory === c.id ? 'selected' : ''}>${c.name}</option>
                                    `).join('')}
                                </select>
                            </td>
                            <td style="padding: 12px; font-size: 0.85rem;">R$ ${product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 12px;">
                                <span class="badge ${isPublished ? 'badge-paid' : (isImported ? 'badge-pending' : '')}" style="font-size: 0.65rem;">
                                    ${isPublished ? 'ATIVO' : (isImported ? 'INATIVO' : 'NOVO')}
                                </span>
                            </td>
                            <td style="padding: 12px; text-align: right;">
                                ${!isImported ? `
                                    <button class="btn-item-action" onclick="importProduct('${product.sku}')" title="Adicionar à Loja">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                ` : `
                                    <button class="btn-item-action" onclick="toggleProductStatus('${product.sku}')" style="color: ${isPublished ? '#ef4444' : '#22c55e'};" title="${isPublished ? 'Inativar' : 'Ativar'}">
                                        <i class="fas ${isPublished ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    </button>
                                `}
                            </td>
                        </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('last-sync-date').innerText = new Date(financialData.lastBlingSync).toLocaleString('pt-BR');
    const activeCount = importedProducts.filter(p => p.status === 'published').length;
    document.getElementById('imported-count').innerText = activeCount;
}

function updateProductCategory(sku, categoryId) {
    let product = financialData.importedProducts?.find(p => p.sku === sku);
    if (!product) {
        importProduct(sku);
        product = financialData.importedProducts.find(p => p.sku === sku);
    }
    product.targetCategory = categoryId;
    saveData();
}

function toggleProductStatus(sku) {
    const product = financialData.importedProducts.find(p => p.sku === sku);
    if (!product) return;
    product.status = product.status === 'published' ? 'draft' : 'published';
    saveData();
    renderIntegrationPage('bling_integration');
}

function importProduct(sku) {
    const product = financialData.blingProducts.find(p => p.sku === sku);
    if (!product) return;
    if (!financialData.importedProducts) financialData.importedProducts = [];
    if (financialData.importedProducts.some(p => p.sku === sku)) return;

    financialData.importedProducts.push({
        ...product,
        status: 'draft',
        importedAt: new Date().toISOString()
    });
    saveData();
    renderIntegrationPage('bling_integration');
}

// Data Logic
function handleSubmit() {
    const amountInput = document.getElementById('amount');
    const descInput = document.getElementById('desc');
    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;
    const status = document.getElementById('status').value;
    const config = PAGE_CONFIG[currentPage];

    if (isNaN(amount) || amount <= 0 || !desc) return alert('Por favor, preencha valor e descrição');

    const entry = {
        id: Date.now(),
        amount: amount,
        desc: desc,
        type: config.type,
        category: config.category,
        categoryId: currentPage,
        status: config.type === 'expense' ? status : 'paid',
        date: new Date().toISOString()
    };

    financialData.entries.unshift(entry);

    amountInput.value = '';
    descInput.value = '';

    saveData();
}

function toggleStatus(id) {
    const index = financialData.entries.findIndex(e => e.id === id);
    if (index !== -1) {
        financialData.entries[index].status = financialData.entries[index].status === 'paid' ? 'pending' : 'paid';
        saveData();
    }
}

function deleteEntry(id) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        financialData.entries = financialData.entries.filter(e => e.id !== id);
        saveData();
    }
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    let filteredEntries = financialData.entries;
    if (currentPage !== 'main') {
        filteredEntries = financialData.entries.filter(e => e.categoryId === currentPage);
    } else {
        // Show last 20 from all categories on main page
        filteredEntries = financialData.entries.slice(0, 20);
    }

    filteredEntries.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString('pt-BR');
        const badgeClass = entry.status === 'paid' ? 'badge-paid' : 'badge-pending';
        const statusText = entry.status === 'paid' ? 'Pago' : 'Pendente';
        const isExpense = entry.type === 'expense';
        const amountClass = isExpense ? 'amount-negative' : 'amount-positive';
        const prefix = isExpense ? '-' : '+';

        list.innerHTML += `
            <div class="item-row ${entry.type}">
                <div class="item-info">
                    <div class="title">${entry.desc}</div>
                    <div class="date">
                        ${date} | <strong>${entry.category || 'Geral'}</strong>
                        ${isExpense ? `| <span class="badge ${badgeClass}" onclick="toggleStatus(${entry.id})" style="cursor:pointer">${statusText}</span>` : ''}
                        | <i class="fas fa-trash" onclick="deleteEntry(${entry.id})" style="cursor:pointer; font-size: 0.8rem; margin-left: 5px; color: #94a3b8 hover:color: #ef4444"></i>
                    </div>
                </div>
                <div class="${amountClass}">${prefix} R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
        `;
    });
}

// Dashboard Calculation
function renderDashboard() {
    let sales = financialData.entries.filter(e => e.type === 'sale');
    let expenses = financialData.entries.filter(e => e.type === 'expense');

    if (currentPage !== 'main') {
        sales = sales.filter(e => e.categoryId === currentPage);
        expenses = expenses.filter(e => e.categoryId === currentPage);
    }

    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalPaidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const totalPendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = totalPaidExpenses + totalPendingExpenses;
    const balance = totalRevenue - totalPaidExpenses - totalPendingExpenses;

    document.getElementById('total-revenue').innerText = `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-expenses').innerText = `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('to-pay').innerText = `R$ ${totalPendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('projected-balance').innerText = `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Style balance
    const balEl = document.getElementById('projected-balance');
    if (balEl) {
        balEl.className = balance >= 0 ? 'value amount-positive' : 'value amount-negative';
    }
}
