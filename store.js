const salaries = {
    executive: 458.20,
    professional: 309.10,
    operator: 195.10,
    minimum: 3.50
};

let selectedSalary = null;
let cart = {};
let currentCategory = 'food';
const productCards = {};

document.getElementById("salary-select").addEventListener("change", (e) => {
    const role = e.target.value;
    selectedSalary = salaries[role];
    // cart = {};
    updateReceipt();
});

function loadCSV(filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(text => {
            const rows = text.trim().split("\n").slice(1);
            let category = "food";
            if (filePath.includes("hygiene")) category = "hygiene";
            if (filePath.includes("housing")) category = "housing";

            const products = rows.map(row => {
                if (category === "housing") {
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    if (columns.length < 5) return null;
                    return {
                        type: columns[0].trim(),
                        price: parseFloat(columns[1].trim().replace("$", "")),
                        distribution: columns[2].trim(),
                        footage: columns[3].trim().replace(/"/g, ''),
                        address: columns[4].trim().replace(/"/g, '').replace(/\r/g, ''),
                        quantity: 0,
                        category
                    };
                } else {
                    const [product, price] = row.split(",");
                    return {
                        name: product.trim(),
                        price: parseFloat(price.trim()),
                        quantity: 0,
                        category
                    };
                }
            }).filter(Boolean);

            callback(products);
        })
        .catch(console.error);
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
        <div class="product-image">
            <img src="products/${product.name.toLowerCase().replace(/ /g, "_")}.jpg" alt="${product.name}" />
        </div>
        <div class="product-info">
            <div class="product-text">
                <h3>${product.name}</h3>
                <p>${formatPrice(product.price)}</p>
            </div>
            <div class="quantity-control">
                ${product.quantity > 0
                    ? `<button class="decrease">-</button>
                    <span>${product.quantity}</span>
                    <button class="increase">+</button>`
                    : `<button class="buy-btn">Buy</button>`
                }
            </div>
        </div>
    `;

    handleProductControls(card, product);
    productCards[product.name] = { card, product };
    return card;
}

function createHousingCard(product) {
    const priceFolder = Math.floor(product.price); // folder based on price
    const imageFolder = `products/housing/${priceFolder}`;
    const totalImages = 5;

    const card = document.createElement("div");
    card.className = "product-card housing-card";

    const sliderId = `slider-${priceFolder}-${Math.random().toString(36).substring(2, 7)}`;

    card.innerHTML = `
        <div class="product-image housing-slider" id="${sliderId}">
            <img src="${imageFolder}/1.jpg" data-index="1" alt="${product.type}" 
                onerror="this.src='products/housing_fallback.jpg';this.onerror=null;" />
            <button class="slider-arrow left">&#10094;</button>
            <button class="slider-arrow right">&#10095;</button>
        </div>
        <div class="product-info">
            <div class="product-text">
                <div class="housing-header">
                    <h3>${product.type} (${product.footage})</h3>
                </div>
                <p>${formatPrice(product.price)}</p>
                <p>${product.distribution}</p>
                <div class="address-control-row">
                    <p class="address">${product.address}</p>
                    <div class="quantity-control">
                        ${product.quantity > 0
                            ? `<button class="decrease">-</button>
                            <span>${product.quantity}</span>
                            <button class="increase">+</button>`
                            : `<button class="buy-btn">Rent</button>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners to the slider arrows
    const slider = card.querySelector(`#${sliderId}`);
    const img = slider.querySelector("img");
    let currentIndex = 1;

    slider.querySelector(".left").addEventListener("click", () => {
        currentIndex = currentIndex === 1 ? totalImages : currentIndex - 1;
        img.src = `${imageFolder}/${currentIndex}.jpg`;
        img.setAttribute("data-index", currentIndex);
    });

    slider.querySelector(".right").addEventListener("click", () => {
        currentIndex = currentIndex === totalImages ? 1 : currentIndex + 1;
        img.src = `${imageFolder}/${currentIndex}.jpg`;
        img.setAttribute("data-index", currentIndex);
    });

    handleProductControls(card, product, true);
    productCards[product.type] = { card, product };
    return card;
}


function handleProductControls(card, product, isHousing = false) {
    const controls = card.querySelector(".quantity-control");

    controls.querySelector(".buy-btn")?.addEventListener("click", () => {
        if (!selectedSalary) return alert("please select a salary before you start shopping");
        product.quantity = 1;
        const key = isHousing ? product.type : product.name;
        cart[key] = { ...product };
        refreshCard(card, product, isHousing);
        updateReceipt();
    });

    controls.querySelector(".decrease")?.addEventListener("click", () => {
        const key = isHousing ? product.type : product.name;
        if (product.quantity > 1) {
            product.quantity--;
            cart[key].quantity = product.quantity;
        } else {
            product.quantity = 0;
            delete cart[key];
        }
        refreshCard(card, product, isHousing);
        updateReceipt();
    });

    controls.querySelector(".increase")?.addEventListener("click", () => {
        const key = isHousing ? product.type : product.name;
        product.quantity++;
        cart[key] = { ...product };
        refreshCard(card, product, isHousing);
        updateReceipt();
    });
}

function refreshCard(oldCard, product, isHousing) {
    const newCard = isHousing ? createHousingCard(product) : createProductCard(product);
    oldCard.replaceWith(newCard);
    const key = isHousing ? product.type : product.name;
    productCards[key].card = newCard;
}

function updateReceipt() {
    const receipt = document.querySelector(".receipt");
    receipt.innerHTML = "";

    if (!selectedSalary) {
        receipt.innerHTML = `<p>please select a salary above to start shopping</p>`;
        return;
    }

    const role = Object.keys(salaries).find(key => salaries[key] === selectedSalary);
    const roleMsg = {
        executive: "as an Executive",
        professional: "as a Professional",
        operator: "as an Operator",
        minimum: "with Minimum Wage"
    };

    receipt.innerHTML = `
        <p>${roleMsg[role]}, your monthly income is <span>$${selectedSalary.toFixed(2)}</span></p>
        <p>now, let's go shopping</p>
    `;

    const table = document.createElement("div");
    table.className = "receipt-table";

    let total = 0;
    const categoryGroups = {};

    for (let item in cart) {
        const p = cart[item];
        const name = p.category === "housing" ? p.distribution : p.name;
        if (!categoryGroups[p.category]) categoryGroups[p.category] = [];
        categoryGroups[p.category].push({ name, quantity: p.quantity, price: p.price });
        total += p.quantity * p.price;
    }

    Object.entries(categoryGroups).forEach(([category, items]) => {
        const capCategory = category.charAt(0).toUpperCase() + category.slice(1);
        table.innerHTML += `<div class="receipt-category">
            <strong>${capCategory}</strong>
            <button class="remove-category" data-category="${category}">x</button>
        </div>`;

        items.forEach(({ name, quantity, price }) => {
            table.innerHTML += `
                <div class="receipt-line">
                    <span class="product-name">${name}</span>
                    <span class="quantity">x${quantity}</span>
                    <span class="total-price">${formatPrice(quantity * price)}</span>
                </div>`;
        });
    });

    if (total > 0) {
        table.innerHTML += `
            <div class="receipt-line total">
                <span class="total-label">Total</span>
                <span class="total-price">${formatPrice(total)}</span>
            </div>`;
        const left = selectedSalary - total;
        receipt.innerHTML += table.outerHTML;
        receipt.innerHTML += `
            <div class="receipt-total">
                you have <strong style="color: ${left >= 0 ? 'green' : 'red'};">
                ${left < 0 ? "-" : ""}${formatPrice(Math.abs(left))}
                </strong> left for the rest of the month...
            </div>`;
    } else {
        return;
    }

    // Remove category event
    document.querySelectorAll(".remove-category").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.category;
            Object.keys(cart).forEach(key => {
                if (cart[key].category === cat) {
                    const prod = cart[key];
                    prod.quantity = 0;
                    const ref = productCards[prod.name || prod.type];
                    if (ref) refreshCard(ref.card, prod, prod.category === "housing");
                    delete cart[key];
                }
            });
            updateReceipt();
        });
    });
}

function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}


// Load products
loadCSV("products/food.csv", (products) => {
    const carousel = document.querySelector("#food .carousel");
    products.forEach(product => {
        const card = createProductCard(product);
        carousel.appendChild(card);
    });
});

loadCSV("products/hygiene.csv", (products) => {
    const carousel = document.querySelector("#hygiene .carousel");
    products.forEach(product => {
        const card = createProductCard(product);
        carousel.appendChild(card);
    });
});

loadCSV("products/housing.csv", (products) => {
    console.log("Housing products loaded:", products); // Debug log
    const carousel = document.querySelector("#housing .carousel");
    products.forEach(product => {
        const card = createHousingCard(product);
        carousel.appendChild(card);
    });
});

function formatPrice(price) {
    return '$' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}