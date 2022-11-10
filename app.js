const express = require('express');
const port = 3000;
const app = express();
require('dotenv').config();
const YAML = require('yamljs');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require('dotenv').config();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
