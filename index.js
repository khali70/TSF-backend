const express = require('express');
const { initializeApp } = require('@firebase/app');
const { getFirestore, getDocs, collection, doc } = require('@firebase/firestore');
const { firebaseConfig } = require('./firebase.config');
const { getRemoteFile } = require('./download')

const app = express();
(async () => {

  app.use(express.json())
  app.use(express.static('public'))
  app.get('/', async (req, res) => {
    res.send('Hello world')
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
      getRemoteFile(`public/` + ai.model.title, ai.model.src);
      getRemoteFile(`public/` + ai.weights.title, ai.weights.src);
      res.status(200);
      res.send({ body: 'updated' })
    } catch (error) {
      console.log(error);
      res.status(500);
      res.send({ body: 'error while updating' })
    }

  })
  app.listen(process.env.PORT || 3000);
  console.log('Web Server is listening at PORT ' + (process.env.PORT || 3000));
})()