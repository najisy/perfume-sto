const addToCartButtons = document.querySelectorAll(".cart-btn");
const mobileCartCount = document.querySelector(".mobile-cart .cart-count");

let cartCount = 0;

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartCount++;

    mobileCartCount.textContent = cartCount;
  });
});