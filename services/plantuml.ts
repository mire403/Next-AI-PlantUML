/**
 * Encodes a string to the PlantUML HEX format (~h...).
 * This is a robust fallback that avoids complex Deflate implementations in the browser
 * without external libraries, fully supported by the official PlantUML server.
 */
export const encodePlantUML = (code: string): string => {
  // Simple UTF-8 to Hex encoding
  const utf8 = new TextEncoder().encode(code);
  let hex = '';
  for (let i = 0; i < utf8.length; i++) {
    hex += utf8[i].toString(16).padStart(2, '0');
  }
  return `~h${hex}`;
};

export const getDiagramUrl = (code: string, type: 'svg' | 'png' = 'svg'): string => {
  if (!code.trim()) return '';
  const encoded = encodePlantUML(code);
  return `https://www.plantuml.com/plantuml/${type}/${encoded}`;
};

/**
 * Fetches the rendered PNG from PlantUML server and converts to Base64.
 * Used for AI Vision analysis.
 */
export const fetchDiagramImageBase64 = async (code: string): Promise<string> => {
  try {
    const url = getDiagramUrl(code, 'png');
    // PlantUML server generally supports CORS for images
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch diagram image");
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove "data:image/png;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching diagram for analysis:", error);
    throw new Error("无法获取渲染后的图表进行分析，可能是网络原因。");
  }
};