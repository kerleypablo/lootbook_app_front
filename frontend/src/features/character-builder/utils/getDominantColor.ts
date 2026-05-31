"use client";

export function getDominantColor(imageElement: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return "#ffffff";
  }

  const width = (canvas.width = imageElement.naturalWidth);
  const height = (canvas.height = imageElement.naturalHeight);
  context.drawImage(imageElement, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let index = 0; index < imageData.length; index += 4 * 50) {
    r += imageData[index];
    g += imageData[index + 1];
    b += imageData[index + 2];
    count += 1;
  }

  if (count === 0) {
    return "#ffffff";
  }

  const averageR = Math.floor(r / count);
  const averageG = Math.floor(g / count);
  const averageB = Math.floor(b / count);

  return `rgb(${averageR}, ${averageG}, ${averageB})`;
}
