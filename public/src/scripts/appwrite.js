// Scotech Inventory - Appwrite Service Layer
const { Client, Databases, Account, ID, Query } = Appwrite;

class AppwriteService {
    constructor() {
        this.client = new Client();
        this.databases = null;
        this.account = null;
        this.initialized = false;
        this.ID = ID; // Expose ID for creating unique IDs
    }

    // Initialize Appwrite
    init() {
        if (this.initialized) return;

        try {
            this.client
                .setEndpoint(appwriteConfig.endpoint)
                .setProject(appwriteConfig.projectId);

            this.databases = new Databases(this.client);
            this.account = new Account(this.client);
            this.initialized = true;

            console.log('✅ Appwrite initialized');
            console.log('📌 Project ID:', appwriteConfig.projectId);
            
            if (appwriteConfig.projectId === 'YOUR_PROJECT_ID') {
                console.error('⚠️ IMPORTANT: Update your Project ID in public/src/scripts/config.js');
                console.error('⚠️ Get it from: https://cloud.appwrite.io/console/project-YOUR_ID/settings');
            }
        } catch (error) {
            console.error('❌ Appwrite initialization failed:', error);
            console.error('📝 Check your config.js file');
        }
    }

    // ========== AUTHENTICATION ==========

    async login(email, password) {
        try {
            const session = await this.account.createEmailPasswordSession(email, password);
            return { success: true, data: session };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await this.account.deleteSession('current');
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== PRODUCTS ==========

    async getProducts(limit = 100, offset = 0) {
        try {
            const response = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt')
                ]
            );
            return { success: true, data: response.documents || [], total: response.total || 0 };
        } catch (error) {
            console.error('Failed to get products:', error);
            this.handleCORSError(error);
            return { success: false, error: error.message, data: [] };
        }
    }

    handleCORSError(error) {
        if (error.code === 403 || (error.message && error.message.includes('403'))) {
            console.error('');
            console.error('🔒 CORS/403 Error Detected!');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('📍 Fix this in Appwrite Console:');
            console.error('   1. Go to: https://cloud.appwrite.io/console');
            console.error('   2. Select your project');
            console.error('   3. Settings → Platforms');
            console.error('   4. Add Web Platform with your domain');
            console.error('   5. Hostname: ' + window.location.hostname);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('');
        }
    }

    async getProduct(productId) {
        try {
            const product = await this.databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                productId
            );
            return { success: true, data: product };
        } catch (error) {
            console.error('Failed to get product:', error);
            return { success: false, error: error.message };
        }
    }

    async createProduct(productData) {
        try {
            const product = await this.databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                ID.unique(),
                productData
            );
            return { success: true, data: product };
        } catch (error) {
            console.error('Failed to create product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, updates) {
        try {
            const product = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                productId,
                updates
            );
            return { success: true, data: product };
        } catch (error) {
            console.error('Failed to update product:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        try {
            await this.databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                productId
            );
            return { success: true };
        } catch (error) {
            console.error('Failed to delete product:', error);
            return { success: false, error: error.message };
        }
    }

    async searchProducts(searchTerm) {
        try {
            const response = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.products,
                [
                    Query.search('name', searchTerm)
                ]
            );
            return { success: true, data: response.documents };
        } catch (error) {
            console.error('Failed to search products:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== SALES ==========

    async getSales(limit = 100, offset = 0) {
        try {
            const response = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.sales,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt')
                ]
            );
            return { success: true, data: response.documents || [], total: response.total || 0 };
        } catch (error) {
            console.error('Failed to get sales:', error);
            this.handleCORSError(error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async createSale(saleData) {
        try {
            const sale = await this.databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.sales,
                ID.unique(),
                {
                    ...saleData,
                    date: new Date().toISOString(),
                    status: 'completed'
                }
            );

            // Update inventory
            if (saleData.productId && saleData.quantity) {
                await this.updateInventory(saleData.productId, -saleData.quantity);
            }

            return { success: true, data: sale };
        } catch (error) {
            console.error('Failed to create sale:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== INVENTORY ==========

    async getInventory(filter = 'all') {
        try {
            let queries = [
                Query.orderDesc('$createdAt')
            ];

            if (filter === 'low') {
                queries.push(Query.lessThan('quantity', 20));
            } else if (filter === 'out') {
                queries.push(Query.equal('quantity', 0));
            }

            const response = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.inventory,
                queries
            );
            return { success: true, data: response.documents || [] };
        } catch (error) {
            console.error('Failed to get inventory:', error);
            this.handleCORSError(error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async updateInventory(productId, quantityChange) {
        try {
            // Get current inventory
            const inventoryResponse = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.inventory,
                [Query.equal('productId', productId)]
            );

            if (inventoryResponse.documents.length > 0) {
                const inventory = inventoryResponse.documents[0];
                const newQuantity = Math.max(0, inventory.quantity + quantityChange);

                await this.databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.inventory,
                    inventory.$id,
                    { quantity: newQuantity }
                );
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to update inventory:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== CATEGORIES ==========

    async getCategories() {
        try {
            const response = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.categories
            );
            return { success: true, data: response.documents };
        } catch (error) {
            console.error('Failed to get categories:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== ANALYTICS ==========

    async getDashboardStats() {
        try {
            // Get sales for revenue calculation (with reduced limit to avoid CORS issues)
            const salesResponse = await this.getSales(100, 0);
            const sales = salesResponse.data || [];

            // Calculate total revenue
            const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

            // Get inventory count
            const inventoryResponse = await this.getInventory();
            const inventory = inventoryResponse.data || [];
            const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

            // Get low stock count
            const lowStockResponse = await this.getInventory('low');
            const lowStockCount = lowStockResponse.data?.length || 0;

            return {
                success: true,
                data: {
                    totalRevenue,
                    totalItems,
                    totalSales: sales.length,
                    lowStockAlerts: lowStockCount
                }
            };
        } catch (error) {
            console.error('Failed to get dashboard stats:', error);
            
            // Check if it's a CORS/403 error
            if (error.message && error.message.includes('403')) {
                console.error('🔒 403 Error - Check Appwrite Platform Settings:');
                console.error('   1. Go to your Appwrite Console');
                console.error('   2. Settings > Platforms');
                console.error('   3. Add your domain (e.g., scotech-inventory.vercel.app)');
                console.error('   4. For localhost add: localhost, 127.0.0.1');
            }
            
            return { 
                success: false, 
                error: error.message,
                data: {
                    totalRevenue: 0,
                    totalItems: 0,
                    totalSales: 0,
                    lowStockAlerts: 0
                }
            };
        }
    }
}

// Create and export singleton instance
const appwriteService = new AppwriteService();
