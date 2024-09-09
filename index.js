require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser")
const database = require("./config/database");

const app = express();
const port = process.env.PORT;
const route = require("./api/v1/Routes/index.route");

database.connect();

app.use(express.json());
// CORS (Cấp quyền truy cập cho Font-end)
app.use(cors())

route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
