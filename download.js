const https = require('https');
const fs = require('fs');
const { firebaseConfig } = require('./firebase.config');
const { getFirestore, getDocs, collection } = require('@firebase/firestore');
const { initializeApp } = require('@firebase/app');


function getRemoteFile(file, url) {
  let localFile = fs.createWriteStream(file);
  return new Promise((resolve, reject) => {
    const request = https.get(url, function (response) {
      var len = parseInt(response.headers["content-length"], 10);
      var cur = 0;
      var total = len / 1048576; //1048576 - bytes in 1 Megabyte

      response.on("data", function (chunk) {
        cur += chunk.length;
      });

      response.on("end", function () {
        console.log("Download complete");
        resolve('string');
      });

      response.pipe(localFile);
    });
  })
}
const getAIObject = async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const querySnapshot = await getDocs(collection(db, "/LifeSign/SW/ai"));
  const docs/* : AI[] */ = [];
  (querySnapshot /* as QuerySnapshot<AI> */).forEach((doc) => {
    docs.push(doc.data());
  });
  if (!docs?.[0]) {
    throw new Error(`model object not found`);
  }
  const ai = docs[0];
  console.log(ai)
  return ai;
}
const DownloadAIModel = async (ai) => {
  console.log(ai)
  await getRemoteFile(`public/` + ai.model.title, ai.model.src);
  for (const { title, src } of ai.weights) {
    await getRemoteFile(`public/` + title, src);
  }
  const mapping = JSON.stringify({
    shape: JSON.parse(ai.shape),
    mapping: JSON.parse(ai.map)
  });
  console.log(mapping);
  fs.writeFileSync('public/' + 'map.json', mapping, {
    flag: 'w'
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
module.exports = { getRemoteFile, DownloadAIModel, getAIObject }