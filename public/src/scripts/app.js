// Scotech Inventory - Main Application Logic

class ScotechApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarOpen = false;
        this.init();
    }

    async init() {
        // Initialize Appwrite
        appwriteService.init();

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    async setupApp() {
        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            
            loadingScreen.classList.add('hidden');
            app.style.display = 'grid';
            
            // Animate stats
            this.animateStats();
        }, 1500);

        // Setup event listeners
        this.setupEventListeners();

        // Load initial data
        await this.loadDashboardData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Header buttons
        const searchBtn = document.getElementById('searchBtn');
        const notificationBtn = document.getElementById('notificationBtn');
        const addNewBtn = document.getElementById('addNewBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (searchBtn) searchBtn.addEventListener('click', () => this.handleSearch());
        if (notificationBtn) notificationBtn.addEventListener('click', () => this.showNotifications());
        if (addNewBtn) addNewBtn.addEventListener('click', () => this.showAddNewModal());
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Inventory search
        const inventorySearch = document.getElementById('inventorySearch');
        if (inventorySearch) {
            inventorySearch.addEventListener('input', (e) => this.searchInventory(e.target.value));
        }

        // Inventory filters
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterInventory(btn.dataset.filter);
            });
        });

        // New sale button
        const newSaleBtn = document.getElementById('newSaleBtn');
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => this.showNewSaleModal());
        }

        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // Product search
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }
    }

    navigateTo(page) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show selected page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update page title and breadcrumb
        const pageTitle = document.getElementById('pageTitle');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const title = page.charAt(0).toUpperCase() + page.slice(1);
        
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = title;

        this.currentPage = page;

        // Load page-specific data
        this.loadPageData(page);

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'inventory':
                await this.loadInventoryData();
                break;
            case 'sales':
                await this.loadSalesData();
                break;
            case 'products':
                await this.loadProductsData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const statsResult = await appwriteService.getDashboardStats();
            
            if (statsResult.success) {
                this.statsData = statsResult.data;
                // Update data-value attributes
                this.updateStatsValues(statsResult.data);
                // Update notification badge
                this.updateNotificationBadge(statsResult.data.lowStockAlerts);
            } else {
                console.warn('Using empty stats - configure Appwrite to see real data');
                this.statsData = {
                    totalRevenue: 0,
                    totalItems: 0,
                    totalSales: 0,
                    lowStockAlerts: 0
                };
                this.updateNotificationBadge(0);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.statsData = {
                totalRevenue: 0,
                totalItems: 0,
                totalSales: 0,
                lowStockAlerts: 0
            };
            this.updateNotificationBadge(0);
        }
    }

    updateNotificationBadge(count) {
        const badge = document.querySelector('.notifications .badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateStatsValues(stats) {
        // Update data-value attributes for animation
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            const valueEl = card.querySelector('.stat-value');
            if (valueEl) {
                switch(index) {
                    case 0: // Revenue
                        valueEl.setAttribute('data-value', stats.totalRevenue || 0);
                        break;
                    case 1: // Items
                        valueEl.setAttribute('data-value', stats.totalItems || 0);
                        break;
                    case 2: // Sales
                        valueEl.setAttribute('data-value', stats.totalSales || 0);
                        break;
                    case 3: // Alerts
                        valueEl.setAttribute('data-value', stats.lowStockAlerts || 0);
                        break;
                }
            }
        });
    }

    animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(element => {
            const targetValue = parseInt(element.dataset.value) || 0;
            const duration = 2000; // 2 seconds
            const startTime = Date.now();
            
            const updateValue = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(targetValue * easeOut);
                
                // Format with KES currency
                if (element.parentElement.parentElement.querySelector('.stat-icon.revenue')) {
                    element.textContent = `KES ${currentValue.toLocaleString()}`;
                } else {
                    element.textContent = currentValue.toLocaleString();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateValue);
                }
            };
            
            updateValue();
        });
    }

    async loadInventoryData(filter = 'all') {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        // Show loading state
        inventoryGrid.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';

        try {
            const result = await appwriteService.getInventory(filter);
            
            if (result.success) {
                this.renderInventory(result.data);
            } else {
                console.warn('Configure Appwrite to see inventory data');
                this.renderInventory([]);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            this.renderInventory([]);
        }
    }

    renderInventory(items) {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        // Handle undefined or null items
        if (!items || items.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <h3>No items found</h3>
                    <p>Add products to start tracking inventory</p>
                    <button class="btn-primary" onclick="scotechApp.showAddProductModal()" style="margin-top: 1rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Product</span>
                    </button>
                </div>
            `;
            return;
        }

        inventoryGrid.innerHTML = items.map(item => {
            const stockStatus = item.quantity === 0 ? 'out-of-stock' : 
                               item.quantity < 20 ? 'low-stock' : 'in-stock';
            const stockText = item.quantity === 0 ? 'Out of Stock' : 
                             item.quantity < 20 ? 'Low Stock' : 'In Stock';

            return `
                <div class="inventory-item">
                    <div class="inventory-header">
                        <div>
                            <div class="inventory-name">${item.name}</div>
                            <div class="inventory-sku">SKU: ${item.sku || 'N/A'}</div>
                        </div>
                        <div class="stock-badge ${stockStatus}">${stockText}</div>
                    </div>
                    <div class="inventory-details">
                        <div class="inventory-price">KES ${item.price.toLocaleString()}</div>
                        <div class="inventory-quantity">${item.quantity} units</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadSalesData() {
        const salesTableBody = document.getElementById('salesTableBody');
        if (!salesTableBody) return;

        salesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

        try {
            const result = await appwriteService.getSales(50, 0);
            
            if (result.success) {
                this.renderSales(result.data);
            } else {
                console.warn('Configure Appwrite to see sales data');
                this.renderSales([]);
            }
        } catch (error) {
            console.error('Error loading sales:', error);
            this.renderSales([]);
        }
    }

    renderSales(sales) {
        const salesTableBody = document.getElementById('salesTableBody');
        if (!salesTableBody) return;

        // Handle undefined or null sales
        if (!sales || sales.length === 0) {
            salesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding: 3rem;">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <h3>No sales recorded yet</h3>
                            <p>Start by recording your first sale</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        salesTableBody.innerHTML = sales.map((sale, index) => `
            <tr>
                <td>#${1000 + index}</td>
                <td>${new Date(sale.date || Date.now()).toLocaleDateString()}</td>
                <td>${sale.productName || 'Product'}</td>
                <td>${sale.quantity || 1}</td>
                <td>KES ${(sale.amount || 0).toLocaleString()}</td>
                <td><span class="status-badge ${sale.status || 'completed'}">${sale.status || 'Completed'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-icon-btn" title="View">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="action-icon-btn" title="Print">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadProductsData() {
        const productsTableBody = document.getElementById('productsTableBody');
        if (!productsTableBody) return;

        productsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

        try {
            const result = await appwriteService.getProducts(100, 0);
            
            if (result.success) {
                this.renderProducts(result.data);
            } else {
                console.warn('Configure Appwrite to see products');
                this.renderProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.renderProducts([]);
        }
    }

    renderProducts(products) {
        const productsTableBody = document.getElementById('productsTableBody');
        if (!productsTableBody) return;

        // Handle undefined or null products
        if (!products || products.length === 0) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding: 3rem;">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                            </svg>
                            <h3>No products yet</h3>
                            <p>Add your first product to get started</p>
                            <button class="btn-primary" onclick="scotechApp.showAddProductModal()" style="margin-top: 1rem;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Add Product</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        productsTableBody.innerHTML = products.map(product => {
            // Get inventory quantity
            const quantity = product.quantity || 0;
            const stockStatus = quantity === 0 ? 'out-of-stock' : 
                               quantity < 20 ? 'low-stock' : 'in-stock';
            const stockText = quantity === 0 ? 'Out of Stock' : 
                             quantity < 20 ? 'Low Stock' : 'In Stock';

            return `
                <tr>
                    <td><strong>${product.name}</strong></td>
                    <td><code style="background: var(--color-cream); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem;">${product.sku || 'N/A'}</code></td>
                    <td>${product.category || 'Uncategorized'}</td>
                    <td><strong style="color: var(--color-terracotta); font-family: var(--font-mono);">KES ${product.price.toLocaleString()}</strong></td>
                    <td>${quantity} units</td>
                    <td><span class="stock-badge ${stockStatus}">${stockText}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-icon-btn" title="Edit" onclick="scotechApp.editProduct('${product.$id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="action-icon-btn" title="Delete" onclick="scotechApp.deleteProduct('${product.$id}', '${product.name}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async searchProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.loadProductsData();
            return;
        }

        try {
            const result = await appwriteService.searchProducts(searchTerm);
            if (result.success) {
                this.renderProducts(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async editProduct(productId) {
        // TODO: Implement edit functionality
        console.log('Edit product:', productId);
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    async deleteProduct(productId, productName) {
        if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
            return;
        }

        try {
            const result = await appwriteService.deleteProduct(productId);
            if (result.success) {
                this.showNotification('Product deleted successfully!', 'success');
                this.loadProductsData();
            } else {
                this.showNotification('Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Error deleting product', 'error');
        }
    }

    async loadAnalyticsData() {
        console.log('Loading analytics data...');
    }

    filterInventory(filter) {
        this.loadInventoryData(filter);
    }

    async searchInventory(searchTerm) {
        if (!searchTerm.trim()) {
            this.loadInventoryData();
            return;
        }

        try {
            const result = await appwriteService.searchProducts(searchTerm);
            if (result.success) {
                this.renderInventory(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    handleQuickAction(action) {
        console.log('Quick action:', action);
        
        switch (action) {
            case 'new-sale':
                this.showNewSaleModal();
                break;
            case 'add-product':
                this.showAddProductModal();
                break;
            case 'update-inventory':
                this.navigateTo('inventory');
                break;
            case 'view-reports':
                this.navigateTo('analytics');
                break;
        }
    }

    async showNewSaleModal() {
        // Load products for dropdown
        const productsResult = await appwriteService.getProducts(100, 0);
        const products = productsResult.success ? productsResult.data : [];
        
        const productOptions = products.length > 0 
            ? products.map(p => `<option value="${p.$id}" data-price="${p.price}" data-name="${p.name}">${p.name} - KES ${p.price.toLocaleString()}</option>`).join('')
            : '<option value="">No products available - Add products first</option>';

        const modal = this.createModal('New Sale', `
            <form id="newSaleForm">
                <div class="form-group">
                    <label class="form-label">Product</label>
                    <select class="form-select" id="saleProduct" required onchange="scotechApp.updateSaleAmount()">
                        <option value="">Select product</option>
                        ${productOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-input" id="saleQuantity" min="1" value="1" required onchange="scotechApp.updateSaleAmount()">
                </div>
                <div class="form-group">
                    <label class="form-label">Amount (KES)</label>
                    <input type="number" class="form-input" id="saleAmount" step="0.01" required readonly>
                </div>
            </form>
        `, () => this.submitNewSale());
    }

    updateSaleAmount() {
        const productSelect = document.getElementById('saleProduct');
        const quantityInput = document.getElementById('saleQuantity');
        const amountInput = document.getElementById('saleAmount');

        if (productSelect && quantityInput && amountInput) {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
            const quantity = parseInt(quantityInput.value) || 0;
            amountInput.value = (price * quantity).toFixed(2);
        }
    }

    showAddProductModal() {
        const modal = this.createModal('Add Product', `
            <form id="addProductForm">
                <div class="form-group">
                    <label class="form-label">Product Name</label>
                    <input type="text" class="form-input" id="productName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">SKU</label>
                    <input type="text" class="form-input" id="productSKU" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <input type="text" class="form-input" id="productCategory" placeholder="e.g., Electronics, Furniture">
                </div>
                <div class="form-group">
                    <label class="form-label">Price (KES)</label>
                    <input type="number" class="form-input" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Quantity</label>
                    <input type="number" class="form-input" id="productQuantity" min="0" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description (Optional)</label>
                    <textarea class="form-textarea" id="productDescription" rows="3"></textarea>
                </div>
            </form>
        `, () => this.submitNewProduct());
    }

    showAddNewModal() {
        this.showAddProductModal();
    }

    createModal(title, content, onSubmit) {
        const modalContainer = document.getElementById('modalContainer');
        
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" id="modalClose">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="modalCancel">Cancel</button>
                        <button class="btn-primary" id="modalSubmit">Submit</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSubmit').addEventListener('click', onSubmit);

        // Close on overlay click
        modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    }

    async submitNewSale() {
        const productSelect = document.getElementById('saleProduct');
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = productSelect.value;
        const productName = selectedOption.getAttribute('data-name');
        const quantity = parseInt(document.getElementById('saleQuantity').value);
        const amount = parseFloat(document.getElementById('saleAmount').value);

        if (!productId || !quantity || !amount) {
            alert('Please fill all fields');
            return;
        }

        try {
            const result = await appwriteService.createSale({
                productId,
                productName,
                quantity,
                amount
            });

            if (result.success) {
                this.closeModal();
                this.showNotification('Sale recorded successfully!', 'success');
                // Reload sales and dashboard
                this.loadSalesData();
                this.loadDashboardData();
                this.animateStats();
            } else {
                this.showNotification('Failed to record sale: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Sale error:', error);
            this.showNotification('Error recording sale', 'error');
        }
    }

    async submitNewProduct() {
        const name = document.getElementById('productName').value;
        const sku = document.getElementById('productSKU').value;
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const quantity = parseInt(document.getElementById('productQuantity').value);
        const description = document.getElementById('productDescription').value;

        if (!name || !sku || !price || quantity < 0) {
            alert('Please fill all required fields');
            return;
        }

        try {
            // Create product
            const productResult = await appwriteService.createProduct({
                name,
                sku,
                category: category || 'Uncategorized',
                price,
                description: description || ''
            });

            if (productResult.success) {
                // Create inventory entry
                const inventoryResult = await appwriteService.databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.inventory,
                    appwriteService.ID?.unique() || Date.now().toString(),
                    {
                        productId: productResult.data.$id,
                        name,
                        sku,
                        quantity,
                        price
                    }
                );

                this.closeModal();
                this.showNotification('Product added successfully!', 'success');
                
                // Reload relevant data
                this.loadProductsData();
                this.loadInventoryData();
                this.loadDashboardData();
                this.animateStats();
            } else {
                this.showNotification('Failed to add product: ' + productResult.error, 'error');
            }
        } catch (error) {
            console.error('Product creation error:', error);
            this.showNotification('Error adding product', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-terracotta);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async showNotifications() {
        // Get low stock items for notifications
        const lowStockResult = await appwriteService.getInventory('low');
        const lowStockItems = lowStockResult.success ? lowStockResult.data : [];

        const notificationsList = lowStockItems.length > 0 
            ? lowStockItems.map(item => `
                <div class="notification-item" style="padding: 1rem; border-bottom: 1px solid var(--color-cream);">
                    <div style="display: flex; gap: 1rem; align-items: start;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(200, 74, 74, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2" style="width: 20px; height: 20px;">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Low Stock Alert</div>
                            <div style="font-size: 0.875rem; color: var(--color-slate);">
                                ${item.name} • Only ${item.quantity} left
                            </div>
                            <div style="font-size: 0.75rem; color: var(--color-slate-light); margin-top: 0.25rem;">
                                Just now
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div style="text-align: center; padding: 3rem; color: var(--color-slate);">No notifications</div>';

        this.createModal('Notifications', `
            <div style="max-height: 500px; overflow-y: auto;">
                ${notificationsList}
            </div>
        `, null);

        // Hide submit button
        const submitBtn = document.getElementById('modalSubmit');
        if (submitBtn) submitBtn.style.display = 'none';

        // Update notification badge
        const badge = document.querySelector('.notifications .badge');
        if (badge && lowStockItems.length === 0) {
            badge.style.display = 'none';
        }
    }

    handleSearch() {
        const searchModal = this.createModal('Search', `
            <div class="form-group">
                <input type="text" class="form-input" id="globalSearch" placeholder="Search products, sales, inventory..." autofocus>
            </div>
            <div id="searchResults" style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
                <p style="text-align: center; color: var(--color-slate);">Start typing to search...</p>
            </div>
        `, null);

        // Remove submit button for search modal
        const submitBtn = document.getElementById('modalSubmit');
        if (submitBtn) submitBtn.style.display = 'none';

        const searchInput = document.getElementById('globalSearch');
        const resultsDiv = document.getElementById('searchResults');

        let searchTimeout;
        searchInput.addEventListener('input', async (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 2) {
                resultsDiv.innerHTML = '<p style="text-align: center; color: var(--color-slate);">Start typing to search...</p>';
                return;
            }

            resultsDiv.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';

            searchTimeout = setTimeout(async () => {
                try {
                    const results = await appwriteService.searchProducts(query);
                    
                    if (results.success && results.data.length > 0) {
                        resultsDiv.innerHTML = results.data.map(product => `
                            <div class="search-result-item" style="padding: 1rem; border-bottom: 1px solid var(--color-cream); cursor: pointer;" 
                                 onclick="scotechApp.closeModal(); scotechApp.navigateTo('products');">
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${product.name}</div>
                                <div style="font-size: 0.875rem; color: var(--color-slate);">
                                    SKU: ${product.sku} • KES ${product.price.toLocaleString()}
                                </div>
                            </div>
                        `).join('');
                    } else {
                        resultsDiv.innerHTML = '<p style="text-align: center; color: var(--color-slate);">No results found</p>';
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    resultsDiv.innerHTML = '<p style="text-align: center; color: var(--color-danger);">Search failed</p>';
                }
            }, 300);
        });
    }

    async handleLogout() {
        const result = await appwriteService.logout();
        if (result.success) {
            window.location.reload();
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
        this.sidebarOpen = !this.sidebarOpen;
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
        this.sidebarOpen = false;
    }
}

// Initialize app
const scotechApp = new ScotechApp();
