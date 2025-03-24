// Design System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Navigation highlighting
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    
    // Set active navigation based on URL hash or default to first item
    function setActiveNavigation() {
        const hash = window.location.hash || '#overview';
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            }
        });
    }
    
    // Scroll event to highlight current section in navigation
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 150)) {
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
    
    // Initial setup
    setActiveNavigation();
    
    // Handle hash change
    window.addEventListener('hashchange', setActiveNavigation);
    
    // Make code snippets highlight and copy functionality
    const codeBlocks = document.querySelectorAll('.component-code');
    
    codeBlocks.forEach(block => {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';
        
        // Append the button to the code block
        block.appendChild(copyButton);
        
        // Add click event to copy code
        copyButton.addEventListener('click', function() {
            const codeText = block.textContent.replace('Copy', '').trim();
            navigator.clipboard.writeText(codeText).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
        });
    });
    
    // Synthed AI Chat Button Functionality
    const askButtons = document.querySelectorAll('.ask-button');
    
    askButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.synthed-ai-card');
            if (card) {
                const chatBubble = card.querySelector('.chat-bubble');
                const chatUI = card.querySelector('.chat-ui');
                
                if (chatBubble && chatUI) {
                    chatBubble.style.display = 'none';
                    chatUI.style.display = 'flex';
                    chatUI.innerHTML = `
                        <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem;">
                            <div style="align-self: flex-start; background-color: #1f2937; padding: 0.75rem; border-radius: 0.5rem; max-width: 80%;">
                                What's our break-even point?
                            </div>
                            <div style="align-self: flex-end; background-color: #0ea5e9; padding: 0.75rem; border-radius: 0.5rem; max-width: 80%;">
                                Based on your current financial data, your break-even point is approximately $73,450 per month. Would you like me to show you how to reduce that?
                            </div>
                        </div>
                    `;
                }
            }
        });
    });
});