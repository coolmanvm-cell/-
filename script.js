let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

let currentPage = 1;
const productsPerPage = 6;
let currentCategory = 'all';

function filterProducts(category) {
    currentCategory = category;
    currentPage = 1;

    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    displayProducts();
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
        <div style="text-align: center;">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h2 style="font-size: 20px; margin-bottom: 5px;">${product.name}</h2>
            <div style="font-size: 22px; font-weight: bold; color: #28a745; margin-bottom: 15px;">${product.price} ر.س</div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">تصميم عصري وجودة عالية خامة ممتازة ومريحة فيالارتداء.</p>
            <button class="submit-btn" onclick="addToCart(${product.id}); closeProductModal();">
                إضافة للحقيبة 🛒
            </button>
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
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <div>
                        <h4 style="margin:0; font-size: 15px;">${item.name}</h4>
                        <p style="margin:0; font-size:13px; color:#666">${item.price} ر.س × ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size: 12px;">إزالة</button>
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
    const form = document.getElementById("checkoutForm");
    const successMsg = document.getElementById("orderSuccessMessage");
    if (form) form.style.display = "flex";
    if (successMsg) successMsg.style.display = "none";
}

function handleDirectCheckout(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    const btn = document.getElementById("checkoutBtn");
    btn.innerText = "جاري تأكيد الطلب...";
    btn.disabled = true;

    let itemsDetails = cart.map(item => `${item.name} (${item.quantity})`).join(" | ");
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

    emailjs.send('service_02r48sm', 'template_qzl4fu5', templateParams)
        .then(function(response) {
            cart = [];
            updateCart();

            document.getElementById("checkoutForm").style.display = "none";
            document.getElementById("displayOrderId").innerText = orderId;
            document.getElementById("orderSuccessMessage").style.display = "block";

            btn.innerText = "تأكيد وإتمام الطلب الآن 🚚";
            btn.disabled = false;

            setTimeout(() => {
                document.getElementById("reviewModal").style.display = "flex";
            }, 1000);
        }, function(error) {
            console.error("EmailJS Error:", error);
            alert("فشل الإرسال. تأكد من إعداد القالب (Template ID) في EmailJS برقم: template_qzl4fu5\nخطأ: " + JSON.stringify(error));
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
            <div style="background: #f8f9fa; padding: 12px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #eee;">
                <div style="color: #ffc107; font-size: 14px; margin-bottom: 4px;">${stars}</div>
                <p style="margin: 0; font-size: 14px; color: #333;">"${rev.comment}"</p>
                <span style="font-size: 12px; color: #777;">- ${rev.name}</span>
            </div>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    updateCart();
});
