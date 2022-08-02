const https = require('https');
const fs = require('fs');

function getRemoteFile(file, url, listener = { onEnd: () => { }, onData: () => { } }) {
  const { onEnd, onData } = listener
  let localFile = fs.createWriteStream(file);
  return new Promise((resolve, reject) => {
    const request = https.get(url, function (response) {
      var len = parseInt(response.headers["content-length"], 10);
      var cur = 0;
      var total = len / 1048576; //1048576 - bytes in 1 Megabyte

      response.on("data", function (chunk) {
        cur += chunk.length;
        onData();
      });

      response.on("end", function () {
        console.log("Download complete");
        onEnd()
        resolve('string');
      });

      response.pipe(localFile);
    });
  })
}

function showProgress(file, cur, len, total) {
  console.clear();
  console.log(
    "Downloading " +
    file +
    " - " +
    ((100.0 * cur) / len).toFixed(2) +
    "% (" +
    (cur / 1048576).toFixed(2) +
    " MB) of total size: " +
    total.toFixed(2) +
    " MB"
  );
}
module.exports = { getRemoteFile }