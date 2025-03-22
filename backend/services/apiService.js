//axios to make HTTP requests
const axios = require("axios");

const apiFootball = axios.create({
  baseURL: "http://v3.football.api-sports.io",
  headers: {
    "x-apisports-key": process.env.API_FOOTBALL_KEY, //API Key
    "x-apisports-host": process.env.API_FOOTBALL_HOST, //API host
  },
});

module.exports = apiFootball;
