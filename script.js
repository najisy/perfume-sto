document.addEventListener("DOMContentLoaded", function () {
  const addToCartButtons = document.querySelectorAll(".cart-btn");
  const mobileCart = document.querySelector(".mobile-cart");
  const mobileCartCount = document.querySelector(
    ".mobile-cart .cart-count"
  );

  let totalCartCount = 0;

  addToCartButtons.forEach(function (button) {
    let productCount = 0;

    const countBadge = document.createElement("span");
    countBadge.className = "product-count";
    countBadge.textContent = "0";

    button.appendChild(countBadge);

    button.addEventListener("click", function () {
      productCount++;
      totalCartCount++;

      countBadge.textContent = productCount;
      countBadge.classList.add("show");

      mobileCartCount.textContent = totalCartCount;
      mobileCart.classList.add("show");
    });
  });
});