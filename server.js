const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const receiptio = require('receiptio');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'news.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create news_items table
            db.run(`
                CREATE TABLE IF NOT EXISTS news_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    image_url TEXT,
                    source TEXT,
                    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    category TEXT
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Check if table is empty and add sample data
                db.get("SELECT COUNT(*) as count FROM news_items", (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (row.count === 0) {
                        const sampleNews = [
                            {
                                title: 'AI Breakthrough in Medical Imaging',
                                content: 'Researchers have developed a new AI algorithm that can detect early signs of cancer with 95% accuracy, potentially revolutionizing early diagnosis and treatment.',
                                image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
                                source: 'Tech Daily',
                                category: 'Technology'
                            },
                            {
                                title: 'Global Climate Summit Reaches Historic Agreement',
                                content: 'World leaders have agreed to ambitious new targets for reducing carbon emissions by 2030, marking a significant step forward in the fight against climate change.',
                                image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
                                source: 'Global News',
                                category: 'Environment'
                            },
                            {
                                title: 'SpaceX Successfully Lands on Mars',
                                content: 'In a historic moment for space exploration, SpaceX has successfully landed its Starship vehicle on the surface of Mars, opening new possibilities for human colonization.',
                                image_url: 'https://images.unsplash.com/photo-1446776811953-b23d0bd75ac2?w=400&h=300&fit=crop',
                                source: 'Space Weekly',
                                category: 'Science'
                            },
                            {
                                title: 'Revolutionary Quantum Computer Breakthrough',
                                content: 'Scientists have achieved quantum supremacy with a new 1000-qubit processor, solving problems that would take classical computers thousands of years in mere minutes.',
                                image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
                                source: 'Quantum Today',
                                category: 'Technology'
                            },
                            {
                                title: 'New Renewable Energy Milestone Reached',
                                content: 'Solar and wind power now generate more electricity than fossil fuels in the European Union, marking a major milestone in the transition to clean energy.',
                                image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
                                source: 'Energy Report',
                                category: 'Environment'
                            }
                        ];
                        
                        const stmt = db.prepare(`
                            INSERT INTO news_items (title, content, image_url, source, category)
                            VALUES (?, ?, ?, ?, ?)
                        `);
                        
                        sampleNews.forEach(item => {
                            stmt.run(item.title, item.content, item.image_url, item.source, item.category);
                        });
                        
                        stmt.finalize((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log('Sample news items added to database!');
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/news', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;
    
    // Get total count
    db.get("SELECT COUNT(*) as total FROM news_items", (err, countRow) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        const total = countRow.total;
        const totalPages = Math.ceil(total / perPage);
        
        // Get paginated results
        db.all(`
            SELECT * FROM news_items 
            ORDER BY published_at DESC 
            LIMIT ? OFFSET ?
        `, [perPage, offset], (err, rows) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            res.json({
                items: rows,
                total: total,
                pages: totalPages,
                current_page: page
            });
        });
    });
});

app.get('/api/news/:id', (req, res) => {
    const id = req.params.id;
    
    db.get("SELECT * FROM news_items WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'News item not found' });
            return;
        }
        
        res.json(row);
    });
});

// Receipt printing endpoint
app.post('/api/print-receipt', async (req, res) => {
    try {
        const { newsItem, action } = req.body;
        
        if (!newsItem) {
            return res.status(400).json({ error: 'News item is required' });
        }
        
        // Create creepy attention receipt markdown
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        
        // Generate creepy tracking ID
        const trackingId = `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        // Generate creepy behavioral data
        const dwellTime = Math.floor(Math.random() * 45) + 8;
        const scrollDepth = Math.floor(Math.random() * 100) + 15;
        const mouseMovements = Math.floor(Math.random() * 200) + 50;
        const emotionalScore = (Math.random() * 0.8 + 0.2).toFixed(2);
        const attentionScore = Math.floor(Math.random() * 100) + 25;
        
        // Generate targeted advertising suggestions
        const adCategories = ['Luxury Cars', 'Investment Apps', 'Weight Loss', 'Dating Sites', 'Gaming', 'Travel', 'Fashion', 'Tech Gadgets'];
        const selectedAds = adCategories.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        // Generate creepy demographic inferences
        const ageRange = ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)];
        const incomeLevel = ['Low', 'Medium', 'High', 'Premium'][Math.floor(Math.random() * 3)];
        const politicalLeaning = ['Conservative', 'Moderate', 'Liberal', 'Apolitical'][Math.floor(Math.random() * 4)];
        
        const markdown = `^^^ATTENTION RECEIPT

${dateStr} | ${timeStr}

Your behavior has been recorded and monetized
This receipt serves as proof of your digital surveillance
Your data has been sold to the highest bidder

^^^TRACKING DETAILS
Tracking ID     | ${trackingId}
Session Time    | ${Math.floor(Math.random() * 120) + 30}min
---

^^^SURVEILLANCE DATA
"${newsItem.title}"
Source         | ${newsItem.source}
Category       | ${newsItem.category}
---

^^^BEHAVIORAL ANALYSIS
Status         | ${action === 'save' ? 'ENGAGEMENT' : 'REJECTION'}
Type           | ${action === 'save' ? 'Positive' : 'Negative'}
Score          | ${attentionScore}/100
---

^^^ATTENTION METRICS
Dwell Time     | ${dwellTime}s
Scroll Depth   | ${scrollDepth}%
Mouse Moves    | ${mouseMovements}
Eye Tracking   | Active
Emotion Score  | ${emotionalScore}
Attention      | ${attentionScore}/100
---

^^^DEMOGRAPHIC DATA
Age Range      | ${ageRange}
Income Level   | ${incomeLevel}
Politics       | ${politicalLeaning}
Location       | ${['Urban', 'Suburban', 'Rural'][Math.floor(Math.random() * 3)]}
---

^^^AD TARGETING
${selectedAds[0]}     | ^High Priority
${selectedAds[1]}     | ^Medium Priority
${selectedAds[2]}     | ^Medium Priority
${selectedAds[3]}     | ^Low Priority
---

^^^DATA VALUE
Data Point     | ^$0.001
Profile Update | ^$0.005
Behavior Data  | ^$0.003
Demographics   | ^$0.002
Target Score   | ^+${Math.floor(Math.random() * 15) + 3}
---
^TOTAL VALUE   | ^$0.011

^^^NETWORK STATUS
Facebook       | Data Shared
Google         | Analytics Active
Amazon         | Purchase History
Twitter        | Sentiment Analysis
---

^^^PREDICTIVE MODEL
Next Purchase  | ${['Electronics', 'Clothing', 'Food', 'Services'][Math.floor(Math.random() * 4)]}
Likely Spend   | ^$${(Math.random() * 500 + 50).toFixed(0)}
Conversion     | ^${(Math.random() * 0.4 + 0.1).toFixed(1)}%
Success Rate   | ^${(Math.random() * 0.8 + 0.2).toFixed(1)}%
---

^^^PRIVACY METRICS
Cookies        | ${Math.floor(Math.random() * 15) + 8} Active
Trackers       | ${Math.floor(Math.random() * 12) + 5} Running
Data Brokers   | ${Math.floor(Math.random() * 8) + 3} Connected
Privacy Score  | ${Math.floor(Math.random() * 30) + 10}/100
---

^^^TOTAL SURVEILLANCE VALUE | ^$${(Math.random() * 0.02 + 0.005).toFixed(3)}

Your digital footprint has been permanently recorded
This data will be used to manipulate your future decisions
Resistance is futile - you are the product`;

        // Print receipt
        try {
            const result = await receiptio.print(markdown, '-d /dev/usb/lp0 -u');
            
            res.json({ 
                success: true, 
                message: 'Receipt printed successfully',
                result: result 
            });
        } catch (printError) {
            // If printer is not available, still return success but with a warning
            console.warn('Printer not available, but receipt format generated:', printError.message);
            
            res.json({ 
                success: true, 
                message: 'Receipt format generated (printer not available)',
                result: { markdown: markdown },
                warning: 'Printer not available'
            });
        }
        
    } catch (error) {
        console.error('Receipt printing error:', error);
        res.status(500).json({ 
            error: 'Failed to print receipt',
            details: error.message 
        });
    }
});

// Start server
async function startServer() {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log(`News Swiper server running on port ${PORT}`);
            console.log(`Open your browser to: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

startServer();
