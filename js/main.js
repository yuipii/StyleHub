// Main application functionality
class FashionStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.compare = JSON.parse(localStorage.getItem('compare')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.updateWishlistCount();
        this.loadNewArrivals();
        this.setupMobileNavigation();
    }
    
    setupEventListeners() {
        // Cart functionality
        document.getElementById('cartBtn')?.addEventListener('click', () => this.openCart());
        document.getElementById('mobileCartBtn')?.addEventListener('click', () => this.openCart());
        
        // Wishlist functionality
        document.getElementById('wishlistBtn')?.addEventListener('click', () => this.openWishlist());
        
        // Auth functionality
        document.getElementById('authBtn')?.addEventListener('click', () => this.openAuthModal());
        document.getElementById('mobileProfileBtn')?.addEventListener('click', () => this.openAuthModal());
        
        // Search functionality
        document.getElementById('mobileSearchBtn')?.addEventListener('click', () => this.focusSearch());
        
        // Navigation
        this.setupNavigation();
    }
    
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Mobile menu toggle
        this.setupMobileMenu();
    }
    
    setupMobileMenu() {
        // Add mobile menu toggle if needed
    }
    
    setupMobileNavigation() {
        // Highlight current page in mobile nav
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    loadNewArrivals() {
        const newArrivalsGrid = document.getElementById('newArrivalsGrid');
        if (!newArrivalsGrid) return;
        
        const newProducts = this.getNewProducts().slice(0, 8);
        newArrivalsGrid.innerHTML = newProducts.map(product => this.createProductCard(product)).join('');
    }
    
    getNewProducts() {
        // Mock data - in real app this would come from API
        return [
            {
                id: 1,
                name: "Платье миди с цветочным принтом",
                brand: "Zara",
                price: 3990,
                oldPrice: 5990,
                image: "images/products/dress1.jpg",
                badges: ['new'],
                sizes: ['XS', 'S', 'M', 'L']
            },
            {
                id: 2,
                name: "Кроссовки кожаные белые",
                brand: "Nike",
                price: 8990,
                image: "images/products/sneakers1.jpg",
                badges: ['hit'],
                sizes: ['36', '37', '38', '39', '40']
            },
            // Add more products...
        ];
    }
    
    createProductCard(product) {
        const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-badges">
                        ${product.badges.map(badge => `<span class="product-badge badge-${badge}">${this.getBadgeText(badge)}</span>`).join('')}
                        ${discount > 0 ? `<span class="product-badge badge-sale">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn wishlist-btn" onclick="store.toggleWishlist(${product.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
                            </svg>
                        </button>
                        <button class="action-btn compare-btn" onclick="store.toggleCompare(${product.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-sizes">
                        ${product.sizes.map(size => `<span class="size-option">${size}</span>`).join('')}
                    </div>
                    <button class="add-to-cart" onclick="store.addToCart(${product.id})">
                        В корзину
                    </button>
                </div>
            </div>
        `;
    }
    
    getBadgeText(badge) {
        const badges = {
            'new': 'Новинка',
            'sale': 'Sale',
            'hit': 'Хит'
        };
        return badges[badge] || badge;
    }
    
    addToCart(productId) {
        const product = this.getProductById(productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                selectedSize: product.sizes[0]
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification('Товар добавлен в корзину');
    }
    
    toggleWishlist(productId) {
        const index = this.wishlist.findIndex(item => item.id === productId);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showNotification('Товар удален из избранного');
        } else {
            const product = this.getProductById(productId);
            if (product) {
                this.wishlist.push(product);
                this.showNotification('Товар добавлен в избранное');
            }
        }
        
        this.saveWishlist();
        this.updateWishlistCount();
    }
    
    toggleCompare(productId) {
        const index = this.compare.findIndex(item => item.id === productId);
        
        if (index > -1) {
            this.compare.splice(index, 1);
            this.showNotification('Товар удален из сравнения');
        } else {
            if (this.compare.length >= 4) {
                this.showNotification('Можно сравнивать не более 4 товаров', 'error');
                return;
            }
            
            const product = this.getProductById(productId);
            if (product) {
                this.compare.push(product);
                this.showNotification('Товар добавлен к сравнению');
            }
        }
        
        this.saveCompare();
    }
    
    getProductById(id) {
        // In real app, this would fetch from API
        const allProducts = this.getNewProducts();
        return allProducts.find(product => product.id === id);
    }
    
    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.action-count, .mobile-badge').forEach(element => {
            if (element.closest('#cartBtn') || element.closest('#mobileCartBtn')) {
                element.textContent = count;
            }
        });
    }
    
    updateWishlistCount() {
        const count = this.wishlist.length;
        document.querySelectorAll('.action-count').forEach(element => {
            if (element.closest('#wishlistBtn')) {
                element.textContent = count;
            }
        });
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }
    
    saveCompare() {
        localStorage.setItem('compare', JSON.stringify(this.compare));
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error)' : 'var(--success)'};
            color: white;
            padding: 16px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Close on click
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    openCart() {
        window.location.href = 'cart.html';
    }
    
    openWishlist() {
        window.location.href = 'wishlist.html';
    }
    
    openAuthModal() {
        // Implement auth modal
        this.showNotification('Функция авторизации будет реализована позже', 'info');
    }
    
    focusSearch() {
        document.getElementById('searchInput')?.focus();
    }
}

// Initialize the store
const store = new FashionStore();

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);