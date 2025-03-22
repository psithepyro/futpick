const apiFootball = require("../services/apiService");

//Controller function to fetch LigaMX fixtures
//this function is called when a user hits the route that retrieves fixture data
exports.getFixtures = async (req, res) => {
  try {
    //send a GET request to the API-Football endpoint
    const response = await apiFootball.get("/fixtures", {
      params: {
        league: 262, //Liga MX League ID
        season: 2023, // Season for fixture
      },
    });
    //rreturn raw data from the API response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching fixtures: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
