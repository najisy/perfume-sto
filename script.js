document.addEventListener("DOMContentLoaded", () => {
  const productCards = [...document.querySelectorAll(".product-card")];
  const products = new Map();
  const cart = new Map();

  /* Unicode escapes keep Arabic correct even if the file encoding changes. */
  const AR = {
    openCart: "\u0641\u062a\u062d \u0633\u0644\u0629 \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a",
    lastAdded: "\u0622\u062e\u0631 \u0625\u0636\u0627\u0641\u0629",
    selectedOrder: "\u0637\u0644\u0628\u0643 \u0627\u0644\u0645\u062e\u062a\u0627\u0631",
    cartTitle: "\u0633\u0644\u0629 \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a",
    oneProduct: "\u0645\u0646\u062a\u062c \u0648\u0627\u062d\u062f",
    products: "\u0645\u0646\u062a\u062c\u0627\u062a",
    closeCart: "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0633\u0644\u0629",
    emptyCart: "\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063a\u0629",
    choosePerfume: "\u0627\u062e\u062a\u0631 \u0639\u0637\u0631\u0643 \u0627\u0644\u0645\u0641\u0636\u0644 \u0644\u064a\u0638\u0647\u0631 \u0647\u0646\u0627",
    total: "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a",
    selectedProducts: "\u0634\u0627\u0645\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629",
    checkout: "\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628",
    decrease: "\u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u0643\u0645\u064a\u0629",
    increase: "\u0632\u064a\u0627\u062f\u0629 \u0627\u0644\u0643\u0645\u064a\u0629",
    remove: "\u062d\u0630\u0641",
    product: "\u0645\u0646\u062a\u062c",
    pieces: "\u0639\u062f\u062f \u0627\u0644\u0642\u0637\u0639",
  };

  const formatMoney = (value) =>
    `${Math.round(value).toLocaleString("en-US")} AED`;

  const readPrice = (card) => {
    const priceElement = card.querySelector(".price");
    if (!priceElement) return 0;

    const match = priceElement.textContent
      .replace(/,/g, "")
      .match(/\d+(?:\.\d+)?/);

    return match ? Number(match[0]) : 0;
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const cartDock = document.createElement("button");
  cartDock.type = "button";
  cartDock.className = "lux-cart-dock";
  cartDock.setAttribute("aria-label", AR.openCart);
  cartDock.innerHTML = `
    <span class="lux-cart-bag" aria-hidden="true">
      <svg class="lux-cart-bag-icon" viewBox="0 0 32 32">
        <path d="M8 7.5h18v18H8V7.5Z"></path>
        <path d="M8 7.5 5.5 10v15.5H26"></path>
        <path d="M8 25.5 5.5 22.8"></path>
        <path d="M12 10.5v3a4 4 0 0 0 8 0v-3"></path>
      </svg>
      <b class="lux-cart-badge">0</b>
    </span>

    <span class="lux-cart-preview">
      <span class="lux-cart-preview-image-wrap">
        <img class="lux-cart-preview-image" alt="">
      </span>
      <span class="lux-cart-copy">
        <small>${AR.lastAdded}</small>
        <strong class="lux-cart-preview-name">${AR.product}</strong>
      </span>
    </span>

    <span class="lux-cart-total-wrap">
      <strong class="lux-cart-total">0 AED</strong>
      <span class="lux-cart-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="m6 14 6-6 6 6"></path>
        </svg>
      </span>
    </span>
  `;

  const backdrop = document.createElement("div");
  backdrop.className = "lux-cart-backdrop";

  const cartSheet = document.createElement("section");
  cartSheet.className = "lux-cart-sheet";
  cartSheet.setAttribute("dir", "rtl");
  cartSheet.setAttribute("aria-hidden", "true");
  cartSheet.innerHTML = `
    <div class="lux-cart-handle" aria-hidden="true"></div>

    <header class="lux-cart-header">
      <div>
        <span class="lux-cart-eyebrow">${AR.selectedOrder}</span>
        <h2>${AR.cartTitle}</h2>
        <p class="lux-cart-sheet-count">0 ${AR.products}</p>
      </div>

      <button type="button" class="lux-cart-close" aria-label="${AR.closeCart}">&times;</button>
    </header>

    <div class="lux-cart-list"></div>

    <div class="lux-cart-empty">
      <span class="lux-cart-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 8V6a5 5 0 0 1 10 0v2M4.5 8h15l-1 13h-13l-1-13Z"></path>
        </svg>
      </span>
      <strong>${AR.emptyCart}</strong>
      <small>${AR.choosePerfume}</small>
    </div>

    <footer class="lux-cart-footer">
      <div class="lux-cart-total-row">
        <span>
          <small>${AR.total}</small>
          <strong class="lux-cart-sheet-total">0 AED</strong>
        </span>
        <span class="lux-cart-tax-note">${AR.selectedProducts}</span>
      </div>

      <button type="button" class="lux-cart-checkout">
        <span>${AR.checkout}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6"></path>
        </svg>
      </button>
    </footer>
  `;

  document.body.append(cartDock, backdrop, cartSheet);

  const dockBadge = cartDock.querySelector(".lux-cart-badge");
  const dockPreviewName = cartDock.querySelector(".lux-cart-preview-name");
  const dockPreviewImage = cartDock.querySelector(".lux-cart-preview-image");
  const dockTotal = cartDock.querySelector(".lux-cart-total");
  const sheetCount = cartSheet.querySelector(".lux-cart-sheet-count");
  const cartList = cartSheet.querySelector(".lux-cart-list");
  const emptyState = cartSheet.querySelector(".lux-cart-empty");
  const cartFooter = cartSheet.querySelector(".lux-cart-footer");
  const sheetTotal = cartSheet.querySelector(".lux-cart-sheet-total");
  const closeButton = cartSheet.querySelector(".lux-cart-close");
  const checkoutButton = cartSheet.querySelector(".lux-cart-checkout");

  let previousTotalQuantity = 0;
  let lastProductId = null;

  const getTotals = () => {
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
    document.body.classList.remove("lux-cart-open");
  };

  const openCart = () => {
    if (cart.size === 0) return;

    cartSheet.classList.add("is-open");
    backdrop.classList.add("is-open");
    cartSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("lux-cart-open");
  };

  const renderCartItems = () => {
    cartList.innerHTML = [...cart.values()]
      .map(
        (item) => `
          <article class="lux-cart-item" data-product-id="${item.id}">
            <div class="lux-cart-item-image-wrap">
              <img
                class="lux-cart-item-image"
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.name)}"
              >
            </div>

            <div class="lux-cart-item-info">
              <span class="lux-cart-item-brand">${escapeHtml(item.brand)}</span>
              <h3>${escapeHtml(item.name)}</h3>
              <strong>${formatMoney(item.price)}</strong>
            </div>

            <div class="lux-cart-item-actions">
              <div class="lux-cart-stepper">
                <button type="button" data-action="minus" aria-label="${AR.decrease}">&minus;</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="plus" aria-label="${AR.increase}">+</button>
              </div>

              <button type="button" class="lux-cart-remove" data-action="remove">
                ${AR.remove}
              </button>
            </div>
          </article>
        `
      )
      .join("");
  };

  const pulseBadge = () => {
    dockBadge.classList.remove("is-bumping");
    requestAnimationFrame(() => dockBadge.classList.add("is-bumping"));
  };

  const updateCart = () => {
    const { quantity, price } = getTotals();

    if (!cart.has(lastProductId)) {
      const remainingIds = [...cart.keys()];
      lastProductId =
        remainingIds.length > 0
          ? remainingIds[remainingIds.length - 1]
          : null;
    }

    const lastProduct = products.get(lastProductId);

    dockBadge.textContent = quantity;
    dockPreviewName.textContent = lastProduct?.name || AR.product;
    dockPreviewImage.src = lastProduct?.image || "";
    dockPreviewImage.alt = lastProduct?.name || AR.product;
    dockTotal.textContent = formatMoney(price);
    sheetCount.textContent =
      quantity === 1 ? AR.oneProduct : `${quantity} ${AR.products}`;
    sheetTotal.textContent = formatMoney(price);

    cartDock.classList.toggle("is-visible", quantity > 0);
    document.body.classList.toggle("lux-cart-has-items", quantity > 0);
    emptyState.hidden = quantity > 0;
    cartFooter.hidden = quantity === 0;

    renderCartItems();

    if (quantity !== previousTotalQuantity && quantity > 0) {
      pulseBadge();
    }

    previousTotalQuantity = quantity;

    if (quantity === 0) closeCart();
  };

  const setImportant = (element, property, value) => {
    element.style.setProperty(property, value, "important");
  };

  /* Place the quantity control exactly over the original Add to Cart button. */
  const placeCardControls = (product) => {
    const { addButton, controls } = product;
    const actionParent = addButton.parentElement;
    if (!actionParent) return;

    setImportant(actionParent, "position", "relative");

    const buttonWidth = addButton.offsetWidth;
    const buttonHeight = addButton.offsetHeight;

    if (buttonWidth === 0 || buttonHeight === 0) return;

    setImportant(controls, "position", "absolute");
    setImportant(controls, "top", `${addButton.offsetTop}px`);
    setImportant(controls, "right", "auto");
    setImportant(controls, "bottom", "auto");
    setImportant(controls, "left", `${addButton.offsetLeft}px`);
    setImportant(controls, "width", `${buttonWidth}px`);
    setImportant(controls, "min-width", `${buttonWidth}px`);
    setImportant(controls, "max-width", `${buttonWidth}px`);
    setImportant(controls, "height", `${buttonHeight}px`);
    setImportant(controls, "min-height", `${buttonHeight}px`);
    setImportant(controls, "max-height", `${buttonHeight}px`);
    setImportant(controls, "margin", "0");
    setImportant(controls, "padding", "0");
    setImportant(controls, "box-sizing", "border-box");
    setImportant(controls, "overflow", "hidden");
    setImportant(controls, "transform", "none");
    setImportant(controls, "z-index", "3");

    controls.querySelectorAll("button").forEach((controlButton) => {
      setImportant(controlButton, "width", `${buttonHeight}px`);
      setImportant(controlButton, "min-width", `${buttonHeight}px`);
      setImportant(controlButton, "max-width", `${buttonHeight}px`);
      setImportant(controlButton, "height", "100%");
      setImportant(controlButton, "min-height", "0");
      setImportant(controlButton, "max-height", "none");
      setImportant(controlButton, "margin", "0");
      setImportant(controlButton, "padding", "0");
      setImportant(controlButton, "transform", "translateY(-0px)");
    });
  };

  const displayCardControls = (product, isVisible) => {
    const { addButton, controls } = product;

    if (isVisible) {
      setImportant(addButton, "display", product.originalDisplay);
      setImportant(addButton, "visibility", "hidden");
      setImportant(addButton, "opacity", "0");
      setImportant(addButton, "pointer-events", "none");

      setImportant(controls, "display", "flex");
      setImportant(controls, "flex-direction", "row");
      setImportant(controls, "align-items", "center");
      setImportant(controls, "justify-content", "center");
setImportant(controls, "gap", "14px");
      return;
    }

    ["display", "visibility", "opacity", "pointer-events"].forEach(
      (property) => addButton.style.removeProperty(property)
    );
    setImportant(controls, "display", "none");
  };

  const setQuantity = (id, newQuantity) => {
    const product = products.get(id);
    if (!product) return;

    product.quantity = Math.max(0, newQuantity);

    if (product.quantity === 0) {
      cart.delete(id);
    } else {
      cart.set(id, product);
      lastProductId = id;
    }

    const hasQuantity = product.quantity > 0;

    if (hasQuantity) placeCardControls(product);

    product.number.textContent = product.quantity;
    product.addButton.classList.toggle("lux-added", hasQuantity);
    product.controls.classList.toggle("is-visible", hasQuantity);
    displayCardControls(product, hasQuantity);

    updateCart();
  };

  productCards.forEach((card, index) => {
    const addButton = card.querySelector(".cart-btn");
    if (!addButton) return;

    const id = String(index);
    const controls = document.createElement("div");
    controls.className = "lux-card-qty";
    controls.innerHTML = `
      <button type="button" class="lux-card-minus" aria-label="${AR.decrease}">&minus;</button>
      <span class="lux-card-number">0</span>
      <button type="button" class="lux-card-plus" aria-label="${AR.increase}">+</button>
    `;

    addButton.insertAdjacentElement("afterend", controls);

    const product = {
      id,
      card,
      name: card.querySelector("h3")?.textContent.trim() || AR.product,
      brand: card.querySelector(".product-brand")?.textContent.trim() || "",
      image:
        card.querySelector(".product-image img")?.getAttribute("src") || "",
      price: readPrice(card),
      quantity: 0,
      addButton,
      originalDisplay: getComputedStyle(addButton).display || "flex",
      controls,
      number: controls.querySelector(".lux-card-number"),
    };

    products.set(id, product);

    addButton.addEventListener("click", (event) => {
      event.preventDefault();
      setQuantity(id, product.quantity + 1);
    });

    controls
      .querySelector(".lux-card-minus")
      .addEventListener("click", () => {
        setQuantity(id, product.quantity - 1);
      });

    controls
      .querySelector(".lux-card-plus")
      .addEventListener("click", () => {
        setQuantity(id, product.quantity + 1);
      });
  });

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      products.forEach((product) => {
        if (product.quantity > 0) placeCardControls(product);
      });
    });
  });

  cartList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const itemElement = actionButton.closest(".lux-cart-item");
    const id = itemElement?.dataset.productId;
    const product = products.get(id);
    if (!product) return;

    const action = actionButton.dataset.action;

    if (action === "plus") setQuantity(id, product.quantity + 1);
    if (action === "minus") setQuantity(id, product.quantity - 1);
    if (action === "remove") setQuantity(id, 0);
  });

  cartDock.addEventListener("click", openCart);
  backdrop.addEventListener("click", closeCart);
  closeButton.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });

  checkoutButton.addEventListener("click", () => {
    const { quantity, price } = getTotals();

    alert(`${AR.pieces}: ${quantity}\n${AR.total}: ${formatMoney(price)}`);
  });

  updateCart();
});
