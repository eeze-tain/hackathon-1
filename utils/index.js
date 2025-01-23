function calculateLuminance(imageData) {
  const data = imageData.data;
  let totalLuminance = 0;
  const pixelsCount = 1;

  for (let i = 0; i < data.length; i += 4 * pixelsCount) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const pixelLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalLuminance += pixelLuminance;
  }

  // Return average luminance (0-255)
  return totalLuminance / (data.length / 4 / pixelsCount);
}

function analyzeFrameLuminance(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  return calculateLuminance(imageData);
}
