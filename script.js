let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

let currentPage = 1;
const productsPerPage = 4;
let currentCategory = 'all';

function filterProducts(category) {
    currentCategory = category;
    currentPage = 1;

    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    displayProducts();

    const productsSection = document.getElementById("products-section");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function displayProducts() {
    const container = document.getElementById("products");
    const paginationContainer = document.getElementById("pagination");
    if (!container) return;

    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">لا توجد منتجات حالياً في هذا القسم.</p>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    container.innerHTML = paginatedProducts.map(product => {
        return `
            <div class="product" onclick="openProductModal(${product.id})">
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">${product.price} ر.س</div>
                    <button class="add" onclick="event.stopPropagation(); addToCart(${product.id})">
                        إضافة للحقيبة 🛒
                    </button>
                </div>
            </div>
        `;
    }).join("");

    renderPagination(filteredProducts.length);
}

function renderPagination(totalItems) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / productsPerPage);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `
            <button class="page-btn ${activeClass}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
    currentPage = page;
    displayProducts();

    const productsSection = document.getElementById("products-section");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openProductModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById("productModal");
    const content = document.getElementById("productModalDetails");

    content.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-detail-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="detail-price">${product.price} ر.س</div>
                <p class="detail-desc">قطع مختارة بعناية بتصميم عصري وجودة عالية.</p>
                <button class="add-large-btn" onclick="addToCart(${product.id}); closeProductModal();">
                    إضافة للحقيبة 🛒
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
}

function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    openCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    if (cartCount) cartCount.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = "<p style='text-align:center; padding: 20px; color:#888;'>الحقيبة فارغة حالياً</p>";
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div>
                        <h4 style="margin:0">${item.name}</h4>
                        <p style="margin:0; font-size:12px; color:#666">${item.price} ر.س × ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background:#ff4d4d; color:white; border:none; padding:4px 8px; border-radius:6px; cursor:pointer">إزالة</button>
                </div>
            `).join("");
        }
    }

    if (cartTotal) {
        cartTotal.innerText = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function openCart() {
    document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
    // إعادة إظهار النموذج وإخفاء رسالة النجاح للاستخدام القادم
    const form = document.getElementById("checkoutForm");
    const successMsg = document.getElementById("orderSuccessMessage");
    if (form) form.style.display = "block";
    if (successMsg) successMsg.style.display = "none";
}

// دالة معالجة الشراء المباشر وإرسال البيانات عبر البريد الإلكتروني
function handleDirectCheckout(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    const btn = document.getElementById("checkoutBtn");
    btn.innerText = "جاري تأكيد الطلب...";
    btn.disabled = true;

    // تجهيز قائمة المنتجات المطلوبة والإجمالي
    let itemsDetails = cart.map(item => `${item.name} (العدد: ${item.quantity})`).join(" | ");
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const templateParams = {
        order_id: orderId,
        from_name: document.getElementById("custName").value,
        phone: document.getElementById("custPhone").value,
        city: document.getElementById("custCity").value,
        address: document.getElementById("custAddress").value,
        items: itemsDetails,
        total: totalAmount + " ر.س"
    };

    // إرسال البريد عبر EmailJS باستخدام المفتاح الجديد
    emailjs.send('service_02r48sm', 'template_qzl4fu5', templateParams)
        .then(function() {
            // تصفير السلة
            cart = [];
            updateCart();

            // إخفاء النموذج وإظهار شاشة النجاح
            document.getElementById("checkoutForm").style.display = "none";
            document.getElementById("displayOrderId").innerText = orderId;
            document.getElementById("orderSuccessMessage").style.display = "block";

            btn.innerText = "تأكيد وإتمام الطلب الآن 🚚";
            btn.disabled = false;

            // فتح نافذة التقييم الاختياري
            setTimeout(() => {
                document.getElementById("reviewModal").style.display = "flex";
            }, 1000);
        }, function(error) {
            alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
            btn.innerText = "تأكيد وإتمام الطلب الآن 🚚";
            btn.disabled = false;
        });
}

function submitReview() {
    const name = document.getElementById("reviewerName").value.trim() || "عميل المتجر";
    const rating = parseInt(document.getElementById("reviewerRating").value);
    const comment = document.getElementById("reviewerComment").value.trim();

    if (comment) {
        reviews.unshift({ name, rating, comment });
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }

    document.getElementById("reviewModal").style.display = "none";
    alert("شكراً لتقييمك لموقعنا!");
}

function skipReview() {
    document.getElementById("reviewModal").style.display = "none";
}

function openReviewsModal() {
    displayReviews();
    document.getElementById("reviewsViewModal").style.display = "flex";
}

function closeReviewsModal() {
    document.getElementById("reviewsViewModal").style.display = "none";
}

function displayReviews() {
    const container = document.getElementById("testimonialsGrid");
    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #888; padding: 20px;">لا توجد تقييمات مكتوبة بعد. كن أول من يشاركنا رأيه!</p>`;
        return;
    }

    container.innerHTML = reviews.map(rev => {
        const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
        return `
            <div class="testimonial-card" style="background: #f9f9f9; padding: 15px; border-radius: 12px; margin-bottom: 12px;">
                <div class="stars" style="color: #ffc107; font-size: 14px; margin-bottom: 5px;">${stars}</div>
                <p style="margin: 5px 0; font-size: 13px; color: #333;">"${rev.comment}"</p>
                <h5 style="margin: 0; font-size: 12px; color: #777;">- ${rev.name}</h5>
            </div>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    updateCart();
});
