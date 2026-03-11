// Determine API base URL. If the app is opened via file://, fall back to localhost.
const API = (window.location && window.location.origin && window.location.origin !== "null")
  ? window.location.origin
  : "http://localhost:3000";

function loadContacts(){
  // Reset search input when loading the full list
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.value = "";
  }

  fetch(API + "/contacts")
    .then(res => res.json())
    .then(data => {
      displayContacts(data);
    })
    .catch(err => console.error(err));
}

function displayContacts(contacts){
  const list = document.getElementById("contactList");
  list.innerHTML = "";

  if (!contacts || contacts.length === 0) {
    const empty = document.createElement("li");
    empty.className = "contact";
    empty.innerHTML = "<p>No contacts found. Add a contact or adjust your search.</p>";
    list.appendChild(empty);
    return;
  }

  contacts.forEach(c => {
    const tagClass = c.tag && c.tag.toLowerCase().includes("client") ? "client" : "friend";
    const tagLabel = c.tag ? c.tag : "Unspecified";

    const li = document.createElement("li");
    li.className = "contact";

    li.innerHTML = `
      <div class="contact-header">
        <p class="contact-name">${c.name}</p>
        <span class="badge ${tagClass}">${tagLabel}</span>
      </div>
      <div class="contact-details">
        <div><strong>Email:</strong> ${c.email || "—"}</div>
        <div><strong>Phone:</strong> ${c.phone || "—"}</div>
      </div>
      <div class="contact-actions">
        <button class="secondary" onclick="deleteContact('${c.id}')">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function addContact(){
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const tag = document.getElementById("tag").value.trim();

  if (!name || !email) {
    alert("Please enter at least a name and an email.");
    return;
  }

  fetch(API + "/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, tag })
  })
    .then(res => res.json())
    .then(() => {
      // Clear form
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("tag").value = "";
      loadContacts();
    })
    .catch(err => console.error(err));
}

function deleteContact(id){
  fetch(API + "/contacts/" + id, {
    method: "DELETE"
  })
    .then(() => loadContacts())
    .catch(err => console.error(err));
}

function searchContact(){
  const q = document.getElementById("search").value.trim();

  if (!q) {
    loadContacts();
    return;
  }

  fetch(API + "/search?q=" + encodeURIComponent(q))
    .then(res => res.json())
    .then(data => displayContacts(data))
    .catch(err => console.error(err));
}

// Support pressing Enter in the search input.
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchContact();
      }
    });
  }
});

loadContacts();