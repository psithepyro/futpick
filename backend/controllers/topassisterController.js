const apiFootball = require("../services/apiService");

//Controller function to fetch LigaMX players
//this function is called when a user hits the route that retrives players data
exports.getPlayers = async (req, res) => {
    try {
        //retrieve the page parameter to handle paginated data from API
        const page = req.query.page || 1; // default to page 1
        //send a get request to the API-Football endpoint
        const response = await apiFootball.get("/players/topassists", {
            params: {
            league: 262, //Liga MX league ID
            season: 2023, //Season for players
            },
        });
        //raw data from the API response
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching players: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};