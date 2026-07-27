document.addEventListener("DOMContentLoaded", () => {

    const cartButtons = document.querySelectorAll(".cart-btn");

    let totalItems = 0;
    let totalPrice = 0;

    let activeProduct = null;

    // إنشاء السلة السفلية
    const bottomCart = document.createElement("div");
    bottomCart.className = "bottom-cart";

    bottomCart.innerHTML = `
    <div class="bottom-cart-wrapper">

        <span class="bottom-cart-title">أضف للسلة</span>

        <div class="bottom-cart-quantity">
            <button type="button" class="bottom-plus">+</button>
            <span class="bottom-count">1</span>
            <button type="button" class="bottom-minus">−</button>
        </div>

<div class="bottom-cart-price">
    <span class="bottom-cart-total">0 AED</span>
<span class="bottom-cart-bag" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="26" height="26">
        <path fill="currentColor"
        d="M7 7V6a5 5 0 0110 0v1h2v13H5V7h2zm2 0h6V6a3 3 0 00-6 0v1z"/>
    </svg>
</span>

</div>

    </div>
`;

    document.body.appendChild(bottomCart);

    const bottomCount =
        bottomCart.querySelector(".bottom-count");

    const bottomTotal =
        bottomCart.querySelector(".bottom-cart-total");

    const bottomPlus =
        bottomCart.querySelector(".bottom-plus");

    const bottomMinus =
        bottomCart.querySelector(".bottom-minus");

    function getPrice(card){

        const price =
            card.querySelector(".price");

        if(!price) return 0;

        return Number(
            price.textContent
            .replace(/,/g,"")
            .match(/\d+/)[0]
        );

    }

    function updateBottom(){

        bottomTotal.textContent =
            totalPrice.toLocaleString()+" AED";

        bottomCount.textContent =
            totalItems;

        if(totalItems>0){

            bottomCart.classList.add("show");

        }else{

            bottomCart.classList.remove("show");

        }

    }

    cartButtons.forEach(button=>{

        const card =
            button.closest(".product-card");

        const price =
            getPrice(card);

        let quantity=0;

        const box =
            document.createElement("div");

        box.className="product-quantity";

        box.innerHTML=`

            <button class="quantity-minus">−</button>

            <span class="quantity-number">0</span>

            <button class="quantity-plus">+</button>

        `;        button.insertAdjacentElement("afterend", box);

        const plus =
            box.querySelector(".quantity-plus");

        const minus =
            box.querySelector(".quantity-minus");

        const number =
            box.querySelector(".quantity-number");

        function refresh(){

            number.textContent=quantity;

            if(quantity>0){

                button.classList.add("quantity-active");
                box.classList.add("show");

            }else{

                button.classList.remove("quantity-active");
                box.classList.remove("show");

            }

            updateBottom();

        }

        function add(){

            quantity++;

            totalItems++;

            totalPrice+=price;

            activeProduct={
                add:add,
                remove:remove
            };

            refresh();

        }

        function remove(){

            if(quantity===0)return;

            quantity--;

            totalItems--;

            totalPrice-=price;

            if(totalPrice<0)
                totalPrice=0;

            refresh();

        }

        button.addEventListener("click",e=>{

            if(
                !window.matchMedia("(max-width:768px)").matches
            ) return;

            e.preventDefault();

            add();

        });

        plus.addEventListener("click",add);

        minus.addEventListener("click",remove);

    });

    bottomPlus.addEventListener("click",()=>{

        if(activeProduct)
            activeProduct.add();

    });

    bottomMinus.addEventListener("click",()=>{

        if(activeProduct)
            activeProduct.remove();

    });    bottomCart
        .querySelector(".bottom-cart-button")
        .addEventListener("click", () => {

            alert(
                `عدد القطع: ${totalItems}\n` +
                `الإجمالي: ${totalPrice.toLocaleString()} AED`
            );

        });

    updateBottom();

});