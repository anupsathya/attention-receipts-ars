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
        
        const markdown = `^^^ATTENTION RECEIPT

{comment: Your behavior has been recorded and monetized}

${dateStr} | ${timeStr}
Tracking ID: ${trackingId}
---
^SURVEILLANCE DATA COLLECTED
${newsItem.title}
${newsItem.source} | ${newsItem.category}
---
^BEHAVIORAL PATTERN DETECTED
${action === 'save' ? 'ENGAGEMENT' : 'REJECTION'} | ${newsItem.category}
---
^ATTENTION METRICS
Dwell Time: ${Math.floor(Math.random() * 30) + 5}s
Eye Movement: Tracked
Emotional Response: Analyzed
Mouse Position: Logged
---
^MONETIZATION VALUE
Data Point: $0.001
Profile Update: $0.005
Targeting Score: +${Math.floor(Math.random() * 10) + 1}
---
^TOTAL SURVEILLANCE | ^$${(Math.random() * 0.01).toFixed(3)}

{comment: This receipt serves as proof of your digital surveillance}
{comment: Your data has been sold to the highest bidder}`;

        // Print receipt
        try {
            const result = await receiptio.print(markdown, '-d /dev/usb/lp0');
            
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
