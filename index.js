const express = require('express');
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
      if (!req?.body?.ai) throw `can't read ai in request body`
      const { ai } = req.body;
      console.log(req.body)
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
      console.log()
      console.log(JSON.stringify({ body: req.body, headers: req.headers }))
      console.log()
      console.log(error);
      res.status(500);
      res.send({ body: 'error while updating' })
    }

  })
  app.listen(process.env.PORT || 8000);
  console.log('Web Server is listening at PORT http://localhost:' + (process.env.PORT || 8000));
})()