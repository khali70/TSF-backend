const express = require('express');
const { getRemoteFile, DownloadAIModel, getAIObject } = require('./download')
const app = express();
(async () => {
  console.log("process.env.NODE_ENV " + process.env.NODE_ENV)
  const originUrl = process.env.NODE_ENV === 'development' ? "http://localhost:3000" : "https://eclectic-druid-c8e708.netlify.app";
  app.use(express.json())
  app.use(express.static('public'))
  app.get('/', async (req, res) => {
    res.send('Hello world again')
  })
  app.options('/update', async (req, res) => {
    if (req.headers?.origin === originUrl) {
      res.header("Access-Control-Allow-Methods", 'POST,GET');
      res.header("Access-Control-Allow-Origin", originUrl);
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Connection, Accept-Encoding"
      );
      res.status(200);
      res.send();
    }
  })
  app.post('/update', async (req, res) => {
    console.log('------------------------update route------------------------------------')
    console.log(JSON.stringify(req.body))
    console.log()
    try {
      const ai = await getAIObject();
      DownloadAIModel(ai);
      res.header("Access-Control-Allow-Origin", originUrl);
      res.status(200);
      res.send({ body: 'updated' })
    } catch (error) {
      console.log(error);
      res.status(500);
      res.send({ body: 'error while updating' })
    }

  })
  app.listen(process.env.PORT || 8000, () => {
    getAIObject()
      .then((ai) => {
        DownloadAIModel(ai);
      })
    console.log('Web Server is listening at PORT http://localhost:' + (process.env.PORT || 8000));
  });
})()