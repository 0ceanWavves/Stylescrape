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
        copyButton.style.position = 'absolute';
        copyButton.style.top = '0.5rem';
        copyButton.style.right = '0.5rem';
        copyButton.style.padding = '0.25rem 0.5rem';
        copyButton.style.fontSize = '0.75rem';
        copyButton.style.background = '#1f2937';
        copyButton.style.border = '1px solid #374151';
        copyButton.style.borderRadius = '0.25rem';
        copyButton.style.color = '#e5e7eb';
        copyButton.style.cursor = 'pointer';
        
        // Style the code block container for the button
        block.style.position = 'relative';
        
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
});