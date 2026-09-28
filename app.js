const products = [
  { id: 1, name: "Monstera deliciosa", category: "Fáciles", detail: "Luz indirecta · Riego moderado", price: 18500, image: "photo-1501004318641-b39e6451bec6", label: "La favorita" },
  { id: 2, name: "Sansevieria", category: "Purificadoras", detail: "Luz baja · Poco riego", price: 12900, image: "photo-1485955900006-10f4d324d411", label: "Casi indestructible" },
  { id: 3, name: "Pilea peperomioides", category: "Pet friendly", detail: "Luz indirecta · Riego semanal", price: 16200, image: "photo-1501004318641-b39e6451bec6", label: "Pet friendly" },
  { id: 4, name: "Ficus elastica", category: "Fáciles", detail: "Luz brillante · Riego moderado", price: 22400, image: "photo-1497250681960-ef046c08a56e", label: "Un clásico" },
  { id: 5, name: "Helecho nido", category: "Pet friendly", detail: "Luz suave · Le gusta la humedad", price: 14800, image: "photo-1497250681960-ef046c08a56e", label: "Verde intenso" },
  { id: 6, name: "Zamioculca", category: "Purificadoras", detail: "Luz baja · Riego espaciado", price: 19800, image: "photo-1485955900006-10f4d324d411", label: "Cero drama" },
  { id: 7, name: "Calathea orbifolia", category: "Pet friendly", detail: "Luz indirecta · Tierra húmeda", price: 23700, image: "photo-1497250681960-ef046c08a56e", label: "Hojas únicas" },
  { id: 8, name: "Aloe vera", category: "Fáciles", detail: "Sol suave · Riego ocasional", price: 9900, image: "photo-1485955900006-10f4d324d411", label: "Pequeña aliada" }
];

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const countLabel = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const toast = document.querySelector("#toast");
let activeCategory = "Todas";
let cart = readCart();
let toastTimer;

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("hoja-nativa-cart") || "[]");
    return Array.isArray(stored) ? stored.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("hoja-nativa-cart", JSON.stringify(cart));
}

function imageUrl(image, width = 700) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=82`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
    const matchesQuery = `${product.name} ${product.category} ${product.detail}`.toLocaleLowerCase("es").includes(query);
    return matchesCategory && matchesQuery;
  });

  countLabel.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "planta" : "plantas"}`;
  emptyState.hidden = visibleProducts.length > 0;
  grid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 45, 180)}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.name}, planta de interior" loading="lazy">
        <span class="product-tag">${product.label}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito" title="Agregar al carrito"><i data-lucide="plus" aria-hidden="true"></i></button>
      </div>
      <div class="product-info"><h3 class="product-name">${product.name}</h3><span class="product-price">${money.format(product.price)}</span></div>
      <p class="product-detail">${product.detail}</p>
    </article>
  `).join("");
  refreshIcons();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cart-count").textContent = itemCount;
  cartEmpty.hidden = cart.length > 0;
  cartFooter.hidden = cart.length === 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<div class="cart-row">
      <img src="${imageUrl(product.image, 180)}" alt="" loading="lazy">
      <div><h3 class="cart-row-name">${product.name}</h3><p class="cart-row-price">${money.format(product.price)} c/u</p>
        <div class="quantity-control" aria-label="Cantidad de ${product.name}">
          <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Quitar una unidad">−</button><span>${item.quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Agregar una unidad">+</button>
        </div>
      </div>
      <button class="remove-button" type="button" data-remove="${product.id}" aria-label="Quitar ${product.name} del carrito"><i data-lucide="trash-2" aria-hidden="true"></i></button>
    </div>`;
  }).join("");
  const total = cart.reduce((sum, item) => sum + products.find((product) => product.id === item.id).price * item.quantity, 0);
  document.querySelector("#cart-total").textContent = money.format(total);
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
}

function setDrawerOpen(open) {
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  backdrop.hidden = !open;
  backdrop.classList.toggle("visible", open);
  document.body.classList.toggle("drawer-open", open);
  if (open) window.setTimeout(() => document.querySelector("#close-cart").focus(), 50);
}

document.querySelector("#category-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-button").forEach((filter) => filter.classList.toggle("active", filter === button));
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") setDrawerOpen(false);
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  const item = cart.find((entry) => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${products.find((product) => product.id === id).name} se sumó al carrito`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) cart = cart.filter((item) => item.id !== Number(removeButton.dataset.remove));
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === Number(quantityButton.dataset.quantity));
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity <= 0) cart = cart.filter((entry) => entry !== item);
  }
  saveCart();
  renderCart();
});

document.querySelector("#open-cart").addEventListener("click", () => setDrawerOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setDrawerOpen(false));
backdrop.addEventListener("click", () => setDrawerOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setDrawerOpen(false));
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("¡Gracias! La compra de práctica quedó lista para coordinar.");
  cart = [];
  saveCart();
  renderCart();
  setDrawerOpen(false);
});

renderProducts();
renderCart();