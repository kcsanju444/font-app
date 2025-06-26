import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(process.cwd(), 'public')));

// API to list available fonts
app.get('/api/fonts', (req, res) => {
  const fontDir = path.join(process.cwd(), 'public/fonts'); // Changed to 'public/fonts'
  console.log('Checking font directory:', fontDir); // Debug path
  const fs = require('fs').promises;

  // Pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;

  fs.readdir(fontDir)
    .then((files: string[]) => {
      console.log('Files found:', files); // Debug files
      if (files.length === 0) {
        return res.status(404).json({ error: 'No fonts found in directory' });
      }
      const fonts = files
        .filter((file: string) => file.endsWith('.ttf'))
        .map((file: string) => ({
          id: file.replace('.ttf', ''),
          name: file.replace('.ttf', ''),
          url: `http://localhost:3000/fonts/${file}`, // Updated URL to match 'public/fonts'
        }));
      // Apply pagination
      const paginatedFonts = fonts.slice(startIndex, startIndex + limit);
      const total = fonts.length;
      res.json({
        fonts: paginatedFonts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFonts: total,
      });
    })
    .catch((err: unknown) => {
      console.error('Readdir error:', err);
      res.status(500).json({ error: 'Failed to load fonts' });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});