const https = require("https");

const pingUrl = "https://smart-home-json-server.onrender.com/";
const pingInterval = 14 * 60 * 1000; // 14 minutes

function reloadWebsite() {
  const urlObj = new URL(pingUrl);

  https.get(urlObj, (res) => {
    console.log(
      `[PING] Reloaded at ${new Date().toISOString()}: Status Code ${res.statusCode}`,
    );
  }).on("error", (err) => {
    console.error(
      `[PING ERROR] Error reloading at ${new Date().toISOString()}:`,
      err.message,
    );
  });
}

function startPinging() {
  reloadWebsite();
  setInterval(reloadWebsite, pingInterval);
}

module.exports = startPinging;
