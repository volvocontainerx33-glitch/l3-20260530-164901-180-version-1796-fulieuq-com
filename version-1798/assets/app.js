(function () {
    var panel = document.querySelector('.mobile-panel');
    var menu = document.querySelector('.menu-toggle');

    if (menu && panel) {
        menu.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var stage = document.querySelector('.hero-stage');
        if (!stage) {
            return;
        }

        var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
        var dots = stage.querySelector('.hero-dots');
        var prev = stage.querySelector('.hero-control.prev');
        var next = stage.querySelector('.hero-control.next');
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            if (dots) {
                Array.prototype.slice.call(dots.children).forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }
        }

        if (dots) {
            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换推荐影片');
                dot.addEventListener('click', function () {
                    show(i);
                });
                dots.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilter() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));
        if (!lists.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        lists.forEach(function (list) {
            var wrapper = list.closest('.section-block') || document;
            var input = wrapper.querySelector('.list-filter');
            var select = wrapper.querySelector('.sort-select');
            var originalCards = Array.prototype.slice.call(list.children);
            var noResult = document.createElement('div');
            noResult.className = 'no-results';
            noResult.textContent = '没有匹配的影片';

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var cards = originalCards.slice();

                if (select) {
                    if (select.value === 'year-desc') {
                        cards.sort(function (a, b) {
                            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                        });
                    }
                    if (select.value === 'year-asc') {
                        cards.sort(function (a, b) {
                            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                        });
                    }
                    if (select.value === 'title') {
                        cards.sort(function (a, b) {
                            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                        });
                    }
                }

                cards.forEach(function (card) {
                    list.appendChild(card);
                    var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.textContent);
                    card.style.display = haystack.indexOf(query) !== -1 ? '' : 'none';
                });

                var hasVisible = cards.some(function (card) {
                    return card.style.display !== 'none';
                });

                if (!hasVisible && !noResult.parentNode) {
                    list.appendChild(noResult);
                }

                if (hasVisible && noResult.parentNode) {
                    noResult.parentNode.removeChild(noResult);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (select) {
                select.addEventListener('change', apply);
            }

            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-cover');
            var source = box.getAttribute('data-m3u8');
            var attached = false;

            function attach() {
                if (attached || !video || !source) {
                    return;
                }

                attached = true;

                if (/\.m3u8(\?|$)/i.test(source)) {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        box.hlsInstance = hls;
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                } else {
                    video.src = source;
                }
            }

            function play() {
                attach();
                if (button) {
                    button.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', function () {
                    attach();
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    if (button && video.currentTime === 0) {
                        button.classList.remove('hidden');
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilter();
        initPlayers();
    });
}());
