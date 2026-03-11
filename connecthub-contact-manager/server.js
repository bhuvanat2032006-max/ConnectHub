const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const FILE = "contacts.json";

function readContacts() {
  // Ensure the contacts file exists and contains a valid JSON array.
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
    return [];
  }

  const data = fs.readFileSync(FILE, "utf8").trim();
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to parse contacts.json:", err);
    return [];
  }
}

function writeContacts(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// GET ALL CONTACTS
app.get("/contacts", (req, res) => {
  res.json(readContacts());
});

// ADD CONTACT
app.post("/contacts", (req, res) => {
  const contacts = readContacts();

  const newContact = {
    id: uuidv4(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    tag: req.body.tag
  };

  contacts.push(newContact);
  writeContacts(contacts);

  res.json(newContact);
});

// DELETE CONTACT
app.delete("/contacts/:id", (req, res) => {
  let contacts = readContacts();

  contacts = contacts.filter(c => c.id !== req.params.id);

  writeContacts(contacts);

  res.json({ message: "Deleted successfully" });
});

// SEARCH CONTACT
app.get("/search", (req, res) => {
  const query = req.query.q.toLowerCase();
  const contacts = readContacts();

  const result = contacts.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query) ||
    c.phone.includes(query)
  );

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});