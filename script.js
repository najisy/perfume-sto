document.addEventListener("DOMContentLoaded", function () {
    const addToCartButtons = document.querySelectorAll(".cart-btn");
    const mobileCart = document.querySelector(".mobile-cart");
    const mobileCartCount = document.querySelector(
        ".mobile-cart .cart-count"
    );

    let totalCartCount = 0;

    function updateMobileCart() {
        mobileCartCount.textContent = totalCartCount;

        if (totalCartCount > 0) {
            mobileCart.classList.add("show");
        } else {
            mobileCart.classList.remove("show");
        }
    }

    addToCartButtons.forEach(function (button) {
        let productCount = 0;

        const quantityBox = document.createElement("div");
        quantityBox.className = "product-quantity";

        const minusButton = document.createElement("button");
        minusButton.className = "quantity-minus";
        minusButton.type = "button";
        minusButton.textContent = "−";

        const quantityNumber = document.createElement("span");
        quantityNumber.className = "quantity-number";
        quantityNumber.textContent = "0";

        const plusButton = document.createElement("button");
        plusButton.className = "quantity-plus";
        plusButton.type = "button";
        plusButton.textContent = "+";

        quantityBox.appendChild(minusButton);
        quantityBox.appendChild(quantityNumber);
        quantityBox.appendChild(plusButton);

        button.insertAdjacentElement("afterend", quantityBox);

        function updateProduct() {
            quantityNumber.textContent = productCount;

            if (productCount > 0) {
                quantityBox.classList.add("show");
                button.classList.add("quantity-active");
            } else {
                quantityBox.classList.remove("show");
                button.classList.remove("quantity-active");
            }

            updateMobileCart();
        }

        button.addEventListener("click", function (event) {
            if (!window.matchMedia("(max-width: 768px)").matches) {
                return;
            }

            event.preventDefault();

            productCount++;
            totalCartCount++;

            updateProduct();
        });

        plusButton.addEventListener("click", function () {
            productCount++;
            totalCartCount++;

            updateProduct();
        });

        minusButton.addEventListener("click", function () {
            if (productCount > 0) {
                productCount--;
                totalCartCount--;

                updateProduct();
            }
        });
    });

    updateMobileCart();
});