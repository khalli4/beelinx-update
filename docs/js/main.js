/* =========================================================
   BEELINX MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   1. SEARCH FUNCTION
========================================================= */

function searchFunction() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const filter =
        input.value.toLowerCase().trim();

    const products =
        document.getElementsByClassName("products");

    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        const text =
            products[i].textContent.toLowerCase();

        if (text.includes(filter)) {

            products[i].style.display = "";

        } else {

            products[i].style.display = "none";

        }

    }

}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.querySelector(".search-btn");

    if (!searchInput || !searchIcon) return;

    let closingTimer;

    searchIcon.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        clearTimeout(closingTimer);

        if (searchInput.classList.contains("search-open")) {
            searchInput.classList.remove("search-open");

            closingTimer = setTimeout(function () {
                searchInput.blur();
            }, 400);
        } else {
            searchInput.classList.add("search-open");
            searchInput.focus();
        }
    });
});

/* =========================================================
   2. MENU TOGGLE

   Same public functions as before (toggleMenu / closeMenu are
   called from the HTML), now with:
   - Escape and backdrop-tap to close
   - background scroll lock that restores the scroll position
   - focus moved into the menu on open and back on close
   - keyboard support for the hamburger, close and search icons
========================================================= */

let bxMenuScrollY = 0;
let bxMenuTrigger = null;

function bxMenuEl() {
    return document.getElementById("sideMenu");
}

function bxMenuIsOpen() {
    const menu = bxMenuEl();
    return !!(menu && menu.classList.contains("active"));
}

function bxSetMenuExpanded(open) {
    const ham = document.querySelector(".hamburger");
    if (ham) ham.setAttribute("aria-expanded", open ? "true" : "false");
}

function bxCloseSearch() {
    const input = document.getElementById("searchInput");
    if (input && input.classList.contains("search-open")) {
        input.classList.remove("search-open");
        input.blur();
    }
}

function toggleMenu() {
    const menu = bxMenuEl();
    if (!menu || bxMenuIsOpen()) return;

    bxMenuTrigger = document.activeElement;
    bxCloseSearch();

    bxMenuScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -bxMenuScrollY + "px";
    document.body.classList.add("bx-locked");
    document.documentElement.classList.add("bx-menu-open");

    menu.classList.add("active");
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    bxSetMenuExpanded(true);

    const first = menu.querySelector(".close-btn");
    if (first) first.focus({ preventScroll: true });
}

function closeMenu(options) {
    const menu = bxMenuEl();
    if (!menu || !bxMenuIsOpen()) return;

    menu.classList.remove("active");
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");

    document.documentElement.classList.remove("bx-menu-open");
    document.body.classList.remove("bx-locked");
    document.body.style.top = "";
    window.scrollTo({ top: bxMenuScrollY, left: 0, behavior: "instant" });

    bxSetMenuExpanded(false);

    const returnFocus = !(options && options.restoreFocus === false);
    if (returnFocus && bxMenuTrigger && document.contains(bxMenuTrigger)) {
        bxMenuTrigger.focus({ preventScroll: true });
    }
    bxMenuTrigger = null;
}

document.addEventListener("DOMContentLoaded", function () {
    const menu = bxMenuEl();
    const ham = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close-btn");
    const searchBtn = document.querySelector(".search-btn");
    const searchInput = document.getElementById("searchInput");

    function makeButton(el, label, action) {
        if (!el) return;
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", label);
        el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                action();
            }
        });
    }

    if (menu) {
        menu.setAttribute("role", "dialog");
        menu.setAttribute("aria-modal", "true");
        menu.setAttribute("aria-label", "Menu");
        if (!bxMenuIsOpen()) {
            menu.setAttribute("inert", "");
            menu.setAttribute("aria-hidden", "true");
        }
    }

    makeButton(ham, "Open menu", toggleMenu);
    if (ham && menu) {
        ham.setAttribute("aria-controls", "sideMenu");
        ham.setAttribute("aria-expanded", "false");
    }
    makeButton(closeBtn, "Close menu", closeMenu);

    if (searchBtn && searchInput) {
        makeButton(searchBtn, "Search", function () { searchBtn.click(); });
        searchBtn.setAttribute("aria-controls", "searchInput");
        searchBtn.setAttribute("aria-expanded", "false");
        new MutationObserver(function () {
            searchBtn.setAttribute(
                "aria-expanded",
                searchInput.classList.contains("search-open") ? "true" : "false"
            );
        }).observe(searchInput, { attributes: true, attributeFilter: ["class"] });

        if (!searchInput.getAttribute("aria-label")) {
            searchInput.setAttribute("aria-label", "Search products and brands");
        }
        searchInput.setAttribute("enterkeyhint", "search");
        searchInput.setAttribute("autocomplete", "off");
        // typing, pasting and voice input all filter the grid
        searchInput.addEventListener("input", searchFunction);
    }

    // Escape closes whatever is open; Tab stays inside the open menu
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (bxMenuIsOpen()) {
                closeMenu();
            } else if (searchInput && searchInput.classList.contains("search-open")) {
                bxCloseSearch();
                if (searchBtn) searchBtn.focus({ preventScroll: true });
            }
            return;
        }

        if (e.key === "Tab" && bxMenuIsOpen() && menu) {
            const focusable = Array.from(menu.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter(function (el) { return el.offsetParent !== null; });
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // tapping the dimmed page closes the menu
    document.addEventListener("click", function (e) {
        if (!bxMenuIsOpen() || !menu) return;
        if (menu.contains(e.target) || (ham && ham.contains(e.target))) return;
        closeMenu();
    });

    // keep a focused login field visible above the on-screen keyboard
    if (menu) {
        menu.addEventListener("focusin", function (e) {
            if (!e.target.matches("input")) return;
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            setTimeout(function () {
                e.target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
            }, 300);
        });
    }

    // coming back with the Back button must not restore an open, locked menu
    window.addEventListener("pageshow", function (e) {
        if (e.persisted && bxMenuIsOpen()) closeMenu({ restoreFocus: false });
    });
});

/* =========================================================
   3. GLIGHTBOX
========================================================= */

let lightbox = null;

if (typeof GLightbox !== "undefined") {

    let scrollPosition = 0;

    lightbox = GLightbox({

        touchNavigation: true,

        loop: true

    });


    lightbox.on("open", () => {

        scrollPosition =
            window.scrollY;

        setTimeout(() => {

            window.scrollTo(
                0,
                scrollPosition
            );

        }, 10);

    });


    lightbox.on("close", () => {

        setTimeout(() => {

            window.scrollTo(
                0,
                scrollPosition
            );

        }, 10);

    });

}


/* =========================================================
   4. FEATURED PRODUCT CAROUSEL
========================================================= */

let featuredTrack = null;

let featuredSlides = [];

let featuredIndex = 0;

let featuredAutoSlider = null;

let featuredScrollTimer = null;

let featuredIsResetting = false;


/*
   Keeps the automatic slider from fighting
   the user's manual swipe/scroll.
*/

let featuredIsUserScrolling = false;

let featuredResumeTimer = null;

let featuredScrollStartTimer = null;


/* =========================================================
   BUILD FEATURED CARDS
========================================================= */

async function buildFeaturedCarousel() {

    const track = document.getElementById("featuredTrack");

    if (!track) return false;

    let featuredProducts;

    try {
        featuredProducts = await api("/products?featured=true");
    } catch (err) {
        console.error("Beelinx: could not load featured products.", err);
        return false;
    }

    if (!Array.isArray(featuredProducts) || featuredProducts.length === 0) {
        console.warn("Beelinx: No featured products found.");
        return false;
    }

    track.replaceChildren();

    featuredProducts.forEach((product) => {

        const slide = document.createElement("div");
        slide.className = "featured-slide";

        /* COLLECTION / BRAND TITLE */

        const welcome = document.createElement("div");
        welcome.className = "welcome-section";

        const brandLink = document.createElement("a");
        brandLink.href = product.brandLink || "#";
        brandLink.className = "logo-link";

        const collectionName = document.createElement("p");
        collectionName.className = "collection-name";
        collectionName.textContent =
            product.collection || `${product.brand || ""} COLLECTION`;

        brandLink.appendChild(collectionName);
        welcome.appendChild(brandLink);

        /* PRODUCT IMAGE (carousel picture comes back in product.image) */

        const imageLink = document.createElement("a");
        imageLink.href = product.image;
        imageLink.className = "glightbox";
        imageLink.setAttribute("data-gallery", "featured");

        const image = document.createElement("img");
        image.className = "clothe-image";
        image.src = product.image;
        image.alt = product.name || "Featured product";
        image.loading = "lazy";

        imageLink.appendChild(image);

        /* PRODUCT TEXT */

        const text = document.createElement("div");
        text.className = "featured-text";

        const productName = document.createElement("span");
        productName.className = "featured-product-name";
        productName.textContent = product.name || "";

        const productInfo = document.createElement("span");
        productInfo.className = "featured-product-info";

        const priceLabel = document.createElement("strong");
        priceLabel.textContent = `At ${product.priceDisplay || ""}`;

        productInfo.append(
            priceLabel,
            document.createElement("br"),
            document.createElement("br"),
            document.createTextNode(product.description || "")
        );

        /* PRODUCT LINK */

        const productLink = document.createElement("a");
        productLink.className = "featured-product-link";
        productLink.href =
            `product-template.html?id=${encodeURIComponent(product.id)}`;
        productLink.textContent = "View Product";

        productLink.addEventListener("click", event => {
            event.stopPropagation();
        });

        text.append(
            productName,
            document.createElement("br"),
            document.createElement("br"),
            productInfo,
            document.createElement("br"),
            document.createElement("br"),
            productLink
        );

        /* BUILD SLIDE */

        slide.append(welcome, imageLink, text);
        track.appendChild(slide);

    });

    return true;

}


/* =========================================================
   SETUP TRUE INFINITE FEATURED CAROUSEL
========================================================= */

function setupFeaturedCarousel() {

    featuredTrack =
        document.getElementById(
            "featuredTrack"
        );

    if (!featuredTrack) return;


    const originalSlides =
        Array.from(
            featuredTrack.querySelectorAll(
                ".featured-slide"
            )
        );


    if (
        originalSlides.length === 0
    ) {

        return;

    }


    /* =====================================================
       ONLY ONE PRODUCT
    ===================================================== */

    if (
        originalSlides.length === 1
    ) {

        featuredSlides =
            originalSlides;

        featuredIndex = 0;


        requestAnimationFrame(() => {

            featuredTrack.scrollLeft = 0;

        });


        return;

    }


    /* =====================================================
       TRUE INFINITE LOOP
    ===================================================== */

    const originalHTML =
        originalSlides.map(
            slide => slide.outerHTML
        );


    featuredTrack.innerHTML = "";


    const numberOfCopies = 7;


    for (
        let copy = 0;
        copy < numberOfCopies;
        copy++
    ) {

        originalHTML.forEach(
            (html, originalIndex) => {

                const wrapper =
                    document.createElement("div");

                wrapper.innerHTML =
                    html;


                const slide =
                    wrapper.firstElementChild;


                if (slide) {

                    slide.classList.add(
                        "featured-infinite-slide"
                    );

                    slide.dataset.originalIndex =
                        originalIndex;


                    featuredTrack.appendChild(
                        slide
                    );

                }

            }
        );

    }


    featuredSlides =
        Array.from(
            featuredTrack.querySelectorAll(
                ".featured-slide"
            )
        );


    const count =
        originalSlides.length;


    /* =====================================================
       START IN COPY 3
    ===================================================== */

    requestAnimationFrame(() => {

        const startingSlide =
            featuredSlides[
                count * 3
            ];


        if (startingSlide) {

            featuredTrack.scrollLeft =
                startingSlide.offsetLeft;

        }

    });

}


/* =========================================================
   GET CURRENT FEATURED SLIDE
========================================================= */

function getCurrentFeaturedSlide() {

    if (
        !featuredTrack ||
        !featuredSlides.length
    ) {

        return 0;

    }


    const scrollPosition =
        featuredTrack.scrollLeft;


    let closestIndex = 0;

    let closestDistance =
        Infinity;


    featuredSlides.forEach(
        (slide, index) => {

            const distance =
                Math.abs(
                    slide.offsetLeft -
                    scrollPosition
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestIndex =
                    index;

            }

        }
    );


    const realCount =
        getFeaturedOriginalCount();


    if (
        realCount <= 0
    ) {

        return 0;

    }


    return (
        closestIndex %
        realCount
    );

}


/* =========================================================
   GET ORIGINAL FEATURED COUNT
========================================================= */

function getFeaturedOriginalCount() {

    if (
        !featuredSlides.length
    ) {

        return 0;

    }


    const firstOriginalIndex =
        featuredSlides.findIndex(
            slide =>
                slide.dataset.originalIndex === "0"
        );


    if (
        firstOriginalIndex === -1
    ) {

        return featuredSlides.length;

    }


    let count = 0;


    for (
        let i = firstOriginalIndex;
        i < featuredSlides.length;
        i++
    ) {

        const originalIndex =
            featuredSlides[i].dataset.originalIndex;


        if (
            originalIndex ===
            String(count)
        ) {

            count++;

        } else {

            break;

        }

    }


    return count || 1;

}


/* =========================================================
   UPDATE FEATURED INDEX
========================================================= */

function updateFeaturedIndex() {

    if (
        !featuredTrack ||
        !featuredSlides.length
    ) {

        return;

    }


    featuredIndex =
        getCurrentFeaturedSlide();

}


/* =========================================================
   MOVE TO FEATURED SLIDE
========================================================= */

function scrollToFeaturedSlide(
    realIndex,
    smooth = true
) {

    if (
        !featuredTrack ||
        featuredSlides.length === 0
    ) {

        return;

    }


    const realCount =
        getFeaturedOriginalCount();


    if (
        realCount <= 0
    ) {

        return;

    }


    realIndex =
        (
            realIndex +
            realCount
        ) %
        realCount;


    const currentPosition =
        featuredTrack.scrollLeft;


    let bestSlide = null;

    let bestDistance =
        Infinity;


    featuredSlides.forEach(
        slide => {

            if (
                Number(
                    slide.dataset.originalIndex
                ) !== realIndex
            ) {

                return;

            }


            const distance =
                Math.abs(
                    slide.offsetLeft -
                    currentPosition
                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                bestSlide =
                    slide;

            }

        }
    );


    if (!bestSlide) return;


    featuredIndex =
        realIndex;


    featuredTrack.scrollTo({

        left:
            bestSlide.offsetLeft,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* =========================================================
   NEXT FEATURED SLIDE
========================================================= */

function nextSlide() {

    if (
        !featuredTrack ||
        featuredSlides.length < 2
    ) {

        return;

    }


    if (
        featuredIsUserScrolling
    ) {

        return;

    }


    const currentIndex =
        getCurrentFeaturedSlide();


    const realCount =
        getFeaturedOriginalCount();


    if (
        realCount <= 1
    ) {

        return;

    }


    const nextIndex =
        (
            currentIndex + 1
        ) %
        realCount;


    scrollToFeaturedSlide(
        nextIndex,
        true
    );

}


/* =========================================================
   PREVIOUS FEATURED SLIDE
========================================================= */

function prevSlide() {

    if (
        !featuredTrack ||
        featuredSlides.length < 2
    ) {

        return;

    }


    const currentIndex =
        getCurrentFeaturedSlide();


    const realCount =
        getFeaturedOriginalCount();


    if (
        realCount <= 1
    ) {

        return;

    }


    const previousIndex =
        (
            currentIndex -
            1 +
            realCount
        ) %
        realCount;


    scrollToFeaturedSlide(
        previousIndex,
        true
    );

}


/* =========================================================
   FIX TRUE FEATURED INFINITE LOOP
========================================================= */

function fixFeaturedLoop() {

    if (
        !featuredTrack ||
        featuredIsResetting ||
        featuredSlides.length < 2
    ) {

        return;

    }


    const realCount =
        getFeaturedOriginalCount();


    if (
        realCount <= 0
    ) {

        return;

    }


    const middleStart =
        featuredSlides[
            realCount * 3
        ];


    const nextCopyStart =
        featuredSlides[
            realCount * 4
        ];


    if (
        !middleStart ||
        !nextCopyStart
    ) {

        return;

    }


    const copyWidth =
        nextCopyStart.offsetLeft -
        middleStart.offsetLeft;


    if (
        copyWidth <= 0
    ) {

        return;

    }


    const currentScroll =
        featuredTrack.scrollLeft;


    const rightLimit =
        middleStart.offsetLeft +
        copyWidth * 2;


    const leftLimit =
        middleStart.offsetLeft -
        copyWidth * 2;


    if (
        currentScroll >
        rightLimit
    ) {

        featuredIsResetting = true;


        featuredTrack.scrollLeft =
            currentScroll -
            copyWidth;


        requestAnimationFrame(() => {

            featuredIsResetting =
                false;

        });


        return;

    }


    if (
        currentScroll <
        leftLimit
    ) {

        featuredIsResetting = true;


        featuredTrack.scrollLeft =
            currentScroll +
            copyWidth;


        requestAnimationFrame(() => {

            featuredIsResetting =
                false;

        });

    }

}


/* =========================================================
   FEATURED SCROLL DETECTION
========================================================= */

function initializeFeaturedScroll() {

    if (!featuredTrack) return;


    featuredTrack.addEventListener(
        "scroll",
        () => {

            fixFeaturedLoop();


            clearTimeout(
                featuredScrollTimer
            );


            featuredScrollTimer =
                setTimeout(() => {

                    updateFeaturedIndex();

                }, 80);

        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH START
    ===================================================== */

    featuredTrack.addEventListener(
        "touchstart",
        () => {

            featuredIsUserScrolling =
                true;


            clearInterval(
                featuredAutoSlider
            );


            clearTimeout(
                featuredResumeTimer
            );

        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH END
    ===================================================== */

    featuredTrack.addEventListener(
        "touchend",
        () => {

            clearTimeout(
                featuredResumeTimer
            );


            featuredResumeTimer =
                setTimeout(() => {

                    featuredIsUserScrolling =
                        false;

                    startFeaturedSlider();

                }, 3500);

        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH CANCEL
    ===================================================== */

    featuredTrack.addEventListener(
        "touchcancel",
        () => {

            clearTimeout(
                featuredResumeTimer
            );


            featuredResumeTimer =
                setTimeout(() => {

                    featuredIsUserScrolling =
                        false;

                    startFeaturedSlider();

                }, 3500);

        },
        {
            passive: true
        }
    );


    /* =====================================================
       DESKTOP WHEEL / TRACKPAD
    ===================================================== */

    featuredTrack.addEventListener(
        "wheel",
        () => {

            featuredIsUserScrolling =
                true;


            clearInterval(
                featuredAutoSlider
            );


            clearTimeout(
                featuredResumeTimer
            );


            featuredResumeTimer =
                setTimeout(() => {

                    featuredIsUserScrolling =
                        false;

                    startFeaturedSlider();

                }, 3500);

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   FEATURED AUTO SLIDER
========================================================= */

function startFeaturedSlider() {

    if (
        featuredSlides.length < 2
    ) {

        return;

    }


    if (
        featuredIsUserScrolling
    ) {

        return;

    }


    clearInterval(
        featuredAutoSlider
    );


    featuredAutoSlider =
        setInterval(() => {

            if (
                !featuredIsUserScrolling
            ) {

                nextSlide();

            }

        }, 7000);

}


/* =========================================================
   RESTART FEATURED SLIDER
========================================================= */

function restartFeaturedSlider() {

    clearInterval(
        featuredAutoSlider
    );


    if (
        !featuredIsUserScrolling
    ) {

        startFeaturedSlider();

    }

}


/* =========================================================
   FEATURED HOVER
========================================================= */

function initializeFeaturedHover() {

    if (!featuredTrack) return;


    featuredTrack.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                featuredAutoSlider
            );

        }
    );


    featuredTrack.addEventListener(
        "mouseleave",
        () => {

            if (
                !featuredIsUserScrolling
            ) {

                startFeaturedSlider();

            }

        }
    );

}


/* =========================================================
   5. BRAND AD SLIDER
========================================================= */

let brandAdSlider = null;

let brandAdSlides = [];

let brandAdIndex = 0;

let brandAdInterval = null;

let brandAdScrollTimer = null;

let brandAdIsResetting = false;


/* =========================================================
   BUILD BRAND ADVERTISEMENTS
========================================================= */

async function buildBrandAds() {

    const slider = document.getElementById("brandAdSlider");

    if (!slider) return false;

    let ads;

    try {
        ads = await api("/brands?ads=true");
    } catch (err) {
        console.error("Beelinx: could not load brand ads.", err);
        return false;
    }

    if (!Array.isArray(ads) || ads.length === 0) {
        console.warn("Beelinx: No brand advertisements found.");
        return false;
    }

    slider.replaceChildren();

    /* Each ad is a brand that has a homepage banner */

    ads.forEach((ad) => {

        const slide = document.createElement("div");
        slide.className = "brand-ad-slide";

        const link = document.createElement("a");
        link.href = ad.page || "#";

        const image = document.createElement("img");
        image.src = ad.adImage || "";
        image.alt = ad.adAlt || `${ad.name || "Brand"} collection`;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.className = "brand-ad-content";

        const title = document.createElement("p");
        title.className = "brand-ad-title";
        title.textContent = ad.adTitle || ad.name || "";

        const subtitle = document.createElement("p");
        subtitle.className = "brand-ad-subtitle";
        subtitle.textContent = ad.adSubtitle || "EXPLORE THE COLLECTION";

        content.append(title, subtitle);
        link.append(image, content);
        slide.appendChild(link);
        slider.appendChild(slide);

    });

    return true;

}


/* =========================================================
   SETUP TRUE INFINITE BRAND AD CAROUSEL
========================================================= */

function setupBrandAdCarousel() {

    brandAdSlider =
        document.getElementById(
            "brandAdSlider"
        );


    if (!brandAdSlider) return;


    const originalSlides =
        Array.from(
            brandAdSlider.querySelectorAll(
                ".brand-ad-slide"
            )
        );


    if (
        originalSlides.length === 0
    ) {

        return;

    }


    /* =====================================================
       ONLY ONE AD
    ===================================================== */

    if (
        originalSlides.length === 1
    ) {

        brandAdSlides =
            originalSlides;

        brandAdIndex = 0;


        requestAnimationFrame(() => {

            brandAdSlider.scrollLeft =
                0;

        });


        return;

    }


    /* =====================================================
       TRUE INFINITE LOOP
    ===================================================== */

    const originalHTML =
        originalSlides.map(
            slide => slide.outerHTML
        );


    brandAdSlider.innerHTML = "";


    const numberOfCopies = 7;


    for (
        let copy = 0;
        copy < numberOfCopies;
        copy++
    ) {

        originalHTML.forEach(
            (html, originalIndex) => {

                const wrapper =
                    document.createElement("div");


                wrapper.innerHTML =
                    html;


                const slide =
                    wrapper.firstElementChild;


                if (slide) {

                    slide.classList.add(
                        "brand-ad-infinite-slide"
                    );


                    slide.dataset.originalIndex =
                        originalIndex;


                    brandAdSlider.appendChild(
                        slide
                    );

                }

            }
        );

    }


    brandAdSlides =
        Array.from(
            brandAdSlider.querySelectorAll(
                ".brand-ad-slide"
            )
        );


    const count =
        originalSlides.length;


    /* =====================================================
       START IN COPY 3
    ===================================================== */

    requestAnimationFrame(() => {

        const startingSlide =
            brandAdSlides[
                count * 3
            ];


        if (startingSlide) {

            brandAdSlider.scrollLeft =
                startingSlide.offsetLeft;

        }

    });

}


/* =========================================================
   GET CURRENT BRAND AD
========================================================= */

function getCurrentBrandAd() {

    if (
        !brandAdSlider ||
        !brandAdSlides.length
    ) {

        return 0;

    }


    const scrollPosition =
        brandAdSlider.scrollLeft;


    let closestIndex = 0;

    let closestDistance =
        Infinity;


    brandAdSlides.forEach(
        (slide, index) => {

            const distance =
                Math.abs(
                    slide.offsetLeft -
                    scrollPosition
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestIndex =
                    index;

            }

        }
    );


    const realCount =
        getBrandAdOriginalCount();


    if (
        realCount <= 0
    ) {

        return 0;

    }


    return (
        closestIndex %
        realCount
    );

}


/* =========================================================
   GET ORIGINAL BRAND AD COUNT
========================================================= */

function getBrandAdOriginalCount() {

    if (
        !brandAdSlides.length
    ) {

        return 0;

    }


    const firstOriginal =
        brandAdSlides.findIndex(
            slide =>
                slide.dataset.originalIndex === "0"
        );


    if (
        firstOriginal === -1
    ) {

        return brandAdSlides.length;

    }


    let count = 0;


    for (
        let i = firstOriginal;
        i < brandAdSlides.length;
        i++
    ) {

        const originalIndex =
            brandAdSlides[i].dataset.originalIndex;


        if (
            originalIndex ===
            String(count)
        ) {

            count++;

        } else {

            break;

        }

    }


    return count || 1;

}


/* =========================================================
   MOVE TO BRAND AD
========================================================= */

function scrollToBrandAd(
    realIndex,
    smooth = true
) {

    if (
        !brandAdSlider ||
        brandAdSlides.length === 0
    ) {

        return;

    }


    const count =
        getBrandAdOriginalCount();


    if (
        count <= 0
    ) {

        return;

    }


    realIndex =
        (
            realIndex +
            count
        ) %
        count;


    const currentPosition =
        brandAdSlider.scrollLeft;


    let bestSlide = null;

    let bestDistance =
        Infinity;


    brandAdSlides.forEach(
        slide => {

            if (
                Number(
                    slide.dataset.originalIndex
                ) !== realIndex
            ) {

                return;

            }


            const distance =
                Math.abs(
                    slide.offsetLeft -
                    currentPosition
                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                bestSlide =
                    slide;

            }

        }
    );


    if (!bestSlide) return;


    brandAdIndex =
        realIndex;


    brandAdSlider.scrollTo({

        left:
            bestSlide.offsetLeft,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* =========================================================
   GO TO BRAND AD
========================================================= */

function goToBrandAd(index) {

    if (
        !brandAdSlides.length
    ) {

        return;

    }


    const count =
        getBrandAdOriginalCount();


    if (
        count <= 0
    ) {

        return;

    }


    index =
        (
            index +
            count
        ) %
        count;


    scrollToBrandAd(
        index,
        true
    );


    restartBrandAdSlider();

}


/* =========================================================
   SHOW BRAND AD
========================================================= */

function showBrandAd(index) {

    goToBrandAd(index);

}


/* =========================================================
   NEXT BRAND AD
========================================================= */

function nextBrandAd() {

    if (
        !brandAdSlider ||
        brandAdSlides.length < 2
    ) {

        return;

    }


    const count =
        getBrandAdOriginalCount();


    if (
        count <= 1
    ) {

        return;

    }


    const currentIndex =
        getCurrentBrandAd();


    const nextIndex =
        (
            currentIndex + 1
        ) %
        count;


    scrollToBrandAd(
        nextIndex,
        true
    );

}


/* =========================================================
   PREVIOUS BRAND AD
========================================================= */

function prevBrandAd() {

    if (
        !brandAdSlider ||
        brandAdSlides.length < 2
    ) {

        return;

    }


    const count =
        getBrandAdOriginalCount();


    if (
        count <= 1
    ) {

        return;

    }


    const currentIndex =
        getCurrentBrandAd();


    const previousIndex =
        (
            currentIndex -
            1 +
            count
        ) %
        count;


    scrollToBrandAd(
        previousIndex,
        true
    );

}


/* =========================================================
   FIX TRUE BRAND AD INFINITE LOOP
========================================================= */

function fixBrandAdLoop() {

    if (
        !brandAdSlider ||
        brandAdIsResetting ||
        brandAdSlides.length < 2
    ) {

        return;

    }


    const count =
        getBrandAdOriginalCount();


    if (
        count <= 0
    ) {

        return;

    }


    const middleStart =
        brandAdSlides[
            count * 3
        ];


    const nextCopyStart =
        brandAdSlides[
            count * 4
        ];


    if (
        !middleStart ||
        !nextCopyStart
    ) {

        return;

    }


    const copyWidth =
        nextCopyStart.offsetLeft -
        middleStart.offsetLeft;


    if (
        copyWidth <= 0
    ) {

        return;

    }


    const currentScroll =
        brandAdSlider.scrollLeft;


    const rightLimit =
        middleStart.offsetLeft +
        copyWidth * 2;


    const leftLimit =
        middleStart.offsetLeft -
        copyWidth * 2;


    if (
        currentScroll >
        rightLimit
    ) {

        brandAdIsResetting = true;


        brandAdSlider.scrollLeft =
            currentScroll -
            copyWidth;


        requestAnimationFrame(() => {

            brandAdIsResetting =
                false;

        });


        return;

    }


    if (
        currentScroll <
        leftLimit
    ) {

        brandAdIsResetting = true;


        brandAdSlider.scrollLeft =
            currentScroll +
            copyWidth;


        requestAnimationFrame(() => {

            brandAdIsResetting =
                false;

        });

    }

}


/* =========================================================
   BRAND AD SCROLL DETECTION
========================================================= */

function initializeBrandAdScroll() {

    if (!brandAdSlider) return;


    brandAdSlider.addEventListener(
        "scroll",
        () => {

            fixBrandAdLoop();


            clearTimeout(
                brandAdScrollTimer
            );


            brandAdScrollTimer =
                setTimeout(() => {

                    brandAdIndex =
                        getCurrentBrandAd();

                }, 80);

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   BRAND AD AUTO SLIDER
========================================================= */

function startBrandAdSlider() {

    if (
        brandAdSlides.length < 2
    ) {

        return;

    }


    clearInterval(
        brandAdInterval
    );


    brandAdInterval =
        setInterval(() => {

            nextBrandAd();

        }, 10000);

}


function restartBrandAdSlider() {

    clearInterval(
        brandAdInterval
    );


    startBrandAdSlider();

}


/* =========================================================
   BRAND AD HOVER
========================================================= */

function initializeBrandAdHover() {

    if (!brandAdSlider) return;


    brandAdSlider.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                brandAdInterval
            );

        }
    );


    brandAdSlider.addEventListener(
        "mouseleave",
        () => {

            startBrandAdSlider();

        }
    );

}


/* =========================================================
   6. INITIALIZE EVERYTHING
   The carousels are built from the API first,
   and only then set up and started.
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await Promise.all([
            buildFeaturedCarousel(),
            buildBrandAds()
        ]);

        /* FEATURED PRODUCTS */

        setupFeaturedCarousel();
        initializeFeaturedScroll();
        initializeFeaturedHover();
        startFeaturedSlider();

        if (lightbox && typeof lightbox.reload === "function") {
            lightbox.reload();
        }

        /* BRAND ADS */

        setupBrandAdCarousel();
        initializeBrandAdScroll();
        initializeBrandAdHover();
        startBrandAdSlider();

    }
);
