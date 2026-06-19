document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setHero(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(active + 1);
        }, 5000);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var currentChip = "";

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function matches(card, query, chip) {
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].map(normalize).join(" ");

            var queryOk = !query || haystack.indexOf(query) !== -1;
            var chipOk = !chip || haystack.indexOf(normalize(chip)) !== -1;
            return queryOk && chipOk;
        }

        function update() {
            var query = input ? normalize(input.value) : "";
            cards.forEach(function (card) {
                card.hidden = !matches(card, query, currentChip);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", update);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                currentChip = chip.getAttribute("data-filter-chip") || "";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                update();
            });
        });

        update();
    });
});
