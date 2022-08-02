const express = require('express');
const { initializeApp } = require('@firebase/app');
const { getFirestore, getDocs, collection, doc } = require('@firebase/firestore');
const { firebaseConfig } = require('./firebase.config');
const { getRemoteFile } = require('./download')
const fs = require('fs');
const app = express();
(async () => {

  app.use(express.json())
  app.use(express.static('public'))
  app.get('/', async (req, res) => {
    res.send('Hello world again')
  })
  app.post('/update', async (req, res) => {
    try {
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
      res.header("Access-Control-Allow-Origin", "*");
      res.status(200);
      res.send({ body: 'updated' })
    } catch (error) {
      console.log(error);
      res.status(500);
      res.send({ body: 'error while updating' })
    }

  })
  app.listen(process.env.PORT || 8000);
  console.log('Web Server is listening at PORT http://localhost:' + (process.env.PORT || 8000));
})()