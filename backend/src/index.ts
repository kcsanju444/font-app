import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(process.cwd(), 'public')));

// API to list available fonts with categories
app.get('/api/fonts', (req: Request<{}, {}, {}, { page?: string; limit?: string }>, res: Response) => {
  const fontDir = path.join(process.cwd(), 'public/fonts');
  console.log('Checking font directory:', fontDir); // Debug path

  // Pagination 
  const page = parseInt(req.query.page as string || '1');
  const limit = parseInt(req.query.limit as string || '6'); 
  const startIndex = (page - 1) * limit;

  try {
    const files = fs.readdirSync(fontDir); // Synchronous for simplicity
    console.log('Files found:', files); // Debug files

    if (files.length === 0) {
      res.status(404).json({ error: 'No fonts found in directory' });
      return; // Explicit return to ensure void
    }

    const fonts = files
      .filter((file) => file.endsWith('.ttf'))
      .map((file) => {
        const name = file.replace(/-Regular|-VariableFont.*|\.ttf$/i, ''); // Clean name
        let category = 'sans-serif'; // Default category
        if (name.toLowerCase().includes('merriweather')) category = 'serif';
        if (name.toLowerCase().includes('dancingscript') || name.toLowerCase().includes('pacifico') || name.toLowerCase().includes('satisfy')) category = 'handwriting';
        if (name.toLowerCase().includes('playfair')) category = 'display';
        if (name.toLowerCase().includes('courier')) category = 'monospace';
        return {
          id: file.replace('.ttf', ''),
          name: name,
          url: `http://localhost:3000/fonts/${file}`, // Match 'public/fonts'
          category: category,
        };
      });

    // Apply pagination
    const paginatedFonts = fonts.slice(startIndex, startIndex + limit);
    const total = fonts.length;
    res.json({
      fonts: paginatedFonts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFonts: total,
    });
    return; // Explicit return to ensure void
  } catch (err) {
    console.error('Readdir error:', err);
    res.status(500).json({ error: 'Failed to load fonts' });
    return; // Explicit return to ensure void
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});