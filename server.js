require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Serve static files FIRST
app.use(express.static(__dirname, { index: false }));

// API
app.post("/api/recommend", async (req, res) => {
  try {
    const {
      genre = "fiction",
      mood = "happy",
      readingLevel = "Medium"
    } = req.body || {};

    const fallbackRecommendations = {
      fiction: [
        {
          title: "The Midnight Library",
          author: "Matt Haig",
          description: "A thoughtful story about choices and possibilities."
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          description: "A reflective journey about dreams and purpose."
        },
        {
          title: "The Book Thief",
          author: "Markus Zusak",
          description: "A memorable story about books, friendship, and resilience."
        }
      ],
      mystery: [
        {
          title: "The Silent Patient",
          author: "Alex Michaelides",
          description: "A psychological mystery filled with secrets."
        },
        {
          title: "Gone Girl",
          author: "Gillian Flynn",
          description: "A twist-filled mystery with competing stories."
        },
        {
          title: "Sherlock Holmes",
          author: "Arthur Conan Doyle",
          description: "Classic detective mysteries and clever deductions."
        }
      ],
      romance: [
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          description: "A classic story about relationships and personal growth."
        },
        {
          title: "Jane Eyre",
          author: "Charlotte Brontë",
          description: "A coming-of-age story about independence and romance."
        },
        {
          title: "Emma",
          author: "Jane Austen",
          description: "A charming story about friendship and misunderstandings."
        }
      ],
      selfhelp: [
        {
          title: "Atomic Habits",
          author: "James Clear",
          description: "Practical ideas for building helpful habits."
        },
        {
          title: "Deep Work",
          author: "Cal Newport",
          description: "Ideas for improving concentration and focused work."
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen R. Covey",
          description: "A classic framework for personal effectiveness."
        }
      ],
      fantasy: [
        {
          title: "Harry Potter",
          author: "J.K. Rowling",
          description: "A magical coming-of-age adventure."
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          description: "A classic fantasy adventure."
        },
        {
          title: "The Chronicles of Narnia",
          author: "C.S. Lewis",
          description: "A classic fantasy series filled with adventure."
        }
      ],
      adventure: [
        {
          title: "Treasure Island",
          author: "Robert Louis Stevenson",
          description: "A classic adventure involving treasure and pirates."
        },
        {
          title: "Around the World in 80 Days",
          author: "Jules Verne",
          description: "A fast-paced journey around the world."
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          description: "An unexpected journey filled with discovery."
        }
      ]
    };

    const recommendations =
      fallbackRecommendations[String(genre).toLowerCase()] ||
      fallbackRecommendations.fiction;

    res.json({
      success: true,
      source: "built-in",
      recommendations
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to generate recommendations."
    });
  }
});

// Home page MUST come after static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Unknown routes
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Bookly is running at http://localhost:${PORT}`);
});