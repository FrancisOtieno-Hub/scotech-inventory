// Scotech Inventory - Appwrite Configuration
// Update these values with your Appwrite project details

const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1', // Your Appwrite Endpoint
    projectId: 'YOUR_PROJECT_ID', // Your Appwrite Project ID
    databaseId: 'scotech-inventory', // Database ID
    collections: {
        products: 'products',
        sales: 'sales',
        inventory: 'inventory',
        categories: 'categories',
        users: 'users'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = appwriteConfig;
}
