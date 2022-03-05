const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const app = express();
(async () => {

  const model = await tf.loadLayersModel('file://' + './model.json')
  app.use(express.json())
  app.get('/', async (req, res) => {
    res.send('Hello world')
  })
  app.post('/', async (req, res) => {
    const data = req.body.data?.split(',').map(parseFloat);
    const shape = req.body?.shape || [1, 5]
    const p = model.predict(tf.tensor2d(data, shape))
    const value = Array.from(p.dataSync());
    const result = value.indexOf(Math.max(...value))
    res.setHeader('Content-Type', 'application/json');
    if (result > -1) {
      res.send(JSON.stringify({ res: result }))
    } else {
      res.send(JSON.stringify({ error: "invalid encoding" }))
    }

  });

  app.listen(process.env.PORT || 3000);
  console.log('Web Server is listening at PORT ' + (process.env.PORT || 3000));
})()