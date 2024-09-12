function cleanCategory(category) {
 return category
  .toLowerCase() // Convert to lowercase
  .replace(/[-_]/g, " ") // Replace dashes and underscores with spaces
  .replace(/[^\w\s]/g, "") // Remove punctuation
  .trim() // Remove leading and trailing spaces
  .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

module.exports = cleanCategory;
