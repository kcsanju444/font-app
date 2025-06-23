import React, { useEffect, useState } from "react";
import axios from "axios";

interface Font {
  id: number;
  name: string;
  file_url: string;
}

const App: React.FC = () => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [fontSize, setFontSize] = useState<number>(32);

  useEffect(() => {
    axios.get("http://localhost:3000/api/fonts")
      .then((res) => setFonts(res.data))
      .catch((err) => console.error("Error fetching fonts:", err));
  }, []);

  const loadFontFace = (fontName: string, fileUrl: string) => {
    const fontId = `font-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(fontId)) return;

    const style = document.createElement("style");
    style.id = fontId;
    style.innerHTML = `
      @font-face {
        font-family: '${fontName}';
        src: url('/fonts/${fileUrl}');
      }
    `;
    document.head.appendChild(style);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1> Fontica — Font Preview</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your preview text here..."
        style={{
          width: "100%",
          height: "70px",
          fontSize: "16px",
          marginBottom: "1rem",
          padding: "0.5rem"
        }}
      />

      <label>Font Size: {fontSize}px</label>
      <input
        type="range"
        min={12}
        max={80}
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value))}
        style={{ width: "100%", marginBottom: "2rem" }}
      />

      {fonts.map((font) => {
        loadFontFace(font.name, font.file_url);
        return (
          <div key={font.id} style={{ marginBottom: "2rem" }}>
            <h3>{font.name}</h3>
            <div
              style={{
                fontFamily: font.name,
                fontSize: `${fontSize}px`,
                border: "1px solid #ccc",
                padding: "1rem",
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
