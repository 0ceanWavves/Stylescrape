/**
 * Synthed AI - PrismFinancial
 * A JavaScript module that adds AI-powered financial assistance to the PrismFinancial platform.
 */

const SynthedAI = (function() {
    // Private variables
    let isInitialized = false;
    let chatContainer = null;
    let chatHistory = [];

    // Predefined responses for demo purposes
    const responses = {
        "what's our break-even point": "Based on your current financial data, your break-even point is approximately $42,500 monthly revenue. You're currently averaging $46,870, putting you 10.3% above break-even. Would you like more detailed analysis?",
        "how's our cash flow": "Your cash flow is positive but trending downward. Last month you had $78,350 inflow and $72,140 outflow. This month is projected at $76,200 inflow and $73,900 outflow. I recommend reviewing your SaaS subscriptions, which increased 18% this quarter.",
        "what are my largest expenses": "Your top 3 expenses this month are: 1) Payroll - $32,450, 2) Software subscriptions - $8,970, 3) Office lease - $6,500. Software costs have increased significantly compared to last quarter.",
        "revenue forecast": "Based on your 6-month trend, I project your Q3 revenue at $465,000 (±8%). This represents a 12% YoY growth but is 5% below your stated goals. Would you like to see potential growth scenarios?",
        "default": "I don't have enough information to answer that question. Could you provide more details or ask something related to your financial data?"
    };

    // Private methods
    function createChatInterface() {
        // Create the chat toggle button
        const button = document.createElement('div');
        button.className = 'synthed-chat-button';
        button.innerHTML = `
            <div class="button-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
            </div>
        `;
        
        // Create chat container
        chatContainer = document.createElement('div');
        chatContainer.className = 'synthed-chat-container';
        chatContainer.innerHTML = `
            <div class="synthed-chat-header">
                <div class="synthed-chat-title">Synthed AI Assistant</div>
                <div class="synthed-chat-close">×</div>
            </div>
            <div class="synthed-chat-messages"></div>
            <div class="synthed-chat-input">
                <input type="text" placeholder="Ask Synthed AI about your finances...">
                <button class="synthed-chat-send">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(button);
        document.body.appendChild(chatContainer);
        
        // Add event listeners
        button.addEventListener('click', toggleChat);
        chatContainer.querySelector('.synthed-chat-close').addEventListener('click', toggleChat);
        chatContainer.querySelector('.synthed-chat-send').addEventListener('click', sendMessage);
        chatContainer.querySelector('input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Add styles
        addStyles();
    }
    
    function addStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .synthed-chat-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0081F1, #0069c8);
                box-shadow: 0 4px 20px rgba(0, 129, 241, 0.4);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                transition: transform 0.3s ease;
            }
            
            .synthed-chat-button:hover {
                transform: scale(1.1);
            }
            
            .button-inner {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .synthed-chat-container {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 500px;
                background-color: #1a1b26;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                z-index: 9998;
                display: none;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .synthed-chat-header {
                padding: 16px;
                background-color: rgba(24, 24, 36, 0.8);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .synthed-chat-title {
                font-weight: 600;
                background: linear-gradient(to right, #ffffff, #a1a1a6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .synthed-chat-close {
                font-size: 24px;
                cursor: pointer;
                color: #a1a1a6;
            }
            
            .synthed-chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .synthed-chat-input {
                padding: 16px;
                display: flex;
                gap: 8px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .synthed-chat-input input {
                flex: 1;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background-color: rgba(24, 24, 36, 0.5);
                color: white;
                font-size: 14px;
            }
            
            .synthed-chat-input input:focus {
                outline: none;
                border-color: #0081F1;
            }
            
            .synthed-chat-send {
                background-color: #0081F1;
                border: none;
                color: white;
                border-radius: 6px;
                width: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .synthed-chat-send:hover {
                background-color: #0069c8;
            }
            
            .message {
                max-width: 80%;
                padding: 12px;
                border-radius: 10px;
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 4px;
            }
            
            .message.user {
                align-self: flex-end;
                background-color: #0081F1;
                color: white;
                border-top-right-radius: 2px;
            }
            
            .message.bot {
                align-self: flex-start;
                background-color: rgba(31, 41, 55, 0.8);
                color: #f8fafc;
                border-top-left-radius: 2px;
            }
            
            .message.thinking {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #a1a1a6;
                animation: typing 1.5s infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.3s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.6s;
            }
            
            @keyframes typing {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    function toggleChat() {
        const isVisible = chatContainer.style.display === 'flex';
        chatContainer.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible && chatHistory.length === 0) {
            // Add welcome message
            addMessage("Welcome to Synthed AI! I'm here to help with your financial questions. What would you like to know?", 'bot');
        }
    }
    
    function addMessage(text, sender) {
        const messagesContainer = chatContainer.querySelector('.synthed-chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in chat history
        if (sender !== 'thinking') {
            chatHistory.push({ text, sender });
        }
        
        return messageElement;
    }
    
    function sendMessage() {
        const input = chatContainer.querySelector('input');
        const message = input.value.trim();
        
        if (message) {
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            // Show thinking indicator
            const thinkingEl = document.createElement('div');
            thinkingEl.className = 'message bot thinking';
            thinkingEl.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatContainer.querySelector('.synthed-chat-messages').appendChild(thinkingEl);
            
            // Process response after a short delay
            setTimeout(() => {
                // Remove thinking indicator
                thinkingEl.remove();
                
                // Add AI response
                const response = getResponse(message);
                addMessage(response, 'bot');
            }, 1500);
        }
    }
    
    function getResponse(message) {
        // Simple matching logic for demo purposes
        message = message.toLowerCase();
        
        if (message.includes('break-even') || message.includes('breakeven')) {
            return responses["what's our break-even point"];
        } else if (message.includes('cash flow') || message.includes('cashflow')) {
            return responses["how's our cash flow"];
        } else if (message.includes('expense') || message.includes('spending') || message.includes('cost')) {
            return responses["what are my largest expenses"];
        } else if (message.includes('revenue') || message.includes('forecast') || message.includes('predict')) {
            return responses["revenue forecast"];
        } else {
            return responses["default"];
        }
    }

    // Public methods
    return {
        init: function() {
            if (!isInitialized) {
                createChatInterface();
                isInitialized = true;
                console.log('Synthed AI initialized');
            }
        },
        
        toggleChat: function() {
            if (isInitialized) {
                toggleChat();
            } else {
                console.warn('Synthed AI not initialized');
            }
        },
        
        addCustomResponse: function(keyword, response) {
            responses[keyword.toLowerCase()] = response;
        }
    };
})();

// Auto-initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    SynthedAI.init();
});
