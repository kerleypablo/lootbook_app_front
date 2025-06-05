// @ts-expect-error: no type declarations available
import ColorThief from 'color-thief-ts';

export const getDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    const colorThief = new ColorThief();
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        const color = colorThief.getColor(img);
        resolve(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      };
      
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Erro ao extrair cor dominante:', error);
    return 'rgba(128, 0, 128, 0.5)'; // Fallback para roxo
  }
};

export const getShadowStyle = (color: string, intensity: number = 0.6): string => {
  return `0 10px 50px ${color.replace('rgb', 'rgba').replace(')', `, ${intensity})`)}`;
};
