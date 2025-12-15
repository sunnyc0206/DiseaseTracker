// Utility function to format large numbers
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return num.toString();
};

// Format number with full commas (for tooltips or detailed views)
export const formatNumberFull = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString();
}; 