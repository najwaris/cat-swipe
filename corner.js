// Breed data with Wikipedia links
const breeds = [
    {
        name: "Siamese",
        desc: "Vocal, intelligent, and social cats with striking blue eyes. Known for their distinctive color points and talkative nature.",
        img: "https://cataas.com/cat/says/siamese?type=square&width=600",
        learnMore: "https://en.wikipedia.org/wiki/Siamese_cat"
    },
    {
        name: "Maine Coon",
        desc: "Gentle giants known for their large size, tufted ears, and bushy tails. Often called 'dogs of the cat world'.",
        img: "https://cataas.com/cat/says/maine%20coon?type=square&width=600",
        learnMore: "https://en.wikipedia.org/wiki/Maine_Coon"
    },
    {
        name: "Persian",
        desc: "Luxurious long-haired cats with calm personalities and distinctive flat faces. Require regular grooming.",
        img: "https://cataas.com/cat/says/persian?type=square&width=600",
        learnMore: "https://en.wikipedia.org/wiki/Persian_cat"
    },
    {
        name: "Bengal",
        desc: "Energetic cats with wild-looking spotted coats resembling their leopard cat ancestors.",
        img: "https://cataas.com/cat/says/bengal?type=square&width=600",
        learnMore: "https://en.wikipedia.org/wiki/Bengal_cat"
    }
];

// Fun facts
const facts = [
    "Cats can rotate their ears 180 degrees",
    "A cat's nose print is unique like a fingerprint",
    "Cats sleep 12-16 hours daily",
    "They have 3 eyelids per eye",
    "Cats can't taste sweetness",
    "The oldest known pet cat existed 9,500 years ago",
    "Cats walk like camels and giraffes (right feet first, then left)"
];

// DOM Elements
const breedImage = document.getElementById('breed-image');
const breedTitle = document.getElementById('breed-title');
const breedDesc = document.getElementById('breed-description');
const learnMoreBtn = document.getElementById('learn-more');
const nextBreedBtn = document.querySelector('.next-breed-btn');
const factElements = document.querySelectorAll('.fact');
const nextFactBtn = document.querySelector('.next-fact');
const breedLoader = document.querySelector('.breed-loader');

let currentBreedIndex = 0;
let currentFactIndex = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateBreedDisplay();
    updateFactDisplay();

    // Set first fact as active
    factElements[0].classList.add('active');
});

// Breed rotation
nextBreedBtn.addEventListener('click', () => {
    currentBreedIndex = (currentBreedIndex + 1) % breeds.length;
    updateBreedDisplay();
});

// Fact carousel
nextFactBtn.addEventListener('click', () => {
    currentFactIndex = (currentFactIndex + 1) % facts.length;
    updateFactDisplay();
});

function updateBreedDisplay() {
    const breed = breeds[currentBreedIndex];

    // Show loader
    breedLoader.style.display = 'block';
    breedImage.style.opacity = '0';

    // Preload image
    const img = new Image();
    img.src = breed.img;

    img.onload = () => {
        breedImage.src = breed.img;
        breedImage.style.opacity = '1';
        breedLoader.style.display = 'none';
    };

    img.onerror = () => {
        // Fallback if breed image fails
        breedImage.src = 'https://cataas.com/cat?width=600';
        breedImage.style.opacity = '1';
        breedLoader.style.display = 'none';
    };

    breedTitle.textContent = breed.name;
    breedDesc.textContent = breed.desc;
    learnMoreBtn.href = breed.learnMore;
}

function updateFactDisplay() {
    // Hide all facts
    factElements.forEach(fact => {
        fact.classList.remove('active');
    });

    // Set new fact text
    factElements[0].textContent = facts[currentFactIndex];
    factElements[0].classList.add('active');

    // Animate carousel
    setTimeout(() => {
        factElements[0].classList.remove('active');
        setTimeout(() => {
            factElements[0].textContent = facts[currentFactIndex];
            factElements[0].classList.add('active');
        }, 500);
    }, 500);
}

// Auto-rotate facts every 5 seconds
setInterval(() => {
    currentFactIndex = (currentFactIndex + 1) % facts.length;
    updateFactDisplay();
}, 5000);