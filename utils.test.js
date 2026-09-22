const { describe, it, expect } = require("vitest");
const { filterBooksByStatus, filterBooksByGenre } = require("./utils");

const sampleBooks = [
  { id: 1, title: "Pride and Prejudice", genre: "fiction", status: "Want to Read" },
  { id: 2, title: "The Secret Garden", genre: "fiction", status: "Read" }
];

describe("Book Tracker Logic", () => {
  it("filters books by reading status correctly", () => {
    const result = filterBooksByStatus(sampleBooks, "Want to Read");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Pride and Prejudice");
  });

  it("filters books by genre case-insensitively", () => {
    expect(filterBooksByGenre(sampleBooks, "FICTION")).toHaveLength(2);
  });

  it("returns all books when genre is all", () => {
    expect(filterBooksByGenre(sampleBooks, "all")).toHaveLength(2);
  });

  it("handles invalid book lists safely", () => {
    expect(filterBooksByStatus(null, "Reading")).toEqual([]);
    expect(filterBooksByGenre(undefined, "fiction")).toEqual([]);
  });
});
