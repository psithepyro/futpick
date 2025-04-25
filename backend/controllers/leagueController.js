const pool = require("../config/database");

// Get all leagues the user is a part of
exports.getUserLeagues = async (req, res) => {
    const userId = req.user.id;

    try {
        const leaguesResult = await pool.query(
            `SELECT l.id, l.name, l.logo, ul.rank
            FROM user_leagues ul
            JOIN leagues l ON ul.league_id = l.id
            WHERE ul.user_id = $1`,
            [userId]
        );

        res.json(leaguesResult.rows);
    } catch (error) {
        console.error("Error fetching user leagues:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

    // Join a league
exports.joinLeague = async (req, res) => {
    const userId = req.user.id;
    const { leagueId } = req.body;

    if (!leagueId) {
        return res.status(400).json({ message: "League ID is required" });
    }

    try {
        // Check if the user is already in the league
        const existingEntry = await pool.query(
            `SELECT * FROM user_leagues WHERE user_id = $1 AND league_id = $2`,
            [userId, leagueId]
        );

        if (existingEntry.rows.length > 0) {
            return res.status(400).json({ message: "User is already in this league" });
        }

        // Add the user to the league
        await pool.query(
            `INSERT INTO user_leagues (user_id, league_id, rank) VALUES ($1, $2, $3)`,
            [userId, leagueId, null] // Rank can be calculated later
        );

        res.status(201).json({ message: "Successfully joined the league" });
    } catch (error) {
        console.error("Error joining league:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Leave a league
exports.leaveLeague = async (req, res) => {
    const userId = req.user.id;
    const { leagueId } = req.params;

    if (!leagueId) {
        return res.status(400).json({ message: "League ID is required" });
    }

    try {
        // Remove the user from the league
        const result = await pool.query(
            `DELETE FROM user_leagues WHERE user_id = $1 AND league_id = $2`,
            [userId, leagueId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User is not part of this league" });
        }

        res.json({ message: "Successfully left the league" });
    } catch (error) {
        console.error("Error leaving league:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get details of a specific league
exports.getLeagueDetails = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const leagueResult = await pool.query(
            `SELECT id, name, logo FROM leagues WHERE id = $1`,
            [leagueId]
        );

        if (leagueResult.rows.length === 0) {
            return res.status(404).json({ message: "League not found" });
        }

        const league = leagueResult.rows[0];

        const membersResult = await pool.query(
            `SELECT u.id AS user_id, u.username, ul.rank, ft.points
            FROM user_leagues ul
            JOIN users u ON ul.user_id = u.id
            LEFT JOIN fantasy_teams ft ON ft.user_id = u.id
            WHERE ul.league_id = $1
            ORDER BY ul.rank ASC`,
            [leagueId]
        );

        res.json({
            league,
            members: membersResult.rows,
        });
    } catch (error) {
        console.error("Error fetching league details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};