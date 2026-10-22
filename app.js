// DUMMY POSTS INITIAL DATA
const initialPosts = [
  {
    id: 1,
    author: "Barnaby",
    species: "Cat",
    avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&auto=format&fit=crop&q=80",
    activity: "😴 Napping",
    timeAgo: "2 hours ago",
    content: "Caught the sunbeam right on time today. Peak nap efficiency unlocked.",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
    boops: 24,
    hasBooped: false
  },
  {
    id: 2,
    author: "Luna the Golden",
    species: "Dog",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80",
    activity: "🎾 Fetch",
    timeAgo: "5 hours ago",
    content: "Human threw the ball 50 times! I brought it back EVERY SINGLE TIME!",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&auto=format&fit=crop&q=80",
    boops: 58,
    hasBooped: true
  }
];

// PLAYDATES DATA
const initialPlaydates = [
  {
    id: 1,
    title: "Weekend Golden Retriever Zoomies",
    hostName: "Luna the Golden",
    hostAvatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80",
    location: "Norwalk Dog Park, CA",
    mapUrl: "https://maps.google.com/?q=Norwalk+Dog+Park",
    dateTime: "Saturday, 10:00 AM",
    energy: "⚡ High Energy",
    attendees: 8,
    isAttending: false
  },
  {
    id: 2,
    title: "Small Dogs & Puppies Beach Social",
    hostName: "Milo Tuxedo",
    hostAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&auto=format&fit=crop&q=80",
    location: "Rosie's Dog Beach, Long Beach",
    mapUrl: "https://maps.google.com/?q=Rosies+Dog+Beach+Long+Beach",
    dateTime: "Sunday, 2:00 PM",
    energy: "🧘 Chill Sniffing & Swimming",
    attendees: 12,
    isAttending: true
  }
];

// RESCUES DATA
const rescuePets = [
  {
    id: 101,
    name: "Oliver",
    species: "Domestic Shorthair",
    age: "1.5 yrs",
    location: "Covina / Norwalk Area",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80",
    tags: ["Friendly", "Vaccinated", "Neutered", "Good with Cats"],
    bio: "Sweet, affectionate tabby who loves sunbeams, feather toys, and quiet cozy naps."
  },
  {
    id: 102,
    name: "Bella",
    species: "Labrador Mix",
    age: "2 yrs",
    location: "Downey Rescue Network",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80",
    tags: ["High Energy", "House Trained", "Loves Fetch"],
    bio: "Eager-to-please pup looking for an active family who loves park walks and playtime."
  }
];

let activeFilter = 'All';
let selectedImage = null;

// APP STARTUP
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  renderPosts();
  if (window.lucide) window.lucide.createIcons();
});

// AUTH CONTROL
function enterApp() {
  document.getElementById("authView")?.classList.add("hidden");
  document.getElementById("appView")?.classList.remove("hidden");
}

function exitToAuth() {
  document.getElementById("authView")?.classList.remove("hidden");
  document.getElementById("appView")?.classList.add("hidden");
}

function switchAuthForm(formType) {
  const signInForm = document.getElementById("signInForm");
  const registerForm = document.getElementById("registerPetForm");
  const signInBtn = document.getElementById("signInTabBtn");
  const registerBtn = document.getElementById("registerTabBtn");

  if (formType === 'signin') {
    signInForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");
    signInBtn?.classList.add("active");
    registerBtn?.classList.remove("active");
  } else {
    signInForm?.classList.add("hidden");
    registerForm?.classList.remove("hidden");
    signInBtn?.classList.remove("active");
    registerBtn?.classList.add("active");
  }
}

function handleRegisterPet(event) {
  event.preventDefault();
  const name = document.getElementById("regPetName").value;
  const breed = document.getElementById("regPetBreed").value || "Friendly Pet";
  const bio = document.getElementById("regPetBio").value || "Just joined Pawbook!";

  document.getElementById("sidebarPetName").textContent = name;
  document.getElementById("sidebarBreed").textContent = breed;
  document.getElementById("sidebarBio").textContent = bio;
  document.getElementById("navPetName").textContent = name;

  localStorage.setItem("pawbook_current_user", JSON.stringify({ name, breed, bio }));
  enterApp();
}

// TAB SWITCHER
function switchMainTab(tabName) {
  const feedTab = document.getElementById("feedViewTab");
  const playdatesTab = document.getElementById("playdatesViewTab");
  const rescuesTab = document.getElementById("rescuesViewTab");

  feedTab?.classList.add("hidden");
  playdatesTab?.classList.add("hidden");
  rescuesTab?.classList.add("hidden");

  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach(t => t.classList.remove("active"));

  if (tabName === "feed") {
    feedTab?.classList.remove("hidden");
    if (navTabs[0]) navTabs[0].classList.add("active");
  } else if (tabName === "playdates") {
    playdatesTab?.classList.remove("hidden");
    if (navTabs[1]) navTabs[1].classList.add("active");
    renderPlaydates();
  } else if (tabName === "rescues") {
    rescuesTab?.classList.remove("hidden");
    if (navTabs[2]) navTabs[2].classList.add("active");
    renderRescues();
  }
}

// FEED LOGIC
function renderPosts() {
  const container = document.getElementById("postsFeed");
  if (!container) return;

  const filtered = activeFilter === 'All' 
    ? initialPosts 
    : initialPosts.filter(p => p.species.toLowerCase() === activeFilter.toLowerCase());

  container.innerHTML = filtered.map(post => `
    <div class="card post-card">
      <div class="post-header">
        <img src="${post.avatar}" class="post-avatar" alt="${post.author}">
        <div class="post-meta">
          <h4>${post.author} • <span style="color:var(--primary); font-weight:600;">${post.activity}</span></h4>
          <span>${post.timeAgo}</span>
        </div>
      </div>
      <p class="post-content">${post.content}</p>
      ${post.image ? `<img src="\${post.image}" class="post-image" alt="Post content">` : ''}
      <div class="post-actions">
        <button class="action-link ${post.hasBooped ? 'booped' : ''}" onclick="toggleBoop(${post.id})">
          <i data-lucide="heart"></i> <span>${post.boops} Boops</span>
        </button>
        <button class="action-link"><i data-lucide="message-circle"></i> Comment</button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function toggleBoop(postId) {
  const post = initialPosts.find(p => p.id === postId);
  if (post) {
    post.hasBooped = !post.hasBooped;
    post.boops += post.hasBooped ? 1 : -1;
    saveToLocalStorage();
    renderPosts();
  }
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => selectedImage = e.target.result;
    reader.readAsDataURL(file);
  }
}

function publishPost() {
  const captionInput = document.getElementById("postCaptionInput");
  const activitySelect = document.getElementById("activitySelect");
  const caption = captionInput.value.trim();

  if (!caption && !selectedImage) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna the Golden" };

  const newPost = {
    id: Date.now(),
    author: currentUser.name,
    species: "Dog",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80",
    activity: activitySelect.value,
    timeAgo: "Just now",
    content: caption,
    image: selectedImage,
    boops: 1,
    hasBooped: true
  };

  initialPosts.unshift(newPost);
  captionInput.value = "";
  selectedImage = null;
  saveToLocalStorage();
  renderPosts();
}

function filterSpecies(species) {
  activeFilter = species;
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.includes(species) || (species === 'All' && btn.textContent === 'All Pets'));
  });
  renderPosts();
}

// PLAYDATES & RESCUES RENDER
function renderPlaydates() {
  const container = document.getElementById("playdatesFeed");
  if (!container) return;

  container.innerHTML = initialPlaydates.map(event => `
    <div class="card playdate-card">
      <div class="playdate-top">
        <div class="playdate-host">
          <img src="${event.hostAvatar}" alt="${event.hostName}">
          <div>
            <h4>${event.title}</h4>
            <span style="font-size: 12px; color: var(--text-muted);">Hosted by ${event.hostName}</span>
          </div>
        </div>
        <span class="playdate-badge">${event.energy}</span>
      </div>

      <div class="playdate-details">
        <span>📍 <strong>Location:</strong> ${event.location} &nbsp;<a href="${event.mapUrl}" target="_blank" style="color: var(--primary); text-decoration: underline; font-size: 12px;">Get Directions 🗺️</a></span>
        <span>📅 <strong>When:</strong> ${event.dateTime}</span>
      </div>

      <div class="playdate-footer">
        <span class="attendees-preview">🐾 <strong>${event.attendees} pets</strong> going</span>
        <button class="btn ${event.isAttending ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="toggleRSVP(${event.id})">
          ${event.isAttending ? '✓ Going!' : 'RSVP / Count Me In! 🐾'}
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function toggleRSVP(id) {
  const item = initialPlaydates.find(p => p.id === id);
  if (item) {
    item.isAttending = !item.isAttending;
    item.attendees += item.isAttending ? 1 : -1;
    saveToLocalStorage();
    renderPlaydates();
  }
}

function renderRescues() {
  const container = document.getElementById("rescuesFeed");
  if (!container) return;

  container.innerHTML = rescuePets.map(pet => `
    <div class="card rescue-card">
      <img src="${pet.image}" class="rescue-img" alt="${pet.name}">
      <div class="rescue-details">
        <div class="rescue-top">
          <h3>${pet.name} <span style="font-size: 13px; font-weight: normal; color: var(--text-muted);">• ${pet.species} (${pet.age})</span></h3>
          <p style="font-size: 13px; color: var(--text-main); margin-top: 4px;">${pet.bio}</p>
          <div class="rescue-tags">
            ${pet.tags.map(t => `<span class="tag-badge">\${t}</span>`).join('')}
          </div>
        </div>
        <div class="rescue-footer">
          <span style="font-size: 12px; color: var(--text-muted);">📍 ${pet.location}</span>
          <button class="btn btn-primary btn-sm" onclick="alert('Inquiry sent for ${pet.name}! 🐾')">Foster / Adopt 🐾</button>
        </div>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

// STORAGE PERSISTENCE
function saveToLocalStorage() {
  localStorage.setItem("pawbook_posts", JSON.stringify(initialPosts));
  localStorage.setItem("pawbook_playdates", JSON.stringify(initialPlaydates));
}

function loadFromLocalStorage() {
  const savedPosts = localStorage.getItem("pawbook_posts");
  if (savedPosts) {
    const parsed = JSON.parse(savedPosts);
    initialPosts.length = 0;
    initialPosts.push(...parsed);
  }

  const savedPlaydates = localStorage.getItem("pawbook_playdates");
  if (savedPlaydates) {
    const parsed = JSON.parse(savedPlaydates);
    initialPlaydates.length = 0;
    initialPlaydates.push(...parsed);
  }

  const savedUser = localStorage.getItem("pawbook_current_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (document.getElementById("sidebarPetName")) document.getElementById("sidebarPetName").textContent = user.name;
    if (document.getElementById("sidebarBreed")) document.getElementById("sidebarBreed").textContent = user.breed;
    if (document.getElementById("sidebarBio")) document.getElementById("sidebarBio").textContent = user.bio;
    if (document.getElementById("navPetName")) document.getElementById("navPetName").textContent = user.name;
  }
}