const slider = document.querySelector('.slider');
let autoSlideInterval;

function activate(e) {
  const items = document.querySelectorAll('.card');
  
  // Handle navigation buttons
  if (e.target.matches('.next')) {
    slider.append(items[0]);
    resetAutoSlide();
    return;
  }
  if (e.target.matches('.prev')) {
    slider.prepend(items[items.length-1]);
    resetAutoSlide();
    return;
  }
  
  // Handle card clicks
  const clickedCard = e.target.closest('.card');
  if (clickedCard) {
    // Check if the clicked card is NOT the second one (active one)
    // If it is NOT the second one, we move it to front.
    // If it IS the second one (or we want to allow navigation on any click if it has a link),
    // we check for a link.
    
    // Current logic: If it's not the active card (nth-child(2)), move it to front.
    // If it IS the active card, or if we want to prioritize navigation:
    
    // Let's check for a link first.
    // We look for a button with onclick or an anchor tag.
    const linkButton = clickedCard.querySelector('button[onclick]');
    const linkAnchor = clickedCard.querySelector('a');
    
    // If the card is already active (it's the second one), OR if we want to allow immediate navigation:
    // The user request said: "when I click on the smaller cards, it will go to that page"
    // This implies that even if it's small (not active), it should navigate?
    // "when I click on the smaller cards, it will go to that page" -> This sounds like direct navigation.
    // BUT, usually in a slider, clicking a small card brings it to focus.
    // Let's stick to the plan: "Check if the clicked card has a link... If yes, navigate to that link."
    
    // However, if I navigate away, the user leaves the page.
    // If I just move it to front, they see the content.
    // The user said "go to that page".
    
    // Let's try to find a destination.
    let destination = null;
    if (linkButton) {
        // Extract URL from onclick string... this is a bit messy but works for the current pattern
        // onclick="window.open('...')" or "window.location='...'"
        const match = linkButton.getAttribute('onclick').match(/['"]([^'"]+)['"]/);
        if (match) destination = match[1];
    } else if (linkAnchor) {
        destination = linkAnchor.href;
    }

    // If we found a destination, navigate.
    if (destination) {
        if (linkButton && linkButton.getAttribute('onclick').includes('window.open')) {
             window.open(destination, '_blank');
        } else {
             window.location.href = destination;
        }
        return;
    }

    // If no link found, fallback to existing behavior (move to front)
    if (!clickedCard.matches(':nth-child(2)')) {
        const cardIndex = Array.from(items).indexOf(clickedCard);
        for (let i = 0; i < cardIndex - 1; i++) {
            slider.append(items[0]);
        }
        resetAutoSlide();
    }
  }
}

function autoSlide() {
    const items = document.querySelectorAll('.card');
    slider.append(items[0]);
}

function startAutoSlide() {
    autoSlideInterval = setInterval(autoSlide, 20000); // 10 seconds
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

document.addEventListener('click', activate, false);

// Arrow key navigation
document.addEventListener('keydown', function(e) {
    const items = document.querySelectorAll('.card');
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        slider.append(items[0]);
        resetAutoSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        slider.prepend(items[items.length - 1]);
        resetAutoSlide();
    }
});

// Start auto-slide on load
startAutoSlide();

// Pause on hover
slider.addEventListener('mouseenter', stopAutoSlide);
slider.addEventListener('mouseleave', startAutoSlide);