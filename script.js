document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const TOTAL_CATS = 10;
    const API_URL = 'https://cataas.com/cat/cute';
    const CAT_FACTS_API = 'https://cat-fact.herokuapp.com/facts/random';
    const SWIPE_THRESHOLD = 100;
    const DRAG_ROTATION_FACTOR = 20;
    const OPACITY_FACTOR = 100;

    // DOM Elements
    const elements = {
        card: document.getElementById('current-card'),
        catImage: document.querySelector('.cat-image'),
        likeIndicator: document.querySelector('.like-indicator'),
        dislikeIndicator: document.querySelector('.dislike-indicator'),
        progressBar: document.querySelector('.progress-bar'),
        resultsContainer: document.querySelector('.results-container'),
        likedCountElement: document.getElementById('liked-count'),
        totalCountElement: document.getElementById('total-count'),
        likedCatsContainer: document.getElementById('liked-cats-container'),
        restartBtn: document.getElementById('restart-btn'),
        helpModal: document.getElementById('help-modal'),
        helpBtn: document.getElementById('help-btn'),
        closeHelp: document.getElementById('close-help'),
        loader: document.querySelector('.loader')
    };

    // State
    let state = {
        currentCatIndex: 0,
        likedCats: [],
        touchStartX: 0,
        touchEndX: 0,
        isDragging: false,
        startPosX: 0,
        currentPosX: 0
    };

    // Initialize the app
    init();

    function init() {
        // Reset state
        state = {
            currentCatIndex: 0,
            likedCats: [],
            touchStartX: 0,
            touchEndX: 0,
            isDragging: false,
            startPosX: 0,
            currentPosX: 0
        };

        // Reset UI
        elements.progressBar.style.width = '0%';
        elements.resultsContainer.classList.add('hidden');
        resetCardPosition();

        // Load first cat
        loadNextCat();

        // Event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Touch events
        elements.card.addEventListener('touchstart', handleTouchStart, { passive: false });
        elements.card.addEventListener('touchmove', handleTouchMove, { passive: false });
        elements.card.addEventListener('touchend', handleTouchEnd);

        // Mouse events
        elements.card.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Button events
        elements.restartBtn.addEventListener('click', init);
        elements.helpBtn.addEventListener('click', showHelpModal);
        elements.closeHelp.addEventListener('click', hideHelpModal);
    }

    function showHelpModal() {
        elements.helpModal.classList.remove('hidden');
        elements.helpBtn.classList.add('hidden');
    }

    function hideHelpModal() {
        elements.helpModal.classList.add('hidden');
        elements.helpBtn.classList.remove('hidden');
    }

    // Haptic feedback
    function vibrate(pattern = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    async function loadNextCat() {
        if (state.currentCatIndex >= TOTAL_CATS) {
            showResults();
            return;
        }

        // Show loader
        elements.catImage.style.display = 'none';
        elements.loader.style.display = 'block';

        try {
            const imageUrl = `${API_URL}?${Date.now()}`;
            const img = new Image();

            img.onload = () => {
                elements.catImage.src = imageUrl;
                elements.catImage.style.display = 'block';
                elements.loader.style.display = 'none';

                updateProgress();
            };

            img.src = imageUrl;
        } catch (error) {
            console.error('Error loading cat:', error);
            setTimeout(loadNextCat, 1000);
        }
    }

    function updateProgress() {
        const progress = (state.currentCatIndex / TOTAL_CATS) * 100;
        elements.progressBar.style.width = `${progress}%`;
        elements.totalCountElement.textContent = TOTAL_CATS;
    }

    async function fetchCatFact() {
        try {
            const response = await fetch(CAT_FACTS_API);
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Error fetching cat fact:', error);
            return "Cats have been domesticated for over 4,000 years!";
        }
    }

    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault();
        state.touchStartX = e.changedTouches[0].screenX;
        state.startPosX = state.touchStartX;
        state.isDragging = true;
    }

    function handleTouchMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();

        state.touchEndX = e.changedTouches[0].screenX;
        state.currentPosX = state.touchEndX - state.startPosX;

        updateCardPosition();
        updateIndicatorOpacity();
    }

    function handleTouchEnd() {
        if (!state.isDragging) return;
        state.isDragging = false;

        handleSwipeEnd();
    }

    // Mouse event handlers
    function handleMouseDown(e) {
        e.preventDefault();
        state.startPosX = e.clientX;
        state.isDragging = true;
        elements.card.style.transition = 'none';
    }

    function handleMouseMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();

        state.currentPosX = e.clientX - state.startPosX;

        updateCardPosition();
        updateIndicatorOpacity();
    }

    function handleMouseUp() {
        if (!state.isDragging) return;
        state.isDragging = false;
        elements.card.style.transition = 'transform 0.3s, opacity 0.3s';

        handleSwipeEnd();
    }

    // Common swipe functions
    function updateCardPosition() {
        elements.card.style.transform =
            `translateX(${state.currentPosX}px) rotate(${state.currentPosX / DRAG_ROTATION_FACTOR}deg)`;
    }

    function updateIndicatorOpacity() {
        if (state.currentPosX > 50) {
            elements.likeIndicator.style.opacity = Math.min(1, (state.currentPosX - 50) / OPACITY_FACTOR);
            elements.dislikeIndicator.style.opacity = 0;
        } else if (state.currentPosX < -50) {
            elements.dislikeIndicator.style.opacity = Math.min(1, (-state.currentPosX - 50) / OPACITY_FACTOR);
            elements.likeIndicator.style.opacity = 0;
        } else {
            elements.likeIndicator.style.opacity = 0;
            elements.dislikeIndicator.style.opacity = 0;
        }
    }

    function handleSwipeEnd() {
        if (state.currentPosX > SWIPE_THRESHOLD && state.currentCatIndex < TOTAL_CATS) {
            handleLike();
        } else if (state.currentPosX < -SWIPE_THRESHOLD && state.currentCatIndex < TOTAL_CATS) {
            handleDislike();
        } else {
            resetCardPosition();
        }
    }

    function handleLike() {
        vibrate([50, 50, 50]);
        state.likedCats.push(elements.catImage.src);
        elements.card.classList.add('swipe-right');
        moveToNextCat();
    }

    function handleDislike() {
        vibrate(200);
        elements.card.classList.add('swipe-left');
        moveToNextCat();
    }

    function moveToNextCat() {
        setTimeout(() => {
            state.currentCatIndex++;
            resetCardPosition();
            loadNextCat();
        }, 300);
    }

    function resetCardPosition() {
        elements.card.style.transform = 'translateX(0) rotate(0)';
        elements.card.classList.remove('swipe-right', 'swipe-left');
        elements.likeIndicator.style.opacity = 0;
        elements.dislikeIndicator.style.opacity = 0;
    }

    function fireConfetti() {
        const duration = 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

        const interval = setInterval(() => {
            if (Date.now() >= animationEnd) {
                return clearInterval(interval);
            }

            confetti({
                ...defaults,
                particleCount: 50,
                origin: { x: Math.random(), y: Math.random() - 0.2 }
            });
        }, 200);
    }

    async function showResults() {
        fireConfetti();
        elements.progressBar.style.width = '100%';
        elements.resultsContainer.classList.remove('hidden');
        elements.likedCountElement.textContent = state.likedCats.length;

        displayLikedCats();
    }

    function displayLikedCats() {
        elements.likedCatsContainer.innerHTML = '';
        state.likedCats.forEach(catUrl => {
            const img = document.createElement('img');
            img.src = catUrl;
            img.alt = 'Liked cat';
            elements.likedCatsContainer.appendChild(img);
        });
    }
});