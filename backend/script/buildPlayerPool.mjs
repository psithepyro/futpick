// Load environment variables from .env file
import dotenv from "dotenv";
// Fetch API module
import fetch from "node-fetch";
// Node filesystem module
import * as fs from "fs";

// Initialize environment variables
dotenv.config();

// Constants for API
const API_KEY = process.env.API_FOOTBALL_KEY;
const SEASON = 2023;
const LEAGUE_ID = 262;
const BASE_URL = "https://v3.football.api-sports.io/players";

// Header for API authentication
const headers = {
  "x-apisports-key": API_KEY,
};

// Fetch players for a specific page
async function fetchPlayers(page) {
  const res = await fetch(
    `${BASE_URL}?league=${LEAGUE_ID}&season=${SEASON}&page=${page}`,
    {
      headers,
    }
  );
  const data = await res.json();
  return data.response || [];
}

// Calculate fantasy points based on player statistics and position
function calculatePoints(stats, position) {
  const goals = stats.goals?.total || 0;
  const assists = stats.goals?.assists || 0;
  const yellow = stats.cards?.yellow || 0;
  const conceded = stats.goals?.conceded || 0;
  const appeared = stats.games?.appearences || 0;

  let points = 0;

  // Scoring rules based on position
  if (position === "Attacker") points += goals * 4;
  if (position === "Midfielder") points += goals * 5;
  if (position === "Defender" || position === "Goalkeeper") points += goals * 6;

  points += assists * 3;
  points -= yellow;

  // Extra for clean sheet for GKs
  if (position === "Goalkeeper" && conceded === 0) points += 4;

  // 1 point for just appearing
  if (appeared > 0) points += 1;

  return Math.max(points, 0); // Prevent negative point totals
}

// Object to hold players grouped by position
const grouped = {
  Goalkeeper: [],
  Defender: [],
  Midfielder: [],
  Attacker: [],
};

// Loop through API pages
for (let page = 1; page <= 40; page++) {
  console.log(`Fetching page ${page}...`);
  const rawPlayers = await fetchPlayers(page);
  console.log(`Raw players returned: ${rawPlayers.length}`);

  // Filter players with valid stats
  const usable = rawPlayers.filter((p) => {
    const stats = p.statistics?.[0];
    const rating = parseFloat(stats?.games?.rating);
    const played = stats?.games?.appearences || 0;
    return rating && played > 0;
  });

  console.log(`Page ${page}: kept ${usable.length} players with stats`);

  // Add usable players to the grouped object
  usable.forEach((p) => {
    const stats = p.statistics[0];
    const position = stats.games.position;
    if (!grouped[position]) {
      console.log(`Skipping ${p.player.name} due to invalid position`);
      return;
    }

    grouped[position].push({
      id: p.player.id,
      name: p.player.name,
      photo: p.player.photo,
      team: stats.team.name,
      rating: stats.games.rating,
      points: calculatePoints(stats, position),
      position,
    });

    console.log(`Added: ${p.player.name} (${position})`);
  });
}

// Output JSON to public folder
const outPath = "./public/data/fantasyPlayerPool.json";

// Make sure folder exists
fs.mkdirSync("./public/data", { recursive: true });

console.log("Player counts by position:");
for (const position in grouped) {
  console.log(`- ${position}: ${grouped[position].length} players`);
}

// Write the file to disk
fs.writeFileSync(outPath, JSON.stringify(grouped, null, 2));
console.log("Player pool saved to:", outPath);
