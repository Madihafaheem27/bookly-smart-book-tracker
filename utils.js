function filterBooksByStatus(books, status) {
  if (!Array.isArray(books)) return [];
  return books.filter(book => book.status === status);
}

function filterBooksByGenre(books, genre) {
  if (!Array.isArray(books)) return [];
  if (!genre || genre.toLowerCase() === "all") return books;
  return books.filter(book => String(book.genre || "").toLowerCase() === genre.toLowerCase());
}

module.exports = { filterBooksByStatus, filterBooksByGenre };
