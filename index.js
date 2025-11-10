const express = require("express");
const path = require("path");
const userRouter = require("./routes/user.routes");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", require("./routes/pcs.routes"));
app.use("/api", require("./routes/bookings.routes"));

app.use(express.static(__dirname));

app.use(express.static(path.join(__dirname, "pages")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`PORT is listed on ${PORT}`));
