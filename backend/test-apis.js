require("dotenv").config();
const axios = require("axios");

async function testApis() {
  console.log("\n=========== TESTING ALL APIs ===========\n");

  // Check for required environment variables
  const requiredEnvVars = [
    'UNSPLASH_ACCESS_KEY',
    'OPENWEATHER_API_KEY',
    'OPENTRIPMAP_API_KEY',
    'GEODB_API_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`❌ ${envVar} not set in environment variables`);
      console.log("---------------------------------------");
      return;
    }
  }

  console.log("✅ All required environment variables are set");
  console.log("---------------------------------------");

  // ==================================================
  // UNSPLASH
  // ==================================================
  try {
    const unsplash = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        params: {
          query: "Goa",
          per_page: 1,
          client_id: process.env.UNSPLASH_ACCESS_KEY,
        },
      }
    );

    console.log("✅ Unsplash API Working");
    console.log(
      "Image:",
      unsplash.data.results[0]?.urls?.regular || "No image"
    );
    console.log("---------------------------------------");
  } catch (err) {
    console.log("❌ Unsplash API Failed");

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    console.log("---------------------------------------");
  }

  // ==================================================
  // OPENWEATHER
  // ==================================================
  try {
    const weather = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: "Goa",
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    console.log("✅ OpenWeather API Working");
    console.log(
      "Temperature:",
      weather.data.main.temp + "°C"
    );
    console.log(
      "Weather:",
      weather.data.weather[0].description
    );
    console.log("---------------------------------------");
  } catch (err) {
    console.log("❌ OpenWeather API Failed");

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    console.log("---------------------------------------");
  }

  // ==================================================
  // OPENTRIPMAP
  // ==================================================
  try {
    const trip = await axios.get(
      "https://api.opentripmap.com/0.1/en/places/geoname",
      {
        params: {
          name: "Goa",
          apikey: process.env.OPENTRIPMAP_API_KEY,
        },
      }
    );

    console.log("✅ OpenTripMap API Working");
    console.log("Place:", trip.data.name);
    console.log("Country:", trip.data.country);
    console.log("---------------------------------------");
  } catch (err) {
    console.log("❌ OpenTripMap API Failed");

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    console.log("---------------------------------------");
  }

  // ==================================================
  // GEODB
  // ==================================================
  try {
    const geodb = await axios.get(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      {
        headers: {
          "X-RapidAPI-Key": process.env.GEODB_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
        params: {
          limit: 1,
          namePrefix: "Goa",
        },
      }
    );

    console.log("✅ GeoDB API Working");

    if (geodb.data.data.length > 0) {
      console.log(
        "City:",
        geodb.data.data[0].city
      );

      console.log(
        "Country:",
        geodb.data.data[0].country
      );
    }

    console.log("---------------------------------------");
  } catch (err) {
    console.log("❌ GeoDB API Failed");

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    console.log("---------------------------------------");
  }

  console.log("\n=========== TEST COMPLETED ===========\n");
}

testApis().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
