import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

const fontsToDownload = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
  'Noto Sans', 'Merriweather', 'Ubuntu', 'PT Sans', 'Source Sans Pro',
  'Nunito', 'Poppins', 'Work Sans', 'Fira Sans', 'Inconsolata',
  'Playfair Display', 'Roboto Condensed', 'Lora', 'Libre Baskerville',
  'Anton', 'Dancing Script', 'Pacifico', 'Indie Flower', 'Bebas Neue'
];

const outputDir = path.resolve(__dirname, './public/fonts');
console.log('Current directory:', __dirname);
console.log('Output directory:', outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Directory created:', outputDir);
}

function downloadFile(url: string | https.RequestOptions | URL, filePath: fs.PathLike) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`Downloaded to ${filePath}`);
      });
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadFonts() {
  for (const font of fontsToDownload) {
    try {
      console.log(`Attempting to download ${font}...`);
      const fontName = font.toLowerCase().replace(' ', '+');
      const url = `https://fonts.google.com/download?family=${fontName}`;
      const filePath = path.join(outputDir, `${font}-regular.ttf`);

      // Note: Direct TTF download links require API or manual extraction.
      // This example uses a placeholder; you may need to adjust the URL.
      await downloadFile(url, filePath);
      console.log(`${font} downloaded successfully to ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to download ${font}:`, error);
    }
  }
}

downloadFonts();