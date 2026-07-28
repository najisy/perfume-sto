document.addEventListener("DOMContentLoaded", () => {
  const mobileScreen = window.matchMedia("(max-width: 768px)");
  const productCards = [...document.querySelectorAll(".product-card")];
  const products = new Map();
  const cart = new Map();

  const money = (value) =>
    `${Math.round(value).toLocaleString("en-US")} AED`;

  const readPrice = (card) => {
    const priceElement = card.querySelector(".price");
    if (!priceElement) return 0;

    const match = priceElement.textContent.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  let activeProductId = null;

  const summaryBar = document.createElement("div");
  summaryBar.className = "cart-summary-bar";
  summaryBar.innerHTML = `
    <span class="cart-summary-price">
      <strong class="cart-summary-total">0 AED</strong>
      <span class="cart-summary-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 8V6a5 5 0 0 1 10 0v2M4.5 8h15l-1 13h-13l-1-13Z"></path>
        </svg>
      </span>
    </span>

    <span class="cart-summary-center">
      <button
        type="button"
        class="cart-summary-open"
        aria-label="عرض منتجات السلة"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 14 6-6 6 6"></path>
        </svg>
      </button>

      <span class="cart-summary-quantity">
        <button type="button" class="cart-summary-minus" aria-label="تقليل الكمية">−</button>
        <strong class="cart-summary-active-count">0</strong>
        <button type="button" class="cart-summary-plus" aria-label="زيادة الكمية">+</button>
      </span>
    </span>

    <button
      type="button"
      class="cart-summary-label-button"
      aria-label="فتح سلة المشتريات"
    >
      <span class="cart-summary-label">السلة</span>
      <span class="cart-summary-count">0</span>
    </button>
  `;

  const backdrop = document.createElement("div");
  backdrop.className = "cart-backdrop";

  const cartSheet = document.createElement("section");
  cartSheet.className = "cart-sheet";
  cartSheet.setAttribute("dir", "rtl");
  cartSheet.setAttribute("aria-hidden", "true");
  cartSheet.innerHTML = `
    <div class="cart-sheet-handle" aria-hidden="true"></div>

    <div class="cart-sheet-header">
      <div>
        <h2>سلة المشتريات</h2>
        <p class="cart-sheet-subtitle">0 قطعة</p>
      </div>

      <button type="button" class="cart-sheet-close" aria-label="إغلاق السلة">×</button>
    </div>

    <div class="cart-sheet-items"></div>

    <div class="cart-sheet-empty">
      لم تضف أي منتج إلى السلة
    </div>

    <div class="cart-sheet-footer">
      <div class="cart-sheet-total-row">
        <span>الإجمالي</span>
        <strong class="cart-sheet-total">0 AED</strong>
      </div>

      <button type="button" class="cart-checkout-button">
        إتمام الطلب
      </button>
    </div>
  `;

  document.body.append(summaryBar, backdrop, cartSheet);

  const summaryCount = summaryBar.querySelector(".cart-summary-count");
  const summaryTotal = summaryBar.querySelector(".cart-summary-total");
  const summaryActiveCount = summaryBar.querySelector(
    ".cart-summary-active-count"
  );
  const summaryPlus = summaryBar.querySelector(".cart-summary-plus");
  const summaryMinus = summaryBar.querySelector(".cart-summary-minus");
  const summaryOpen = summaryBar.querySelector(".cart-summary-open");
  const summaryLabelButton = summaryBar.querySelector(
    ".cart-summary-label-button"
  );
  const sheetSubtitle = cartSheet.querySelector(".cart-sheet-subtitle");
  const sheetItems = cartSheet.querySelector(".cart-sheet-items");
  const sheetEmpty = cartSheet.querySelector(".cart-sheet-empty");
  const sheetFooter = cartSheet.querySelector(".cart-sheet-footer");
  const sheetTotal = cartSheet.querySelector(".cart-sheet-total");
  const closeButton = cartSheet.querySelector(".cart-sheet-close");
  const checkoutButton = cartSheet.querySelector(".cart-checkout-button");

  const totals = () => {
    let quantity = 0;
    let price = 0;

    cart.forEach((item) => {
      quantity += item.quantity;
      price += item.quantity * item.price;
    });

    return { quantity, price };
  };

  const closeCart = () => {
    cartSheet.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    cartSheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-sheet-open");
  };

  const openCart = () => {
    if (!mobileScreen.matches || cart.size === 0) return;

    cartSheet.classList.add("is-open");
    backdrop.classList.add("is-open");
    cartSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-sheet-open");
  };

  const renderCartItems = () => {
    const items = [...cart.values()];

    sheetItems.innerHTML = items
      .map(
        (item) => `
          <article class="cart-sheet-item" data-cart-id="${item.id}">
            <img
              class="cart-sheet-item-image"
              src="${escapeHtml(item.image)}"
              alt="${escapeHtml(item.name)}"
            >

            <div class="cart-sheet-item-info">
              <span class="cart-sheet-item-brand">${escapeHtml(item.brand)}</span>
              <h3>${escapeHtml(item.name)}</h3>
              <strong>${money(item.price)}</strong>
            </div>

            <div class="cart-sheet-item-actions">
              <div class="cart-sheet-quantity">
                <button type="button" data-cart-action="plus" aria-label="زيادة الكمية">+</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-action="minus" aria-label="تقليل الكمية">−</button>
              </div>

              <button
                type="button"
                class="cart-sheet-remove"
                data-cart-action="remove"
              >
                حذف
              </button>
            </div>
          </article>
        `
      )
      .join("");
  };

  const updateCart = () => {
    const { quantity, price } = totals();
    const activeProduct = products.get(activeProductId);

    summaryCount.textContent = quantity;
    summaryTotal.textContent = money(price);
    summaryActiveCount.textContent = activeProduct?.quantity || 0;
    summaryPlus.disabled = !activeProduct;
    summaryMinus.disabled = !activeProduct;
    sheetSubtitle.textContent = `${quantity} ${quantity === 1 ? "قطعة" : "قطع"}`;
    sheetTotal.textContent = money(price);

    summaryBar.classList.toggle("is-visible", quantity > 0);
    sheetEmpty.hidden = quantity > 0;
    sheetFooter.hidden = quantity === 0;

    renderCartItems();

    if (quantity === 0) closeCart();
  };

  const setQuantity = (id, newQuantity) => {
    const product = products.get(id);
    if (!product) return;

    const quantity = Math.max(0, newQuantity);
    product.quantity = quantity;
    activeProductId = id;

    if (quantity === 0) {
      cart.delete(id);

      if (activeProductId === id) {
        const remainingIds = [...cart.keys()];
        activeProductId =
          remainingIds.length > 0
            ? remainingIds[remainingIds.length - 1]
            : null;
      }
    } else {
      cart.set(id, product);
    }

    product.number.textContent = quantity;
    product.addButton.classList.toggle("is-in-cart", quantity > 0);
    product.controls.classList.toggle("is-visible", quantity > 0);

    updateCart();
  };

  productCards.forEach((card, index) => {
    const addButton = card.querySelector(".cart-btn");
    if (!addButton) return;

    const id = String(index);
    const name = card.querySelector("h3")?.textContent.trim() || "منتج";
    const brand =
      card.querySelector(".product-brand")?.textContent.trim() || "";
    const image = card.querySelector(".product-image img")?.getAttribute("src") || "";

    const controls = document.createElement("div");
    controls.className = "cart-card-controls";
    controls.innerHTML = `
      <button type="button" class="cart-card-plus" aria-label="زيادة الكمية">+</button>
      <span class="cart-card-number">0</span>
      <button type="button" class="cart-card-minus" aria-label="تقليل الكمية">−</button>
    `;

    addButton.insertAdjacentElement("afterend", controls);

    const product = {
      id,
      card,
      name,
      brand,
      image,
      price: readPrice(card),
      quantity: 0,
      addButton,
      controls,
      number: controls.querySelector(".cart-card-number"),
    };

    products.set(id, product);

    addButton.addEventListener("click", (event) => {
      if (!mobileScreen.matches) return;

      event.preventDefault();
      setQuantity(id, product.quantity + 1);
    });

    controls
      .querySelector(".cart-card-plus")
      .addEventListener("click", () => {
        setQuantity(id, product.quantity + 1);
      });

    controls
      .querySelector(".cart-card-minus")
      .addEventListener("click", () => {
        setQuantity(id, product.quantity - 1);
      });
  });

  sheetItems.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-cart-action]");
    if (!actionButton) return;

    const itemElement = actionButton.closest(".cart-sheet-item");
    const id = itemElement?.dataset.cartId;
    const product = products.get(id);
    if (!product) return;

    const action = actionButton.dataset.cartAction;

    if (action === "plus") {
      setQuantity(id, product.quantity + 1);
    }

    if (action === "minus") {
      setQuantity(id, product.quantity - 1);
    }

    if (action === "remove") {
      setQuantity(id, 0);
    }
  });

  summaryOpen.addEventListener("click", openCart);
  summaryLabelButton.addEventListener("click", openCart);

  summaryPlus.addEventListener("click", () => {
    const activeProduct = products.get(activeProductId);
    if (!activeProduct) return;

    setQuantity(activeProductId, activeProduct.quantity + 1);
  });

  summaryMinus.addEventListener("click", () => {
    const activeProduct = products.get(activeProductId);
    if (!activeProduct) return;

    setQuantity(activeProductId, activeProduct.quantity - 1);
  });

  closeButton.addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });

  checkoutButton.addEventListener("click", () => {
    const { quantity, price } = totals();

    alert(
      `عدد القطع: ${quantity}\nالإجمالي: ${money(price)}`
    );
  });

  if (typeof mobileScreen.addEventListener === "function") {
    mobileScreen.addEventListener("change", (event) => {
      if (!event.matches) closeCart();
    });
  }

  updateCart();
});