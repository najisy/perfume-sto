document.addEventListener("DOMContentLoaded", function () {
    const addToCartButtons = document.querySelectorAll(".cart-btn");

    addToCartButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const productCard = button.closest(".product-card");

            const productName =
                productCard.querySelector("h3")?.textContent || "المنتج";

            const productPrice =
                productCard.querySelector(".price")?.textContent || "";

            let bottomCart = document.querySelector(".bottom-cart");

            if (!bottomCart) {
                bottomCart = document.createElement("div");
                bottomCart.className = "bottom-cart";

                bottomCart.innerHTML = `
                    <button class="bottom-add-btn">
                        أضف للسلة
                        <span class="bottom-price"></span>
                    </button>

                    <div class="bottom-quantity">
                        <button class="bottom-minus" type="button">−</button>
                        <span class="bottom-count">1</span>
                        <button class="bottom-plus" type="button">+</button>
                    </div>
                `;

                document.body.appendChild(bottomCart);
            }

            const priceText = bottomCart.querySelector(".bottom-price");
            const countText = bottomCart.querySelector(".bottom-count");
            const plusButton = bottomCart.querySelector(".bottom-plus");
            const minusButton = bottomCart.querySelector(".bottom-minus");
            const addButton = bottomCart.querySelector(".bottom-add-btn");

            let quantity = 1;

            priceText.textContent = productPrice;
            countText.textContent = quantity;

            bottomCart.classList.add("show");

            plusButton.onclick = function () {
                quantity++;
                countText.textContent = quantity;
            };

            minusButton.onclick = function () {
                if (quantity > 1) {
                    quantity--;
                    countText.textContent = quantity;
                }
            };

            addButton.onclick = function () {
                alert(
                    `تمت إضافة ${quantity} من ${productName} إلى السلة`
                );
            };
        });
    });
});