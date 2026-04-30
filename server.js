const express = require("express");
const cors = require("cors");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new PlaidApi(
  new Configuration({
   basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  })
);

app.get("/", (req, res) => {
  res.send("Plaid backend is running");
});

app.post("/create_link_token", async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: "user-123" },
      client_name: "Safe To Spend",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    res.json({ link_token: response.data.link_token });
  } catch (err) {
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

app.post("/exchange_public_token", async (req, res) => {
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });

    res.json({
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    });
  } catch (err) {
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
