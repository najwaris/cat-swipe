document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const TOTAL_CATS = 10;
    const API_URL = 'https://cataas.com/cat/cute';
    
    // DOM Elements
    const card = document.getElementById('current-card');
    const catImage = card.querySelector('.cat-image');
    const likeIndicator = card.querySelector('.like-indicator');
    const dislikeIndicator = card.querySelector('.dislike-indicator');
    const progressBar = document.querySelector('.progress-bar');
    const resultsContainer = document.querySelector('.results-container');
    const likedCountElement = document.getElementById('liked-count');
    const totalCountElement = document.getElementById('total-count');
    const likedCatsContainer = document.getElementById('liked-cats-container');
    const restartBtn = document.getElementById('restart-btn');
    
    // State
    let currentCatIndex = 0;
    let likedCats = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let startPosX = 0;
    let currentPosX = 0;
    
    // Initialize the app
    init();
    
    function init() {
        currentCatIndex = 0;
        likedCats = [];
        progressBar.style.width = '0%';
        resultsContainer.classList.add('hidden');
        loadNextCat();
        
        // Add event listeners for swipe
        card.addEventListener('touchstart', handleTouchStart, { passive: false });
        card.addEventListener('touchmove', handleTouchMove, { passive: false });
        card.addEventListener('touchend', handleTouchEnd);
        
        card.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        restartBtn.addEventListener('click', init);
    }
    
    async function loadNextCat() {
        if (currentCatIndex >= TOTAL_CATS) {
            showResults();
            return;
        }
        
        // Show loader
        catImage.style.display = 'none';
        card.querySelector('.loader').style.display = 'block';
        
        try {
            // First fetch to get the image ID
            // const response = await fetch(API_URL);
            // const data = await response.json();
            
            // Construct the actual image URL
            // const imageUrl = `https://cataas.com${data.url}`;
            const imageUrl = `https://cataas.com/cat/cute?${Date.now()}`;
            
            // Preload the image
            const img = new Image();
            img.src = imageUrl;
            
            img.onload = () => {
                catImage.src = imageUrl;
                catImage.style.display = 'block';
                card.querySelector('.loader').style.display = 'none';
                
                // Update progress
                progressBar.style.width = `${(currentCatIndex / TOTAL_CATS) * 100}%`;
                totalCountElement.textContent = TOTAL_CATS;
            };
            
        } catch (error) {
            console.error('Error loading cat:', error);
            // Retry or show error
            setTimeout(loadNextCat, 1000);
        }
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        touchStartX = e.changedTouches[0].screenX;
        startPosX = touchStartX;
        isDragging = true;
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        touchEndX = e.changedTouches[0].screenX;
        currentPosX = touchEndX - startPosX;
        
        // Move the card
        card.style.transform = `translateX(${currentPosX}px) rotate(${currentPosX / 20}deg)`;
        
        // Show indicator
        if (currentPosX > 50) {
            likeIndicator.style.opacity = Math.min(1, (currentPosX - 50) / 100);
            dislikeIndicator.style.opacity = 0;
        } else if (currentPosX < -50) {
            dislikeIndicator.style.opacity = Math.min(1, (-currentPosX - 50) / 100);
            likeIndicator.style.opacity = 0;
        } else {
            likeIndicator.style.opacity = 0;
            dislikeIndicator.style.opacity = 0;
        }
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Determine if it's a like or dislike
        const threshold = 100;
        
        if (currentPosX > threshold) {
            // Like
            card.classList.add('swipe-right');
            likedCats.push(catImage.src);
            setTimeout(() => {
                currentCatIndex++;
                resetCardPosition();
                loadNextCat();
            }, 300);
        } else if (currentPosX < -threshold) {
            // Dislike
            card.classList.add('swipe-left');
            setTimeout(() => {
                currentCatIndex++;
                resetCardPosition();
                loadNextCat();
            }, 300);
        } else {
            // Return to center
            resetCardPosition();
        }
    }
    
    function handleMouseDown(e) {
        e.preventDefault();
        startPosX = e.clientX;
        isDragging = true;
        card.style.transition = 'none';
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentPosX = e.clientX - startPosX;
        
        // Move the card
        card.style.transform = `translateX(${currentPosX}px) rotate(${currentPosX / 20}deg)`;
        
        // Show indicator
        if (currentPosX > 50) {
            likeIndicator.style.opacity = Math.min(1, (currentPosX - 50) / 100);
            dislikeIndicator.style.opacity = 0;
        } else if (currentPosX < -50) {
            dislikeIndicator.style.opacity = Math.min(1, (-currentPosX - 50) / 100);
            likeIndicator.style.opacity = 0;
        } else {
            likeIndicator.style.opacity = 0;
            dislikeIndicator.style.opacity = 0;
        }
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = 'transform 0.3s, opacity 0.3s';
        
        // Determine if it's a like or dislike
        const threshold = 100;
        
        if (currentPosX > threshold) {
            // Like
            card.classList.add('swipe-right');
            likedCats.push(catImage.src);
            setTimeout(() => {
                currentCatIndex++;
                resetCardPosition();
                loadNextCat();
            }, 300);
        } else if (currentPosX < -threshold) {
            // Dislike
            card.classList.add('swipe-left');
            setTimeout(() => {
                currentCatIndex++;
                resetCardPosition();
                loadNextCat();
            }, 300);
        } else {
            // Return to center
            resetCardPosition();
        }
    }
    
    function resetCardPosition() {
        card.style.transform = 'translateX(0) rotate(0)';
        card.classList.remove('swipe-right', 'swipe-left');
        likeIndicator.style.opacity = 0;
        dislikeIndicator.style.opacity = 0;
    }
    
    function showResults() {
        resultsContainer.classList.remove('hidden');
        likedCountElement.textContent = likedCats.length;
        
        // Display liked cats
        likedCatsContainer.innerHTML = '';
        likedCats.forEach(catUrl => {
            const img = document.createElement('img');
            img.src = catUrl;
            img.alt = 'Liked cat';
            likedCatsContainer.appendChild(img);
        });
    }
});