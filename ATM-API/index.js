const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const UserRoutes = require("./routes/users-route");
const AuthRoutes = require("./routes/userAuth-route");
const AtmRoutes = require("./routes/atm-router");
const AccountRoutes = require("./routes/accounts-router");
const AccountTransactionRoutes = require("./routes/account-transactions-router");
const PayeesRoutes = require("./routes/payees-router");

const dbUrl =
  "mongodb+srv://admin:admin@cluster0.k8jc5.mongodb.net/db_atm_app_simulator?retryWrites=true&w=majority";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "http://localhost:4200" }));

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(4500, () => {
      console.log("App is listening to port 4500 : DB connected");
    });
  })
  .catch(err => {
    console.log(err);
  });

app.use("/api/users", UserRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/atm", AtmRoutes);
app.use("/api/accounts", AccountRoutes);
app.use("/api/accounts/transaction", AccountTransactionRoutes);
app.use("/api/payee", PayeesRoutes);

app.all("*", (req, res) => {
  res.send(`<h1>Page not found</h1>`);
});
