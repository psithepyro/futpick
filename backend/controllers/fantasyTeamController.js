const pool = require("../config/database");

exports.createFantasyTeam = async (req, res) => {
  const { players } = req.body; // array of {player_id, postition}

  const userId = req.user.id;

  const count = {
    Goalkeeper: 0,
    Defender: 0,
    Midfielder: 0,
    Attacker: 0,
  };

  let reserveCount = 0;

  for (const player of players) {
    if (player.is_reserve) {
      reserveCount++;
    } else if (count[player.position] !== undefined) {
      count[player.position]++;
    }
  }

  if (
    count.Goalkeeper !== 2 ||
    count.Defender !== 5 ||
    count.Midfielder !== 5 ||
    count.Attacker !== 3 ||
    reserveCount !== 4
  ) {
    console.log("Counts:", count, "Reserves:", reserveCount);
    return res.status(400).json({ message: "Invalid team composition" });
  }

  try {
    const teamResult = await pool.query(
      "INSERT INTO fantasy_teams (user_id) VALUES ($1) RETURNING id",
      [userId]
    );

    const teamId = teamResult.rows[0].id;

    for (const player of players) {
      await pool.query(
        "INSERT INTO fantasy_team_players (team_id, player_id, position, is_reserve) VALUES ($1, $2, $3, $4)",
        [teamId, player.player_id, player.position, player.is_reserve || false]
      );
    }

    res.status(201).json({ message: "Team created successfully", teamId });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserTeam = async (req, res) => {
  const userId = req.user.id;

  try {
    const teamResult = await pool.query(
      `SELECT id FROM fantasy_teams WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: "No team found" });
    }

    const teamId = teamResult.rows[0].id;

    const playersResult = await pool.query(
      `SELECT player_id, position FROM fantasy_team_players WHERE team_id = $1`,
      [teamId]
    );

    res.json({
      teamId,
      players: playersResult.rows,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateFantasyTeam = async (req, res) => {
  const userId = req.user.id;
  const { teamId, players } = req.body;

  if (!teamId || !Array.isArray(players)) {
    return res.status(400).json({ message: "Missing teamId or players array" });
  }

  const counts = {
    Goalkeeper: 0,
    Defender: 0,
    Midfielder: 0,
    Attacker: 0,
  };
  let reserveCount = 0;

  for (const player of players) {
    if (!player.player_id || !player.position) {
      return res
        .status(400)
        .json({ message: "Each player must have player_id and position" });
    }

    if (player.is_reserve) {
      reserveCount++;
    } else if (counts[player.position] !== undefined) {
      counts[player.position]++;
    }
  }

  if (
    counts.Goalkeeper !== 2 ||
    counts.Defender !== 5 ||
    counts.Midfielder !== 5 ||
    counts.Attacker !== 3 ||
    reserveCount !== 4
  ) {
    return res.status(400).json({ message: "Invalid team composition" });
  }

  try {
    await pool.query("DELETE FROM fantasy_team_players WHERE team_id = $1", [
      teamId,
    ]);

    for (const player of players) {
      await pool.query(
        `INSERT INTO fantasy_team_players (team_id, player_id, position, is_reserve) VALUES ($1, $2, $3, $4)`,
        [teamId, player.player_id, player.position, player.is_reserve || false]
      );
    }

    res.json({ message: "Team updated successfully" });
  } catch (err) {
    console.error("Error updating team:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteFantasyTeam = async (req, res) => {
  const userId = req.user.id;

  try {
    const team = await pool.query(
      `SELECT id FROM fantasy_teams WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({ message: "No team found" });
    }

    const teamId = team.rows[0].id;

    await pool.query("DELETE FROM fantasy_team_players WHERE team_id = $1", [
      teamId,
    ]);
    await pool.query("DELETE FROM fantasy_teams WHERE id = $1", [teamId]);

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("error deleting team:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
