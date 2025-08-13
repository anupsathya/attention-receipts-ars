# News Swiper

A modern, interactive news browsing website with a card-based swipe interface. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- **Card-based Interface**: Beautiful news cards with images, titles, and content
- **Swipe Gestures**: Swipe left/right on cards or use buttons to navigate
- **Touch & Mouse Support**: Works on both desktop and mobile devices
- **SQLite Database**: Persistent storage for news items
- **Responsive Design**: Optimized for all screen sizes
- **Sample Data**: Pre-loaded with interesting news items

## Setup

### Prerequisites

- Node.js 16.0 or higher
- npm (Node package manager)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```
   
   Or use the convenience script:
   ```bash
   ./run.sh
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5001
   ```

## Usage

### Swiping News Cards

- **Swipe Right**: Save/approve the news item
- **Swipe Left**: Skip/reject the news item
- **Use Buttons**: Click "Save" or "Skip" buttons below the cards

### Touch Controls

- **Mobile**: Swipe left/right on the cards
- **Desktop**: Click and drag cards left/right

## Project Structure

```
attention-receipts-ars/
├── server.js           # Node.js Express server
├── package.json        # Node.js dependencies and scripts
├── public/             # Static files
│   └── index.html     # Main page with swipe interface
├── news.db            # SQLite database (created automatically)
├── run.sh             # Convenience startup script
└── README.md          # This file
```

## Database Schema

The SQLite database contains a `news_items` table with the following fields:

- `id`: Unique identifier
- `title`: News headline
- `content`: News article content
- `image_url`: URL to the news image
- `source`: News source/publication
- `published_at`: Publication timestamp
- `category`: News category (Technology, Environment, Science, etc.)

## Customization

### Adding More News Items

Edit the `initDatabase()` function in `server.js` to add more sample news items or modify the existing ones.

### Styling

The interface uses CSS with a modern gradient background and card design. Modify the styles in `public/index.html` to customize the appearance.

### API Endpoints

- `GET /`: Main page
- `GET /api/news`: Get paginated news items
- `GET /api/news/:id`: Get specific news item

## Technologies Used

- **Backend**: Node.js with Express framework
- **Database**: SQLite with sqlite3 package
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern CSS with gradients and animations

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

This requires nodemon to be installed globally:
```bash
npm install -g nodemon
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `server.js` (line 8)
2. **Database errors**: Delete `news.db` and restart the application
3. **Images not loading**: Check internet connection for Unsplash images
4. **Node.js not found**: Install Node.js from https://nodejs.org/

### Dependencies

If you encounter module not found errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

This project is open source and available under the MIT License.
