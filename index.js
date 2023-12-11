const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const multer = require('multer');
const Ajv = require('ajv');
const validators = require('./val.json');
const fs = require('fs');

const template = fs.readFileSync('tem.html').toString();

const ajv = new Ajv({ useDefaults: true, removeAdditional: true });

const createValidator = ajv.compile(validators.DeviceSchema);
const updateValidator = ajv.compile(validators.UpdateSchema);

const upload = multer({ dest: 'uploads/' });
const devices = [];

const port = 8000;
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/images', express.static('uploads'));

app.get('/devices', (req, res) => {
  res.status(200).send(devices);
});

app.get('/devices/:id', (req, res) => {
    const deviceId = parseInt(req.params.id, 10); // Parse the id as an integer
    const device = devices.find((obj) => obj.id === deviceId);
  
    if (!device) {
      res.sendStatus(404);
    } else {
      res.status(200).json(device); // Send the device as JSON
    }
  });
  
app.delete('/devices/:id', (req, res) => {
    const deviceId = parseInt(req.params.id, 10);
    const deviceIndex = devices.findIndex((obj) => obj.id === deviceId);
  
    if (deviceIndex !== -1) {
      devices.splice(deviceIndex, 1);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
});
  
app.post('/devices', (req, res) => {
    if (createValidator(req.body)) {
        var obj = req.body;
        obj.id = devices.length;
        devices.push(req.body);
        res.status(201).send(obj.toString());
    } else {
        res.sendStatus(400);
        console.log(ajv.errors);
    }
});

app.put('/devices/:id', (req, res) => {
  if (updateValidator(req.body)) {
    const deviceIndex = devices.findIndex((obj) => obj.id == req.params.id);
    if (deviceIndex !== -1) {
      devices[deviceIndex] = { ...devices[deviceIndex], ...req.body };
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
    console.log(updateValidator.errors);
  }
});

app.get('/devices/:id', (req, res) => {
    const deviceId = parseInt(req.params.id);
    const device = devices.find((obj) => obj.id === deviceId);
  
    if (!device) {
      res.sendStatus(404);
    } else {
      res.status(200).send(device);
    }
  });



app.put('/devices/:id/image', upload.single('image'), (req, res) => {
  const device = devices.find((obj) => obj.id == req.params.id);

  if (!device) {
    res.sendStatus(404);
  } else {
    device.image_path = req.file.filename;
    res.sendStatus(200);
  }
});

app.get('/devices/:id/image', (req, res) => {
  const device = devices.find((obj) => obj.id == req.params.id);

  if (!device || !device.image_path) {
    res.sendStatus(404);
  } else {
    res.send(template.replace('{%image_path}', device.image_path));
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}/api-docs`);
});
