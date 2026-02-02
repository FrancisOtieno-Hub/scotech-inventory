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
                const stats = statsResult.data;
                // Stats will be animated on page load
                // Store values for animation
                this.statsData = stats;
            } else {
                // Use demo data if Appwrite not configured
                this.statsData = {
                    totalRevenue: 45890,
                    totalItems: 1234,
                    totalSales: 892,
                    lowStockAlerts: 23
                };
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Use demo data
            this.statsData = {
                totalRevenue: 45890,
                totalItems: 1234,
                totalSales: 892,
                lowStockAlerts: 23
            };
        }
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
                
                // Format based on content
                if (element.textContent.includes('$')) {
                    element.textContent = `$${currentValue.toLocaleString()}`;
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
            
            if (result.success && result.data.length > 0) {
                this.renderInventory(result.data);
            } else {
                // Use demo data
                this.renderInventory(this.getDemoInventory());
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            this.renderInventory(this.getDemoInventory());
        }
    }

    renderInventory(items) {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        if (items.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <h3>No items found</h3>
                    <p>Try adjusting your filters or add new products</p>
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
                        <div class="inventory-price">$${item.price.toFixed(2)}</div>
                        <div class="inventory-quantity">${item.quantity} units</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getDemoInventory() {
        return [
            { name: 'MacBook Pro 16"', sku: 'MBP-16-2024', price: 2499, quantity: 15 },
            { name: 'iPhone 15 Pro Max', sku: 'IP-15PM-BLK', price: 1199, quantity: 5 },
            { name: 'Samsung Galaxy S24', sku: 'SGS-24-GRY', price: 899, quantity: 32 },
            { name: 'Dell XPS 13', sku: 'DXPS-13-SLV', price: 1299, quantity: 0 },
            { name: 'iPad Pro 12.9"', sku: 'IPD-PRO-12', price: 1099, quantity: 18 },
            { name: 'Sony WH-1000XM5', sku: 'SNY-XM5-BLK', price: 399, quantity: 45 }
        ];
    }

    async loadSalesData() {
        const salesTableBody = document.getElementById('salesTableBody');
        if (!salesTableBody) return;

        salesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

        try {
            const result = await appwriteService.getSales(50, 0);
            
            if (result.success && result.data.length > 0) {
                this.renderSales(result.data);
            } else {
                this.renderSales(this.getDemoSales());
            }
        } catch (error) {
            console.error('Error loading sales:', error);
            this.renderSales(this.getDemoSales());
        }
    }

    renderSales(sales) {
        const salesTableBody = document.getElementById('salesTableBody');
        if (!salesTableBody) return;

        if (sales.length === 0) {
            salesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No sales found</td></tr>';
            return;
        }

        salesTableBody.innerHTML = sales.map((sale, index) => `
            <tr>
                <td>#${1000 + index}</td>
                <td>${new Date(sale.date || Date.now()).toLocaleDateString()}</td>
                <td>${sale.productName || 'Product'}</td>
                <td>${sale.quantity || 1}</td>
                <td>$${(sale.amount || 0).toFixed(2)}</td>
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

    getDemoSales() {
        return [
            { date: new Date(), productName: 'MacBook Pro 16"', quantity: 1, amount: 2499, status: 'completed' },
            { date: new Date(Date.now() - 86400000), productName: 'iPhone 15 Pro', quantity: 2, amount: 2398, status: 'completed' },
            { date: new Date(Date.now() - 172800000), productName: 'iPad Pro', quantity: 1, amount: 1099, status: 'pending' }
        ];
    }

    async loadProductsData() {
        console.log('Loading products data...');
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

    showNewSaleModal() {
        const modal = this.createModal('New Sale', `
            <form id="newSaleForm">
                <div class="form-group">
                    <label class="form-label">Product</label>
                    <select class="form-select" id="saleProduct" required>
                        <option value="">Select product</option>
                        <option value="1">MacBook Pro 16"</option>
                        <option value="2">iPhone 15 Pro Max</option>
                        <option value="3">Samsung Galaxy S24</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-input" id="saleQuantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" class="form-input" id="saleAmount" step="0.01" required>
                </div>
            </form>
        `, () => this.submitNewSale());
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
                    <label class="form-label">Price</label>
                    <input type="number" class="form-input" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-input" id="productQuantity" min="0" required>
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
        const product = document.getElementById('saleProduct').value;
        const quantity = parseInt(document.getElementById('saleQuantity').value);
        const amount = parseFloat(document.getElementById('saleAmount').value);

        if (!product || !quantity || !amount) {
            alert('Please fill all fields');
            return;
        }

        // Submit to Appwrite (or use demo mode)
        console.log('New sale:', { product, quantity, amount });
        
        this.closeModal();
        this.showNotification('Sale recorded successfully!', 'success');
    }

    async submitNewProduct() {
        const name = document.getElementById('productName').value;
        const sku = document.getElementById('productSKU').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const quantity = parseInt(document.getElementById('productQuantity').value);

        if (!name || !sku || !price || quantity < 0) {
            alert('Please fill all fields');
            return;
        }

        console.log('New product:', { name, sku, price, quantity });
        
        this.closeModal();
        this.showNotification('Product added successfully!', 'success');
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

    showNotifications() {
        console.log('Show notifications');
    }

    handleSearch() {
        console.log('Search');
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
