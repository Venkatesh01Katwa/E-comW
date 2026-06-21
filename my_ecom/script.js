/* Global UI behavior: menu, sidebar, category + search filtering, FAQ */
(function () {
  window.toggleMenu = function () {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    nav.classList.toggle('active');
  };

  window.toggleSidebar = function (open) {
    const sb = document.querySelector('.sidebar');
    if (!sb) return;
    if (open === undefined) sb.classList.toggle('open');
    else if (open) sb.classList.add('open');
    else sb.classList.remove('open');
  };

  let currentCategory = 'All';
  const searchInput = () => document.getElementById('searchInput');

  function applyFilters() {
    const q = (searchInput() && searchInput().value.trim().toLowerCase()) || '';
    const products = document.querySelectorAll('.product-card');
    products.forEach((card) => {
      const category = card.dataset.category || 'All';
      const title = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const categoryMatch = (currentCategory === 'All') || (category === currentCategory);
      const searchMatch = q.length === 0 || title.includes(q);
      card.style.display = categoryMatch && searchMatch ? '' : 'none';
    });
  }

  function initCategories() {
    const list = document.querySelectorAll('.categories li');
    if (!list.length) return;
    list.forEach(li => {
      li.addEventListener('click', () => {
        list.forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        currentCategory = li.dataset.category || 'All';
        applyFilters();
        if (window.innerWidth <= 820) toggleSidebar(false);
      });
    });
  }

  function initSearch() {
    const s = searchInput();
    if (!s) return;
    s.addEventListener('input', applyFilters);
  }

  function initFAQ() {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (answer.style.maxHeight) {
          answer.style.maxHeight = null;
          btn.querySelector('.toggle') && (btn.querySelector('.toggle').textContent = '+');
        } else {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.querySelector('.toggle') && (btn.querySelector('.toggle').textContent = '-');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCategories();
    initSearch();
    initFAQ();
    applyFilters();
    updateCartCount();
  });

  window.addEventListener('resize', () => {
    const sb = document.querySelector('.sidebar');
    if (!sb) return;
    if (window.innerWidth > 820) sb.classList.remove('open');
  });
})();

/* ---------------- PRODUCT MODAL ---------------- */
document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.classList.contains("small")) return;
    const title = card.querySelector(".product-title").textContent;
    const price = card.querySelector(".price").textContent;
    const img = card.querySelector("img").getAttribute("src");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalPrice").textContent = price;
    document.getElementById("modalImage").src = img;
    document.getElementById("modalDescription").textContent =
      "This is a premium " + title + " available now at an affordable price!";
    document.getElementById("productModal").style.display = "flex";
  });
});

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("productModal");
  if (event.target === modal) closeModal();
};

/* ---------------- BUY NOW ---------------- */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("buy")) {
    const card = e.target.closest(".product-card, .modal-content");
    if (!card) return;

    const title = card.querySelector(".product-title, #modalTitle").textContent;
    const price = card.querySelector(".price, #modalPrice").textContent;
    const img = card.querySelector("img, #modalImage").getAttribute("src");

    // Clear any previous checkout data to prevent old items showing
    localStorage.removeItem("checkoutCart");
    localStorage.removeItem("checkoutProduct");

    // Save only the current "Buy Now" item
    localStorage.setItem("checkoutProduct", JSON.stringify({ title, price, img }));

    // Redirect to checkout
    window.location.href = "checkout.html";
  }
});


/* ---------------- ADD TO CART ---------------- */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("small")) {
    // Detect if clicked inside a product card OR modal
    const card = e.target.closest(".product-card, .modal-content");
    if (!card) return;

    // Get product info (from either modal or product card)
    const title = card.querySelector(".product-title, #modalTitle").textContent;
    const price = card.querySelector(".price, #modalPrice").textContent;
    const img = card.querySelector("img, #modalImage").getAttribute("src");

    // Add or update in localStorage cart
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existing = cart.find(item => item.title === title);
    if (existing) existing.qty += 1;
    else cart.push({ title, price, img, qty: 1 });

    localStorage.setItem("cartItems", JSON.stringify(cart));

    // Update cart counter instantly
    updateCartCount();

    // Give visual feedback to user
    e.target.textContent = "Added ✔";
    setTimeout(() => { e.target.textContent = "Add to Cart"; }, 1000);
  }
});


function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const countElem = document.getElementById("cartCount");
  if (countElem) countElem.textContent = totalCount;
}
