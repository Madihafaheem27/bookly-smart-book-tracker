const DEFAULT_BOOKS = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", status: "Completed", rating: 5, favorite: true, color: "green" },
  { id: 2, title: "Atomic Habits", author: "James Clear", genre: "Self Help", status: "Reading", rating: 5, favorite: true, color: "orange" },
  { id: 3, title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery", status: "Want to Read", rating: 4, favorite: false, color: "purple" },
  { id: 4, title: "Harry Potter", author: "J.K. Rowling", genre: "Fantasy", status: "Want to Read", rating: 5, favorite: false, color: "blue" }
];

const moodBooks = {
  happy: [
    ["The House in the Cerulean Sea", "TJ Klune", "A warm and feel-good story."],
    ["Anne of Green Gables", "L.M. Montgomery", "Charming, optimistic and uplifting."],
    ["The Little Prince", "Antoine de Saint-Exupéry", "A simple story with a beautiful message."]
  ],
  romantic: [
    ["Pride and Prejudice", "Jane Austen", "Classic romance with witty characters."],
    ["The Notebook", "Nicholas Sparks", "An emotional romantic story."],
    ["Emma", "Jane Austen", "A charming classic romance."]
  ],
  mysterious: [
    ["The Silent Patient", "Alex Michaelides", "Psychological mystery full of questions."],
    ["Gone Girl", "Gillian Flynn", "A twist-filled mystery."],
    ["Sherlock Holmes", "Arthur Conan Doyle", "Classic detective mysteries."]
  ],
  motivated: [
    ["Atomic Habits", "James Clear", "Practical ideas for building better habits."],
    ["The 7 Habits of Highly Effective People", "Stephen R. Covey", "Ideas for personal development."],
    ["Deep Work", "Cal Newport", "Learn how focused work can improve productivity."]
  ],
  calm: [
    ["The Little Prince", "Antoine de Saint-Exupéry", "A gentle and thoughtful story."],
    ["A Man Called Ove", "Fredrik Backman", "A thoughtful character-driven story."],
    ["The Alchemist", "Paulo Coelho", "A reflective journey about dreams."]
  ],
  adventure: [
    ["The Hobbit", "J.R.R. Tolkien", "A classic fantasy adventure."],
    ["Treasure Island", "Robert Louis Stevenson", "A classic journey filled with adventure."],
    ["Around the World in 80 Days", "Jules Verne", "A fast-paced journey around the world."]
  ]
};

let books = loadBooks();
let readingGoal = Number(localStorage.getItem("booklyGoal")) || 20;
let currentFilter = "all";
let selectedLevel = "Medium";
let toastTimer;

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem("booklyBooks"));
    return Array.isArray(saved) ? saved : structuredClone(DEFAULT_BOOKS);
  } catch {
    return structuredClone(DEFAULT_BOOKS);
  }
}

function saveBooks() {
  localStorage.setItem("booklyBooks", JSON.stringify(books));
}

function $(id) {
  return document.getElementById(id);
}

function showSection(id) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active-section", section.id === id);
  });
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.section === id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function openAddBook(book = null) {
  $("bookModal").classList.add("show");
  $("bookModal").setAttribute("aria-hidden", "false");
  $("modalTitle").textContent = book ? "Edit Book" : "Add a New Book";
  $("saveBookBtn").textContent = book ? "Save Changes" : "Add to Library";
  $("bookId").value = book ? book.id : "";
  $("bookTitle").value = book?.title || "";
  $("bookAuthor").value = book?.author || "";
  $("bookGenre").value = book?.genre || "Fiction";
  $("bookStatus").value = book?.status || "Want to Read";
  $("bookRating").value = String(book?.rating || 0);
  $("bookTitle").focus();
}

function closeAddBook() {
  $("bookModal").classList.remove("show");
  $("bookModal").setAttribute("aria-hidden", "true");
  $("bookForm").reset();
  $("bookId").value = "";
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function coverColor(color) {
  return {
    purple: "#6654d9",
    orange: "#df754f",
    green: "#51846d",
    blue: "#4386c7",
    pink: "#c75f88"
  }[color] || "#6654d9";
}

function randomColor() {
  return ["purple", "orange", "green", "blue", "pink"][Math.floor(Math.random() * 5)];
}

function createBookCard(book) {
  const stars = "⭐".repeat(Number(book.rating) || 0) || "No rating";
  return `
    <article class="book-card">
      <div class="book-cover-card" style="background:${coverColor(book.color)}">
        <div class="cover-title">${escapeHTML(book.title)}</div>
        <button class="favorite" data-action="favorite" data-id="${book.id}" aria-label="${book.favorite ? "Remove from favorites" : "Add to favorites"}">${book.favorite ? "❤️" : "🤍"}</button>
      </div>
      <div class="book-info">
        <h3>${escapeHTML(book.title)}</h3>
        <p class="book-author">${escapeHTML(book.author)}</p>
        <div class="book-bottom"><span class="status">${escapeHTML(book.status)}</span><span>${stars}</span></div>
        <div class="card-actions">
          <button data-action="status" data-id="${book.id}" title="Change status">🔄</button>
          <button data-action="edit" data-id="${book.id}" title="Edit book">✏️</button>
          <button data-action="delete" data-id="${book.id}" title="Delete book">🗑️</button>
        </div>
      </div>
    </article>`;
}

function renderCurrentlyReading() {
  const reading = books.filter(book => book.status === "Reading");
  $("currentlyReading").innerHTML = reading.length
    ? reading.map(createBookCard).join("")
    : `<div class="empty-mood" style="grid-column:1/-1"><span>📖</span><h3>No books currently reading</h3><p>Add a book and set its status to "Reading".</p></div>`;
}

function renderLibrary(list = null) {
  let result = list || [...books];

  if (!list) {
    if (currentFilter === "Favorites") result = books.filter(book => book.favorite);
    else if (currentFilter !== "all") result = books.filter(book => book.status === currentFilter);
  }

  $("libraryGrid").innerHTML = result.length
    ? result.map(createBookCard).join("")
    : `<div class="empty-mood" style="grid-column:1/-1"><span>📚</span><h3>No books found</h3><p>Try another filter or add a new book.</p></div>`;
}

function updateStatistics() {
  const total = books.length;
  const reading = books.filter(book => book.status === "Reading").length;
  const completed = books.filter(book => book.status === "Completed").length;
  const favorites = books.filter(book => book.favorite).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  [["totalBooks", total], ["readingBooks", reading], ["completedBooks", completed], ["favoriteBooks", favorites],
   ["statTotal", total], ["statReading", reading], ["statCompleted", completed], ["statFavorites", favorites]]
    .forEach(([id, value]) => $(id).textContent = value);

  $("largeProgress").style.width = `${progress}%`;
  $("progressText").textContent = total
    ? `${completed} of ${total} books completed (${progress}%).`
    : "Start adding books to track your reading progress.";
}

function updateGoal() {
  const completed = books.filter(book => book.status === "Completed").length;
  const percentage = Math.min((completed / Math.max(readingGoal, 1)) * 100, 100);
  $("goalProgress").textContent = completed;
  $("goalTarget").textContent = readingGoal;
  $("goalBar").style.width = `${percentage}%`;
}

function renderAll() {
  renderCurrentlyReading();
  renderLibrary();
  updateStatistics();
  updateGoal();
}

function addBook(data) {
  const duplicate = books.some(book => book.title.toLowerCase() === data.title.toLowerCase() && book.author.toLowerCase() === data.author.toLowerCase());
  if (duplicate) {
    showToast("That book is already in your library.");
    return false;
  }
  books.push({ id: Date.now(), ...data, favorite: false, color: randomColor() });
  saveBooks();
  renderAll();
  return true;
}

function updateBook(id, data) {
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return;
  books[index] = { ...books[index], ...data };
  saveBooks();
  renderAll();
}

function addRecommendation(title, author, genre = "Recommended") {
  if (books.some(book => book.title.toLowerCase() === title.toLowerCase())) {
    showToast("This book is already in your library.");
    return;
  }
  addBook({ title, author, genre, status: "Want to Read", rating: 0 });
  showToast("📚 Added to your library!");
}

function renderRecommendationCards(items) {
  return items.map((item, index) => `
    <article class="book-card">
      <div class="book-cover-card" style="background:${coverColor(["purple","orange","green","blue","pink"][index % 5])}">
        <div class="cover-title">${escapeHTML(item.title)}</div>
      </div>
      <div class="book-info">
        <h3>${escapeHTML(item.title)}</h3>
        <p class="book-author">${escapeHTML(item.author)}</p>
        <p class="book-author" style="margin-top:10px;line-height:1.5">💡 ${escapeHTML(item.reason || item.description || "A recommendation based on your preferences.")}</p>
        <button class="primary-btn" style="margin-top:14px;width:100%" data-add-title="${escapeHTML(item.title)}" data-add-author="${escapeHTML(item.author)}">+ Add to Library</button>
      </div>
    </article>`).join("");
}

function recommendMood(mood) {
  const recommendations = moodBooks[mood] || [];
  $("moodResult").classList.remove("empty-mood");
  $("moodResult").innerHTML = `<h2>${getMoodEmoji(mood)} Books for your ${capitalize(mood)} mood</h2><div class="recommendation-grid">${renderRecommendationCards(recommendations.map(([title, author, reason]) => ({title, author, reason})))}</div>`;
}

function getMoodEmoji(mood) {
  return { happy:"😊", romantic:"💖", mysterious:"🕵️", motivated:"🔥", calm:"🌿", adventure:"🌎" }[mood] || "📚";
}

function capitalize(text) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

async function generateAIRecommendation() {
  const genre = $("aiGenre").value;
  const mood = $("aiMood").value;
  const result = $("aiResult");
  result.innerHTML = `<div class="recommendation-result loading">✨ Finding recommendations...</div>`;

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ genre, mood, readingLevel: selectedLevel })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Recommendation request failed.");

    result.innerHTML = `
      <div class="recommendation-result">
        <h2>✨ Your ${data.source === "anthropic" ? "AI" : "Smart"} Recommendations</h2>
        <p class="book-author" style="margin-top:7px">Based on ${capitalize(genre)} + ${capitalize(mood)} + ${selectedLevel} level.</p>
        <div class="recommendation-grid">${renderRecommendationCards(data.recommendations)}</div>
      </div>`;
  } catch (error) {
    result.innerHTML = `<div class="recommendation-result empty-mood"><span>⚠️</span><h3>Recommendations unavailable</h3><p>Please make sure the server is running and try again.</p></div>`;
  }
}

function searchBooks(query) {
  const q = String(query).toLowerCase().trim();
  if (!q) {
    renderLibrary();
    return;
  }
  showSection("library");
  const results = books.filter(book =>
    [book.title, book.author, book.genre, book.status].some(value => String(value).toLowerCase().includes(q))
  );
  renderLibrary(results);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => showSection(button.dataset.section)));
  document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => showSection(button.dataset.go)));

  $("addBookHero").addEventListener("click", () => openAddBook());
  $("addBookLibrary").addEventListener("click", () => openAddBook());
  $("moodHero").addEventListener("click", () => showSection("mood"));
  $("aiShortcut").addEventListener("click", () => showSection("ai"));

  $("globalSearch").addEventListener("input", e => searchBooks(e.target.value));
  $("changeGoalBtn").addEventListener("click", () => {
    const value = prompt("Enter your new reading goal:", readingGoal);
    const number = Number(value);
    if (Number.isInteger(number) && number > 0) {
      readingGoal = number;
      localStorage.setItem("booklyGoal", String(number));
      updateGoal();
      showToast("🎯 Reading goal updated!");
    }
  });

  $("closeModal").addEventListener("click", closeAddBook);
  $("bookModal").addEventListener("click", e => { if (e.target === $("bookModal")) closeAddBook(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAddBook(); });

  $("bookForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = Number($("bookId").value);
    const data = {
      title: $("bookTitle").value.trim(),
      author: $("bookAuthor").value.trim(),
      genre: $("bookGenre").value,
      status: $("bookStatus").value,
      rating: Number($("bookRating").value)
    };
    if (id) {
      updateBook(id, data);
      showToast("✏️ Book updated!");
    } else if (addBook(data)) {
      showToast("📚 Book added successfully!");
    } else {
      return;
    }
    closeAddBook();
  });

  $("filterRow").addEventListener("click", e => {
    const button = e.target.closest("[data-filter]");
    if (!button) return;
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn === button));
    renderLibrary();
  });

  document.querySelectorAll(".mood-card").forEach(button => button.addEventListener("click", () => recommendMood(button.dataset.mood)));

  $("levelButtons").addEventListener("click", e => {
    const button = e.target.closest("[data-level]");
    if (!button) return;
    selectedLevel = button.dataset.level;
    document.querySelectorAll(".level-buttons button").forEach(btn => btn.classList.toggle("selected", btn === button));
  });

  $("aiForm").addEventListener("submit", e => {
    e.preventDefault();
    generateAIRecommendation();
  });

  document.addEventListener("click", e => {
    const actionButton = e.target.closest("[data-action]");
    if (actionButton) {
      const id = Number(actionButton.dataset.id);
      const action = actionButton.dataset.action;
      const book = books.find(item => item.id === id);
      if (!book) return;

      if (action === "favorite") {
        book.favorite = !book.favorite;
        saveBooks();
        renderAll();
        showToast(book.favorite ? "❤️ Added to favorites" : "Removed from favorites");
      } else if (action === "delete") {
        if (confirm(`Delete "${book.title}" from your library?`)) {
          books = books.filter(item => item.id !== id);
          saveBooks();
          renderAll();
          showToast("🗑️ Book deleted");
        }
      } else if (action === "status") {
        const statuses = ["Want to Read", "Reading", "Completed"];
        book.status = statuses[(statuses.indexOf(book.status) + 1) % statuses.length];
        saveBooks();
        renderAll();
        showToast(`Status changed to ${book.status}`);
      } else if (action === "edit") {
        openAddBook(book);
      }
    }

    const recommendationButton = e.target.closest("[data-add-title]");
    if (recommendationButton) {
      addRecommendation(recommendationButton.dataset.addTitle, recommendationButton.dataset.addAuthor);
    }
  });

  renderAll();
});
