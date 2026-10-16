const productsContainer = document.getElementById("products-container");

async function initHomeProducts() {
    if (!productsContainer) return;

    showMessage(productsContainer, "Loading...");

    let products;
    try {
        products = await api("/products");
    } catch (err) {
        console.error("Beelinx: could not load products.", err);
        showMessage(productsContainer, "Could not load products. Please refresh the page.");
        return;
    }

    const productsByBrand = {};
    products.forEach(product => {
        if (!product || !product.brand) return;
        if (!productsByBrand[product.brand]) productsByBrand[product.brand] = [];
        productsByBrand[product.brand].push({ id: product.id, product });
    });

    const brandNames = Object.keys(productsByBrand);

    function getProductsPerRow() {
        // read the column count from the CSS grid so every row is one brand
        const cols = getComputedStyle(productsContainer)
            .gridTemplateColumns.split(" ").filter(Boolean).length;
        return cols > 0 ? cols : (window.innerWidth <= 768 ? 3 : 6);
    }

    function createProductCard(id, product) {
        const productCard = document.createElement("div");
        productCard.classList.add("products");

        const productLink = document.createElement("a");
        productLink.href = `product-template.html?id=${encodeURIComponent(id)}`;

        const productImage = document.createElement("img");
        productImage.classList.add("clothe-image");
        productImage.src = product.image || "";
        productImage.alt = product.name || "Product image";
        productImage.loading = "lazy";
        productLink.appendChild(productImage);

        const productText = document.createElement("div");
        productText.classList.add("clothe-text");

        const brandLink = document.createElement("a");
        brandLink.classList.add("brand-page-link");
        brandLink.href = product.brandLink || `brandpage-template.html?brand=${encodeURIComponent(product.brand || "")}`;

        const brandName = document.createElement("strong");
        brandName.textContent = product.brand || "";
        brandLink.appendChild(brandName);

        const productName = document.createTextNode(product.name || "");

        const price = document.createElement("p");
        price.classList.add("price");
        price.textContent = product.priceDisplay || "";

        productText.append(brandLink, document.createElement("br"), productName, price);
        productCard.append(productLink, productText);
        return productCard;
    }

    function displayProducts() {
        productsContainer.replaceChildren();
        if (brandNames.length === 0) {
            showMessage(productsContainer, "No products yet.");
            return;
        }

        const productsPerRow = getProductsPerRow();
        const brandPositions = Object.fromEntries(brandNames.map(name => [name, 0]));
        let currentBrandIndex = 0;

        while (true) {
            let brandsChecked = 0;

            while (brandsChecked < brandNames.length) {
                const brand = brandNames[currentBrandIndex];
                if (brandPositions[brand] < productsByBrand[brand].length) break;
                currentBrandIndex = (currentBrandIndex + 1) % brandNames.length;
                brandsChecked++;
            }

            if (brandsChecked >= brandNames.length) break;

            const currentBrand = brandNames[currentBrandIndex];
            const brandProducts = productsByBrand[currentBrand];
            let productsAdded = 0;

            while (productsAdded < productsPerRow && brandPositions[currentBrand] < brandProducts.length) {
                const item = brandProducts[brandPositions[currentBrand]];
                productsContainer.appendChild(createProductCard(item.id, item.product));
                brandPositions[currentBrand]++;
                productsAdded++;
            }

            currentBrandIndex = (currentBrandIndex + 1) % brandNames.length;
        }
    }

    displayProducts();

    let lastProductsPerRow = getProductsPerRow();
    window.addEventListener("resize", function () {
        const currentProductsPerRow = getProductsPerRow();
        if (currentProductsPerRow !== lastProductsPerRow) {
            lastProductsPerRow = currentProductsPerRow;
            displayProducts();
        }
    });
}

initHomeProducts();