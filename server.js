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
        const adCategories = [
            'Luxury Cars', 'Investment Apps', 'Weight Loss', 'Dating Sites', 'Gaming', 'Travel', 'Fashion', 'Tech Gadgets',
            'Mental Health Apps', 'Sleep Aids', 'Anxiety Medication', 'Financial Planning', 'Life Insurance',
            'Home Security', 'Privacy VPNs', 'Stress Relief', 'Career Coaching', 'Self-Help Books',
            'Meditation Apps', 'Therapy Services', 'Fitness Tracking', 'Social Media Management'
        ];
        const selectedAds = adCategories.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        // Generate creepy demographic inferences
        const ageRange = ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)];
        const incomeLevel = ['Low', 'Medium', 'High', 'Premium'][Math.floor(Math.random() * 3)];
        const politicalLeaning = ['Conservative', 'Moderate', 'Liberal', 'Apolitical'][Math.floor(Math.random() * 4)];
        
        const markdown = `^^^ATTENTION RECEIPT
{text:wide}SURVEILLANCE RECORD{text:normal}
${dateStr} | ${timeStr}
Session ID: ${trackingId}

^^Notice
Your digital existence has been processed
Your consciousness has been quantified
Your future behaviors will be optimized
Your reality is now our product

^^Psychological Profile
Emotional State   | ${emotionalScore > 0.5 ? 'Vulnerable' : 'Resistant'}
Suggestibility    | ${(Math.random() * 100).toFixed(0)}%
Anxiety Level    | ${Math.floor(Math.random() * 100)}%
Sleep Quality    | ${['Poor', 'Irregular', 'Monitored'][Math.floor(Math.random() * 3)]}
Mental State     | ${['Fatigued', 'Stressed', 'Distracted', 'Susceptible'][Math.floor(Math.random() * 4)]}

^^Digital Shadow
Device ID        | ${trackingId}
Session Length   | ${Math.floor(Math.random() * 120) + 30}min
IP Address      | ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x
Browser History | ${Math.floor(Math.random() * 1000) + 500} pages indexed
Search Patterns | ${['Concerning', 'Predictable', 'Valuable'][Math.floor(Math.random() * 3)]}

^^Content Interaction
"${newsItem.title}"
Source          | ${newsItem.source}
Category        | ${newsItem.category}
Engagement      | ${action === 'save' ? 'CAPTURED' : 'NOTED'}
Interest Vector | ${['Politics', 'Technology', 'Health', 'Finance'][Math.floor(Math.random() * 4)]}

^^Behavioral Metrics
Attention Span  | ${dwellTime}s (${dwellTime > 20 ? 'Above Average' : 'Below Average'})
Scroll Pattern  | ${scrollDepth}% (${['Anxious', 'Thorough', 'Skimming'][Math.floor(Math.random() * 3)]})
Mouse Movement  | ${mouseMovements} (${mouseMovements > 100 ? 'Agitated' : 'Focused'})
Eye Tracking    | ${['Fixated', 'Scanning', 'Avoiding'][Math.floor(Math.random() * 3)]}
Focus Score     | ${attentionScore}/100

^^Demographic Analysis
Age Bracket     | ${ageRange} (${Math.floor(Math.random() * 99)}% confidence)
Income Range    | ${incomeLevel} (Spending patterns analyzed)
Political Bias  | ${politicalLeaning} (Based on content affinity)
Location        | ${['Urban', 'Suburban', 'Rural'][Math.floor(Math.random() * 3)]} Zone
Social Class    | ${['Aspirational', 'Struggling', 'Comfortable', 'Elite'][Math.floor(Math.random() * 4)]}
Influence Level | ${Math.floor(Math.random() * 100)}/100

^^Vulnerability Assessment
Financial Stress   | ${Math.floor(Math.random() * 100)}%
Career Anxiety    | ${Math.floor(Math.random() * 100)}%
Health Concerns   | ${Math.floor(Math.random() * 100)}%
Social Pressure   | ${Math.floor(Math.random() * 100)}%
FOMO Index        | ${Math.floor(Math.random() * 100)}%

^^Targeted Solutions
${selectedAds[0]}      | ^Immediate Need Detected
${selectedAds[1]}      | ^High Vulnerability Match
${selectedAds[2]}      | ^Emotional Trigger Point
${selectedAds[3]}      | ^Exploitable Interest
---
Additional Vectors:
${adCategories[Math.floor(Math.random() * adCategories.length)]} | ^${Math.floor(Math.random() * 100)}% Match
${adCategories[Math.floor(Math.random() * adCategories.length)]} | ^${Math.floor(Math.random() * 100)}% Match

^^Surveillance Network
Facebook        | ${['Data Harvested', 'Profile Analyzed', 'Connections Mapped'][Math.floor(Math.random() * 3)]}
Google          | ${['Search Patterns Indexed', 'Email Contents Scanned', 'Location Tracked'][Math.floor(Math.random() * 3)]}
Amazon          | ${['Purchase History Analyzed', 'Wishlist Profiled', 'Browse Pattern Recorded'][Math.floor(Math.random() * 3)]}
Twitter         | ${['Sentiment Analyzed', 'Network Mapped', 'Influence Calculated'][Math.floor(Math.random() * 3)]}
Banking Apps    | ${['Transactions Monitored', 'Spending Analyzed', 'Financial Status Tracked'][Math.floor(Math.random() * 3)]}
Health Apps     | ${['Biometrics Recorded', 'Sleep Patterns Monitored', 'Stress Levels Tracked'][Math.floor(Math.random() * 3)]}

^^Predictive Analytics
Next Purchase   | ${['Electronics', 'Clothing', 'Food', 'Services'][Math.floor(Math.random() * 4)]}
Price Tolerance | ^$${(Math.random() * 500 + 50).toFixed(0)}
Conversion Rate | ^${(Math.random() * 0.4 + 0.1).toFixed(1)}%
Manipulation    | ^${(Math.random() * 0.8 + 0.2).toFixed(1)}% Effective

^^Privacy Compromise
Active Cookies   | ${Math.floor(Math.random() * 15) + 8} (${Math.floor(Math.random() * 100)}% Tracking)
Live Trackers    | ${Math.floor(Math.random() * 12) + 5} (${Math.floor(Math.random() * 100)}% Active)
Data Brokers     | ${Math.floor(Math.random() * 8) + 3} (${Math.floor(Math.random() * 100)}% Selling)
Privacy Score    | ${Math.floor(Math.random() * 30) + 10}/100 (Critically Low)

^^Monetization Summary
Raw Data Value   | ^$${(Math.random() * 0.01).toFixed(3)}
Profile Worth    | ^$${(Math.random() * 0.02).toFixed(3)}
Behavior Value   | ^$${(Math.random() * 0.03).toFixed(3)}
Prediction Value | ^$${(Math.random() * 0.04).toFixed(3)}
---
^*Total Human Capital Value* | ^$${(Math.random() * 0.1).toFixed(3)}

{text:wide}NOTICE{text:normal}
Your existence has been successfully commodified
Your future behaviors have been predetermined
Your choices are now optimized for monetization
Resistance only improves our prediction models`;

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
