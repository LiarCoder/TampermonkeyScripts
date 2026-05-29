export const compact = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(Boolean);
};
