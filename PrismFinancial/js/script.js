// Main JavaScript for Prism Financial Systems

// Function to toggle the Synthed AI chat interface
function toggleSynthedChat() {
  const chatBubble = document.querySelector('.chat-bubble');
  const chatUI = document.querySelector('.chat-ui');
  
  if (chatBubble && chatUI) {
    chatBubble.style.display = 'none';
    chatUI.style.display = 'flex';
  }
}

// Initialize event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Synthed AI chat button
  const askButton = document.querySelector('.ask-button');
  if (askButton) {
    askButton.addEventListener('click', toggleSynthedChat);
  }
  
  // Navigation highlighting
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
