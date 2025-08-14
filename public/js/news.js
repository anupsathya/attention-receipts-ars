class NewsSwiper {
    constructor() {
        this.newsItems = [];
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.threshold = 100;
        this.receiptPrintingEnabled = true; // Toggle for receipt printing
        
        this.cardContainer = document.getElementById('cardContainer');
        this.skipBtn = document.getElementById('skipBtn');
        this.saveBtn = document.getElementById('saveBtn');
        
        this.init();
    }

    async init() {
        await this.loadNews();
        this.setupEventListeners();
        this.renderCards();
    }

    async loadNews() {
        try {
            const response = await fetch('/api/news?per_page=20');
            const data = await response.json();
            this.newsItems = data.items;
        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('Failed to load news');
        }
    }

    setupEventListeners() {
        this.skipBtn.addEventListener('click', () => this.swipeCard('left'));
        this.saveBtn.addEventListener('click', () => this.swipeCard('right'));
        
        this.cardContainer.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.cardContainer.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.cardContainer.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.cardContainer.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Touch events for mobile
        this.cardContainer.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.cardContainer.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.cardContainer.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Receipt toggle
        const receiptToggle = document.getElementById('receiptToggle');
        if (receiptToggle) {
            receiptToggle.addEventListener('change', (e) => {
                this.receiptPrintingEnabled = e.target.checked;
                this.showReceiptNotification(
                    this.receiptPrintingEnabled ? 'Receipt printing enabled' : 'Receipt printing disabled',
                    'info'
                );
            });
        }
    }

    handleMouseDown(e) {
        this.startDragging(e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            this.updateDragging(e.clientX, e.clientY);
        }
    }

    handleMouseUp(e) {
        this.stopDragging();
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.startDragging(touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateDragging(touch.clientX, touch.clientY);
        }
    }

    handleTouchEnd(e) {
        this.stopDragging();
    }

    startDragging(x, y) {
        if (this.currentIndex >= this.newsItems.length) return;
        
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
        
        const currentCard = this.getCurrentCard();
        if (currentCard) {
            currentCard.classList.add('swiping');
        }
    }

    updateDragging(x, y) {
        if (!this.isDragging) return;
        
        this.currentX = x;
        this.currentY = y;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        const currentCard = this.getCurrentCard();
        if (currentCard) {
            const rotation = (deltaX / this.threshold) * 20;
            const translateX = deltaX;
            const translateY = deltaY * 0.1;
            
            currentCard.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;
        }
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const currentCard = this.getCurrentCard();
        
        if (currentCard) {
            currentCard.classList.remove('swiping');
            
            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;
            
            if (Math.abs(deltaX) > this.threshold) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.swipeCard(direction);
            } else {
                // Reset card position
                currentCard.style.transform = '';
            }
        }
    }

    async swipeCard(direction) {
        if (this.currentIndex >= this.newsItems.length) return;
        
        const currentCard = this.getCurrentCard();
        if (!currentCard) return;
        
        currentCard.classList.add(`swiped-${direction}`);
        
        // Print receipt for the swiped news item if enabled
        if (this.receiptPrintingEnabled) {
            const currentItem = this.newsItems[this.currentIndex];
            const action = direction === 'right' ? 'save' : 'skip';
            
            try {
                await this.printReceipt(currentItem, action);
            } catch (error) {
                console.error('Failed to print receipt:', error);
            }
        }
        
        setTimeout(() => {
            this.currentIndex++;
            this.renderCards();
        }, 300);
    }

    getCurrentCard() {
        return this.cardContainer.querySelector('.news-card');
    }

    async printReceipt(newsItem, action) {
        try {
            // Show notification
            this.showReceiptNotification('Printing receipt...', 'info');
            
            const response = await fetch('/api/print-receipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newsItem: newsItem,
                    action: action
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Receipt printed successfully:', result.message);
                
                if (result.warning) {
                    this.showReceiptNotification(`${result.message} - ${result.warning}`, 'info');
                } else {
                    this.showReceiptNotification('Receipt printed successfully!', 'success');
                }
            } else {
                console.error('Receipt printing failed:', result.error);
                this.showReceiptNotification('Receipt printing failed', 'error');
            }
            
            return result;
        } catch (error) {
            console.error('Error calling receipt printing API:', error);
            this.showReceiptNotification('Receipt printing error', 'error');
            throw error;
        }
    }

    showReceiptNotification(message, type = 'info') {
        const notification = document.getElementById('receiptNotification');
        const messageSpan = document.getElementById('receiptMessage');
        
        // Update message and type
        messageSpan.textContent = message;
        notification.className = `receipt-notification ${type}`;
        
        // Show notification
        notification.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    renderCards() {
        if (this.currentIndex >= this.newsItems.length) {
            this.showNoMoreCards();
            return;
        }

        const currentItem = this.newsItems[this.currentIndex];
        this.cardContainer.innerHTML = this.createCardHTML(currentItem);
    }

    createCardHTML(item) {
        const date = new Date(item.published_at).toLocaleDateString();
        return `
            <div class="news-card">
                <div class="card-image" style="background-image: url('${item.image_url}')">
                    <div class="card-category">${item.category}</div>
                </div>
                <div class="card-content">
                    <h2 class="card-title">${item.title}</h2>
                    <p class="card-text">${item.content}</p>
                    <div class="card-footer">
                        <span class="card-source">${item.source}</span>
                        <span>${date}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showNoMoreCards() {
        this.cardContainer.innerHTML = `
            <div class="no-more-cards">
                <h3>No more news!</h3>
                <p>You've seen all the available news items.</p>
                <button class="swipe-btn" onclick="location.reload()">Start Over</button>
            </div>
        `;
    }

    showError(message) {
        this.cardContainer.innerHTML = `
            <div class="no-more-cards">
                <h3>Error</h3>
                <p>${message}</p>
                <button class="swipe-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize the news swiper when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsSwiper();
});