require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Serve CSS, JavaScript, images, and other static files
app.use(
  express.static(__dirname, {
    index: false
  })
);

const fallbackRecommendations = {
  fiction: [
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      description:
        "A thoughtful story about choices, possibilities, and the lives we might have lived."
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      description:
        "A reflective journey about dreams, purpose, and following a personal path."
    },
    {
      title: "The Book Thief",
      author: "Markus Zusak",
      description:
        "A memorable historical novel centered on books, friendship, and resilience."
    }
  ],

  mystery: [
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      description:
        "A psychological mystery built around an unexplained silence and hidden secrets."
    },
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      description:
        "A twist-filled mystery exploring a complicated relationship and competing stories."
    },
    {
      title: "Sherlock Holmes",
      author: "Arthur Conan Doyle",
      description:
        "Classic detective mysteries featuring careful observation and clever deductions."
    }
  ],

  romance: [
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description:
        "A witty classic about relationships, first impressions, and personal growth."
    },
    {
      title: "Jane Eyre",
      author: "Charlotte Brontë",
      description:
        "A classic coming-of-age story combining independence, mystery, and romance."
    },
    {
      title: "Emma",
      author: "Jane Austen",
      description:
        "A charming classic about friendship, matchmaking, misunderstandings, and maturity."
    }
  ],

  selfhelp: [
    {
      title: "Atomic Habits",
      author: "James Clear",
      description:
        "Practical ideas for building helpful habits through small, consistent changes."
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      description:
        "A guide to improving concentration and making focused work more effective."
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      description:
        "A classic personal-development framework focused on habits and effectiveness."
    }
  ],

  fantasy: [
    {
      title: "Harry Potter",
      author: "J.K. Rowling",
      description:
        "A magical coming-of-age adventure filled with friendship, discovery, and challenges."
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description:
        "A classic fantasy adventure following an unexpected journey and a reluctant hero."
    },
    {
      title: "The Chronicles of Narnia",
      author: "C.S. Lewis",
      description:
        "A classic fantasy series featuring imaginative worlds, courage, and adventure."
    }
  ],

  adventure: [
    {
      title: "Treasure Island",
      author: "Robert Louis Stevenson",
      description:
        "A classic adventure involving a journey, a treasure map, and pirates."
    },
    {
      title: "Around the World in 80 Days",
      author: "Jules Verne",
      description:
        "A fast-paced classic journey around the world against the clock."
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description:
        "A fantasy adventure featuring an unexpected journey and a world of discovery."
    }
  ]
};

function fallbackForGenre(genre) {
  return (
    fallbackRecommendations[
      String(genre || "fiction").toLowerCase()
    ] || fallbackRecommendations.fiction
  );
}

async function generateWithAnthropic({ genre, mood, readingLevel }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const { Anthropic } = require("@anthropic-ai/sdk");

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = [
    "Recommend exactly 3 books.",
    `Genre: ${genre}`,
    `Mood: ${mood}`,
    `Reading level: ${readingLevel}`,
    "Return ONLY valid JSON in this format:",
    '{"recommendations":[{"title":"...","author":"...","description":"..."}]}',
    "Descriptions must be brief and family-friendly."
  ].join("\n");

  const response = await anthropic.messages.create({
    model:
      process.env.ANTHROPIC_MODEL ||
      "claude-3-5-sonnet-20241022",
    max_tokens: 700,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("")
    .trim();

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid AI response");
  }

  return parsed.recommendations.slice(0, 3);
}

/* =========================
   API ROUTE
========================= */

app.post("/api/recommend", async (req, res) => {
  try {
    const {
      genre = "fiction",
      mood = "happy",
      readingLevel = "Medium"
    } = req.body || {};

    let recommendations;
    let source = "built-in";

    try {
      recommendations = await generateWithAnthropic({
        genre,
        mood,
        readingLevel
      });

      if (recommendations) {
        source = "anthropic";
      }
    } catch (aiError) {
      console.error(
        "AI recommendation failed; using fallback:",
        aiError.message
      );
    }

    if (!recommendations) {
      recommendations = fallbackForGenre(genre);
    }

    res.json({
      success: true,
      source,
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

/* =========================
   FRONTEND
========================= */

// Only "/" should return index.html.
// CSS and JS are handled by express.static above.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Bookly is running at http://localhost:${PORT}`);
});