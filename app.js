// FALLBACK IMAGE HANDLER
const DEFAULT_PET_IMG = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80";

function handleImageError(imgElement) {
  imgElement.onerror = null;
  imgElement.src = DEFAULT_PET_IMG;
}

// CONTACT PAWBOOK EMAIL LAUNCHER
function openContactEmailApp() {
  window.open("mailto:alfonsosanta7448@gmail.com?subject=Pawbook%20Inquiry%20or%20Feedback", "_blank");
}

// PASSWORD VISIBILITY TOGGLE (EYE ICON)
function togglePasswordVisibility(inputId, iconElem) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    iconElem.setAttribute("data-lucide", "eye-off");
  } else {
    input.type = "password";
    iconElem.setAttribute("data-lucide", "eye");
  }
  if (window.lucide) window.lucide.createIcons();
}

// STRICT PASSWORD VALIDATION (EXACTLY 8 CHARS, 1 UPPERCASE, 1 SPECIAL CHAR)
function validatePasswordStrength() {
  const password = document.getElementById("regPassword")?.value || "";
  const confirmPassword = document.getElementById("regConfirmPassword")?.value || "";
  const ruleError = document.getElementById("passwordRuleError");
  const matchError = document.getElementById("passwordMatchError");
  const submitBtn = document.getElementById("completeRegBtn");

  let isValid = true;

  // Exact 8 chars, 1 uppercase, 1 special char
  const lengthValid = password.length === 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!lengthValid || !hasUppercase || !hasSpecial) {
    ruleError.textContent = "Password must be EXACTLY 8 characters long, contain at least 1 uppercase letter and 1 special character.";
    isValid = false;
  } else {
    ruleError.textContent = "";
  }

  if (confirmPassword && password !== confirmPassword) {
    matchError.textContent = "Passwords do not match!";
    isValid = false;
  } else {
    matchError.textContent = "";
  }

  if (submitBtn) {
    submitBtn.disabled = !(isValid && lengthValid && hasUppercase && hasSpecial && (password === confirmPassword));
  }
}

// REGISTRATION STATE DATA
let pendingRegistrationData = {};

function previewRegisterPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("regPhotoPreviewImg").src = e.target.result;
      document.getElementById("regPhotoPreviewContainer").classList.remove("hidden");
      pendingRegistrationData.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function handleRegisterStep1(event) {
  event.preventDefault();

  if (!pendingRegistrationData.avatar) {
    alert("Please upload a picture of your pet to continue!");
    return;
  }

  pendingRegistrationData.name = document.getElementById("regPetName").value.trim();
  pendingRegistrationData.species = document.getElementById("regPetSpecies").value;
  pendingRegistrationData.breed = document.getElementById("regPetBreed").value.trim();
  pendingRegistrationData.bio = document.getElementById("regPetBio").value.trim();
  pendingRegistrationData.handle = `@${pendingRegistrationData.name.toLowerCase().replace(/\s+/g, '')}`;

  document.getElementById("registerPetStep1Form").classList.add("hidden");
  document.getElementById("registerEmailStepForm").classList.remove("hidden");
}

function handleSendEmailVerification(event) {
  event.preventDefault();
  const email = document.getElementById("regOwnerEmail").value.trim();
  pendingRegistrationData.email = email;

  document.getElementById("pendingEmailDisplay").textContent = email;
  document.getElementById("registerEmailStepForm").classList.add("hidden");
  document.getElementById("emailVerificationPendingScreen").classList.remove("hidden");
}

function simulateClickEmailVerificationLink() {
  document.getElementById("emailVerificationPendingScreen").classList.add("hidden");
  document.getElementById("registerPasswordStepForm").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function handleCompleteRegistration(event) {
  event.preventDefault();

  const newUser = {
    name: pendingRegistrationData.name,
    handle: pendingRegistrationData.handle,
    breed: pendingRegistrationData.breed,
    bio: pendingRegistrationData.bio,
    species: pendingRegistrationData.species,
    email: pendingRegistrationData.email,
    avatar: pendingRegistrationData.avatar,
    city: "Norwalk",
    gender: "Female",
    birthday: "",
    verified: false,
    pals: 0,
    pawsts: 0,
    boops: 0
  };

  localStorage.setItem("pawbook_current_user", JSON.stringify(newUser));

  // Initialize UI with zero state and user's profile picture
  document.getElementById("sidebarPetName").textContent = newUser.name;
  document.getElementById("sidebarBreed").textContent = `${newUser.breed} • Female`;
  document.getElementById("sidebarBio").textContent = newUser.bio;
  document.getElementById("navPetName").textContent = newUser.name;

  if (document.getElementById("navAvatar")) document.getElementById("navAvatar").src = newUser.avatar;
  if (document.getElementById("sidebarAvatar")) document.getElementById("sidebarAvatar").src = newUser.avatar;
  if (document.getElementById("composerAvatar")) document.getElementById("composerAvatar").src = newUser.avatar;

  document.getElementById("statPalsVal").textContent = "0";
  document.getElementById("statPawstsVal").textContent = "0";
  document.getElementById("statBoopsVal").textContent = "0";

  enterApp();
}

// REQUEST WEB NOTIFICATIONS
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function sendPushNotification(title, message, icon) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: icon || DEFAULT_PET_IMG
    });
  }
}

// NOTIFICATIONS STATE
const userNotifications = [
  {
    id: 1,
    type: "friend_request",
    senderName: "Barnaby the Cat",
    senderAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&auto=format&fit=crop&q=80",
    text: "sent you a friend request.",
    isRead: false
  }
];

// GLOBAL EVENT LISTENER FOR DISMISSING DROPDOWNS
document.addEventListener("click", (event) => {
  const notifWrapper = document.querySelector(".notifications-wrapper");
  const notifDropdown = document.getElementById("notifDropdown");

  if (notifWrapper && notifDropdown && !notifWrapper.contains(event.target)) {
    notifDropdown.classList.add("hidden");
  }

  const profileWrapper = document.querySelector(".profile-settings-wrapper");
  const profileDropdown = document.getElementById("profileMenuDropdown");

  if (profileWrapper && profileDropdown && !profileWrapper.contains(event.target)) {
    profileDropdown.classList.add("hidden");
  }
});

// INITIAL SEED POSTS
const initialPosts = [
  {
    id: 1,
    author: "Barnaby the Cat",
    handle: "@barnaby_cat",
    species: "Cat",
    avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80",
    activity: "😴 Napping",
    timeAgo: "2 hours ago",
    content: "Caught the sunbeam right on time today. Peak nap efficiency unlocked.",
    mediaUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    boops: 24,
    hasBooped: false,
    comments: []
  }
];

const allRegisteredUsers = [
  { id: 1, name: "Barnaby the Cat", handle: "@barnabythecat", breed: "Tuxedo Cat", species: "Cat", city: "Norwalk", bio: "Sunbeam lover and treats expert.", gender: "Male", verified: true, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80" },
  { id: 2, name: "Rio", handle: "@rio_macaw", breed: "Macaw", species: "Bird", city: "Downey", bio: "Loud, colorful, and loves sunflower seeds.", gender: "Male", verified: false, image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&auto=format&fit=crop&q=80" },
  { id: 3, name: "Cooper", handle: "@cooper_golden", breed: "Golden Retriever", species: "Dog", city: "Norwalk", bio: "Always down for park zoomies!", gender: "Male", verified: true, image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&auto=format&fit=crop&q=80" },
  { id: 4, name: "Bella", handle: "@bella_lab", breed: "Labrador Mix", species: "Dog", city: "Santa Fe Springs", bio: "Rescued pup who loves swimming.", gender: "Female", verified: false, image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80" }
];

const myPackList = [];

const initialParks = [
  {
    id: 1,
    title: "Norwalk Dog Park & Open Lawn",
    hostName: "City of Norwalk",
    hostAvatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80",
    location: "Norwalk, CA",
    mapUrl: "https://maps.google.com/?q=Norwalk+Dog+Park",
    dateTime: "Open Daily • 6:00 AM - 9:00 PM",
    energy: "⚡ All Energy Levels",
    attendees: 14,
    isAttending: false
  }
];

let activeFilter = 'All';
let selectedMediaUrl = null;
let selectedMediaType = 'image';

// APP STARTUP
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  renderPosts();
  renderNotifications();
  renderSuggestedPalsAlgorithm();
  checkBirthdayCelebration();
  if (window.lucide) window.lucide.createIcons();
});

function checkBirthdayCelebration() {
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user"));
  if (!currentUser || !currentUser.birthday) return;

  const today = new Date().toISOString().split('T')[0];
  const isBirthday = currentUser.birthday === today || currentUser.birthday.slice(5) === today.slice(5);

  const hatNav = document.getElementById("navBirthdayHat");
  const hatSidebar = document.getElementById("sidebarBirthdayHat");

  if (isBirthday) {
    hatNav?.classList.remove("hidden");
    hatSidebar?.classList.remove("hidden");
  } else {
    hatNav?.classList.add("hidden");
    hatSidebar?.classList.add("hidden");
  }
}

// EDIT PROFILE MODAL
function openEditProfileModal() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
  document.getElementById("editProfileName").value = user.name || "";
  document.getElementById("editProfileHandle").value = user.handle || "@luna_golden";
  document.getElementById("editProfileBio").value = user.bio || "";
  document.getElementById("editProfileLinks").value = user.links || "";
  document.getElementById("editProfileGender").value = user.gender || "Female";
  document.getElementById("editProfileBirthday").value = user.birthday || "";
  document.getElementById("editProfileInfluencer").checked = user.verified || false;

  document.getElementById("editProfileModal")?.classList.remove("hidden");
  toggleProfileMenu();
}

function closeEditProfileModal() {
  document.getElementById("editProfileModal")?.classList.add("hidden");
}

function saveProfileEdits() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
  user.name = document.getElementById("editProfileName").value;
  user.bio = document.getElementById("editProfileBio").value;
  user.links = document.getElementById("editProfileLinks").value;
  user.gender = document.getElementById("editProfileGender").value;
  user.birthday = document.getElementById("editProfileBirthday").value;
  user.verified = document.getElementById("editProfileInfluencer").checked;

  localStorage.setItem("pawbook_current_user", JSON.stringify(user));
  loadFromLocalStorage();
  checkBirthdayCelebration();
  closeEditProfileModal();
}

function openShareProfileModal() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna", handle: "@luna_golden" };
  document.getElementById("shareProfileHeadline").textContent = `Check out ${user.name} on Pawbook! 🐾`;
  document.getElementById("shareProfileLinkInput").value = `https://alfonsosanta.github.io/Pawbook/profile?user=${encodeURIComponent(user.handle)}`;

  document.getElementById("shareProfileModal")?.classList.remove("hidden");
  toggleProfileMenu();
}

function closeShareProfileModal() {
  document.getElementById("shareProfileModal")?.classList.add("hidden");
}

function copyShareProfileLink() {
  const input = document.getElementById("shareProfileLinkInput");
  input.select();
  navigator.clipboard.writeText(input.value);
  alert("Profile link copied to clipboard! Share it with your friends 🐾");
}

// COMMENTS LOGIC
function addComment(postId) {
  const inputElem = document.getElementById(`commentInput-${postId}`);
  const text = inputElem.value.trim();
  if (!text) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna", avatar: DEFAULT_PET_IMG };
  const post = initialPosts.find(p => p.id === postId);

  if (post) {
    if (!post.comments) post.comments = [];
    post.comments.push({
      author: currentUser.name,
      avatar: currentUser.avatar || DEFAULT_PET_IMG,
      text: text
    });

    if (post.author !== currentUser.name) {
      userNotifications.unshift({
        id: Date.now(),
        type: "comment",
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || DEFAULT_PET_IMG,
        text: `commented on your pawst: "${text}"`,
        isRead: false
      });
      sendPushNotification("New Comment! 🐾", `${currentUser.name} commented on your pawst.`, currentUser.avatar);
    }

    inputElem.value = "";
    saveToLocalStorage();
    renderPosts();
    renderNotifications();
  }
}

function sendBoopNose(petName, buttonElem) {
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna" };
  
  if (buttonElem) {
    buttonElem.classList.add("boop-animation");
    buttonElem.textContent = "Booped! 🐾";
    setTimeout(() => buttonElem.classList.remove("boop-animation"), 400);
  }

  userNotifications.unshift({
    id: Date.now(),
    type: "boop",
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar || DEFAULT_PET_IMG,
    text: `booped your nose! 🐾🐽`,
    isRead: false
  });

  renderNotifications();
  sendPushNotification("Nose Boop Alert! 🐾", `${currentUser.name} gave ${petName} a playful nose boop!`, currentUser.avatar);
}

function acceptFriendRequest(petName, buttonElement) {
  const user = allRegisteredUsers.find(u => u.name.toLowerCase().includes(petName.toLowerCase())) || {
    name: petName,
    handle: `@${petName.toLowerCase().replace(/\s+/g, '')}`,
    breed: "Pet Friend",
    image: DEFAULT_PET_IMG,
    city: "Norwalk"
  };

  if (!myPackList.some(p => p.name === user.name)) {
    myPackList.push(user);
    updatePalsCount(1);
    saveToLocalStorage();
  }

  if (buttonElement) {
    buttonElement.textContent = "Accepted ✓";
    buttonElement.disabled = true;
  }
}

function removePetPal(petName) {
  const user = myPackList.find(p => p.name.toLowerCase() === petName.toLowerCase());
  const handle = user?.handle || `@${petName.toLowerCase().replace(/\s+/g, '')}`;

  if (confirm(`Are you sure you'd like to remove ${petName} (${handle}) from your pack?`)) {
    const index = myPackList.findIndex(p => p.name.toLowerCase() === petName.toLowerCase());
    if (index !== -1) {
      myPackList.splice(index, 1);
      updatePalsCount(-1);
      saveToLocalStorage();
      renderMyPack();
      closePetProfileModal();
    }
  }
}

function updatePalsCount(increment) {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || { pals: 0 };
  user.pals = Math.max(0, (user.pals || 0) + increment);
  localStorage.setItem("pawbook_current_user", JSON.stringify(user));

  const palsElem = document.getElementById("statPalsVal");
  if (palsElem) palsElem.textContent = user.pals;
}

function openPetProfile(petName) {
  const user = allRegisteredUsers.find(u => u.name.toLowerCase() === petName.toLowerCase() || u.handle.toLowerCase() === petName.toLowerCase()) || {
    name: petName,
    handle: `@${petName.toLowerCase().replace(/\s+/g, '')}`,
    breed: "Furry Friend",
    city: "Norwalk",
    bio: "Active Pawbook member!",
    verified: false,
    image: DEFAULT_PET_IMG
  };

  document.getElementById("modalPetTitle").textContent = `${user.name}'s Profile`;
  document.getElementById("modalPetAvatar").src = user.image;
  document.getElementById("modalPetName").innerHTML = `${user.name} ${user.verified ? '<span class="verified-badge">🍬</span>' : ''}`;
  document.getElementById("modalPetHandle").textContent = user.handle;
  document.getElementById("modalPetBio").textContent = user.bio;
  document.getElementById("modalPetBreed").textContent = user.breed;
  document.getElementById("modalPetCity").textContent = user.city;
  document.getElementById("modalPetLinks").innerHTML = user.links ? `<a href="${user.links}" target="_blank" style="color:var(--primary-hover);">${user.links}</a>` : '';

  const actionWrapper = document.getElementById("modalFriendActionWrapper");
  const isFriend = myPackList.some(p => p.name === user.name);

  if (isFriend) {
    actionWrapper.innerHTML = `
      <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
        <button class="btn btn-outline btn-sm" onclick="sendBoopNose('${user.name}', this)">🐾 Boop Nose</button>
        <button class="btn btn-danger-outline btn-sm" onclick="removePetPal('${user.name}')">Remove Pal ✕</button>
      </div>
    `;
  } else {
    actionWrapper.innerHTML = `
      <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
        <button class="btn btn-primary btn-sm" onclick="acceptFriendRequest('${user.name}', this); openPetProfile('${user.name}');">+ Add Pal 🐾</button>
        <button class="btn btn-outline btn-sm" onclick="sendBoopNose('${user.name}', this)">🐾 Boop Nose</button>
      </div>
    `;
  }

  const postsContainer = document.getElementById("modalPetPostsContainer");
  const petPosts = initialPosts.filter(p => p.author.toLowerCase().includes(user.name.toLowerCase()));

  postsContainer.innerHTML = petPosts.length > 0 
    ? petPosts.map(p => renderSinglePostHTML(p)).join('') 
    : `<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px;">No pawsts published yet.</p>`;

  document.getElementById("petProfileModal")?.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closePetProfileModal() {
  document.getElementById("petProfileModal")?.classList.add("hidden");
}

function handleSearch(query) {
  const dropdown = document.getElementById("searchResultsDropdown");
  const q = query.trim().toLowerCase();

  if (!q) {
    dropdown.classList.add("hidden");
    return;
  }

  const matchingUsers = allRegisteredUsers.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.handle.toLowerCase().includes(q) ||
    u.breed.toLowerCase().includes(q)
  );

  dropdown.innerHTML = matchingUsers.length > 0 
    ? matchingUsers.map(u => `
        <div class="search-item" onclick="openPetProfile('${u.name}'); document.getElementById('searchResultsDropdown').classList.add('hidden');">
          <strong>${u.name}</strong>
          <span style="color:var(--text-muted);">${u.handle}</span>
        </div>
      `).join('')
    : `<div class="search-item" style="color:var(--text-muted);">No matching pet found</div>`;

  dropdown.classList.remove("hidden");
}

function renderMyPack() {
  const container = document.getElementById("myPackContainer");
  if (!container) return;

  if (myPackList.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; padding: 30px;"><p style="color: var(--text-muted);">You haven't added any pals to your pack yet!</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="pack-grid">
      ${myPackList.map(pal => `
        <div class="card pack-card">
          <img src="${pal.image}" alt="${pal.name}" onerror="handleImageError(this)">
          <h4>${pal.name}</h4>
          <span>${pal.breed}</span>
          <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
            <button class="btn btn-outline btn-sm full-width" onclick="openPetProfile('${pal.name}')">View Profile</button>
            <button class="btn btn-secondary btn-sm full-width" onclick="sendBoopNose('${pal.name}', this)">🐾 Boop Nose</button>
            <button class="btn btn-danger-outline btn-sm full-width" onclick="removePetPal('${pal.name}')">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function handleMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type.startsWith("video/")) {
    const videoElem = document.createElement("video");
    videoElem.src = URL.createObjectURL(file);
    videoElem.onloadedmetadata = () => {
      if (videoElem.duration > 10.5) {
        alert("Videos must be 10 seconds or shorter! Please upload a shorter clip.");
        event.target.value = "";
        selectedMediaUrl = null;
      } else {
        selectedMediaType = "video";
        const reader = new FileReader();
        reader.onload = (e) => selectedMediaUrl = e.target.result;
        reader.readAsDataURL(file);
        document.getElementById("mediaPreviewName").textContent = `Selected video: ${file.name} (✓ <10s)`;
      }
    };
  } else {
    selectedMediaType = "image";
    const reader = new FileReader();
    reader.onload = (e) => selectedMediaUrl = e.target.result;
    reader.readAsDataURL(file);
    document.getElementById("mediaPreviewName").textContent = `Selected photo: ${file.name}`;
  }
}

function publishPost() {
  const captionInput = document.getElementById("postCaptionInput");
  const activitySelect = document.getElementById("activitySelect");
  const caption = captionInput.value.trim();

  if (!caption && !selectedMediaUrl) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna the Golden", avatar: DEFAULT_PET_IMG };

  const newPost = {
    id: Date.now(),
    author: currentUser.name,
    handle: `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
    species: currentUser.species || "Dog",
    avatar: currentUser.avatar || DEFAULT_PET_IMG,
    activity: activitySelect.value,
    timeAgo: "Just now",
    content: caption,
    mediaUrl: selectedMediaUrl,
    mediaType: selectedMediaType,
    boops: 0,
    hasBooped: false,
    comments: []
  };

  const mentions = caption.match(/@\w+/g);
  if (mentions) {
    mentions.forEach(mention => {
      userNotifications.unshift({
        id: Date.now(),
        type: "mention",
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || DEFAULT_PET_IMG,
        text: `tagged you in a pawst: "${caption.slice(0, 30)}..."`,
        isRead: false
      });
      sendPushNotification("You were tagged! 🐾", `${currentUser.name} tagged ${mention} in a new pawst.`, currentUser.avatar);
    });
  }

  initialPosts.unshift(newPost);
  captionInput.value = "";
  selectedMediaUrl = null;
  document.getElementById("mediaPreviewName").textContent = "";

  currentUser.pawsts = (currentUser.pawsts || 0) + 1;
  localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));
  const pawstElem = document.getElementById("statPawstsVal");
  if (pawstElem) pawstElem.textContent = currentUser.pawsts;

  saveToLocalStorage();
  renderPosts();
  renderNotifications();
}

function formatMentionsInText(text) {
  return text.replace(/@\w+/g, match => `<span class="mention-tag" onclick="openPetProfile('${match.replace('@', '')}')">${match}</span>`);
}

function renderSinglePostHTML(post) {
  let mediaHtml = '';
  if (post.mediaUrl) {
    if (post.mediaType === 'video') {
      mediaHtml = `<video src="${post.mediaUrl}" controls class="post-media"></video>`;
    } else {
      mediaHtml = `<img src="${post.mediaUrl}" class="post-media" alt="Post media" onerror="handleImageError(this)">`;
    }
  }

  return `
    <div class="card post-card" id="post-${post.id}">
      <div class="post-header">
        <img src="${post.avatar}" class="post-avatar" alt="${post.author}" onerror="handleImageError(this)" onclick="openPetProfile('${post.author}')" style="cursor:pointer;">
        <div class="post-meta">
          <h4 onclick="openPetProfile('${post.author}')" style="cursor:pointer;">${post.author} • <span style="color:var(--primary); font-weight:600;">${post.activity}</span></h4>
          <span>${post.timeAgo}</span>
        </div>
      </div>
      <p class="post-content">${formatMentionsInText(post.content)}</p>
      ${mediaHtml}
      <div class="post-actions">
        <button class="action-link ${post.hasBooped ? 'booped' : ''}" onclick="toggleBoop(${post.id})">
          <i data-lucide="heart"></i> <span>${post.boops} Boops</span>
        </button>
        <button class="action-link" onclick="sendBoopNose('${post.author}', this)"><i data-lucide="smile"></i> Boop Nose</button>
        <button class="action-link" onclick="openShareModal(${post.id})"><i data-lucide="share-2"></i> Share</button>
      </div>

      <div class="comments-section">
        <div class="comment-list">
          ${(post.comments || []).map(c => `
            <div class="comment-item">
              <img src="${c.avatar}" alt="${c.author}" onerror="handleImageError(this)">
              <div class="comment-body">
                <span class="comment-author" onclick="openPetProfile('${c.author}')">${c.author}</span>
                <p style="margin-top:2px;">${c.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="comment-input-row">
          <input type="text" id="commentInput-${post.id}" class="comment-input" placeholder="Write a comment..." onkeydown="if(event.key === 'Enter') addComment(${post.id})">
          <button class="btn btn-primary btn-sm" onclick="addComment(${post.id})">Reply</button>
        </div>
      </div>
    </div>
  `;
}

function renderNotifications() {
  const container = document.getElementById("notifListContainer");
  const badge = document.getElementById("notifBadge");
  if (!container) return;

  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  container.innerHTML = userNotifications.length > 0 
    ? userNotifications.map(n => `
        <div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="markNotificationsRead()">
          <img src="${n.senderAvatar}" alt="${n.senderName}" onerror="handleImageError(this)">
          <div style="flex:1;">
            <strong>${n.senderName}</strong> ${n.text}
            ${n.type === 'friend_request' ? `
              <div style="margin-top: 6px;">
                <button class="btn btn-primary btn-sm" onclick="acceptFriendRequest('${n.senderName}', this)">Accept 🐾</button>
              </div>` : ''}
          </div>
        </div>
      `).join('')
    : `<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 12px;">No new notifications</p>`;
}

function toggleNotifications(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("notifDropdown");
  dropdown?.classList.toggle("hidden");
}

function markNotificationsRead() {
  userNotifications.forEach(n => n.isRead = true);
  renderNotifications();
  document.getElementById("notifDropdown")?.classList.add("hidden");
}

function renderPosts() {
  const container = document.getElementById("postsFeed");
  if (!container) return;

  const filtered = activeFilter === 'All' 
    ? initialPosts 
    : initialPosts.filter(p => p.species.toLowerCase() === activeFilter.toLowerCase());

  container.innerHTML = filtered.map(post => renderSinglePostHTML(post)).join("");
  if (window.lucide) window.lucide.createIcons();
}

function toggleBoop(postId) {
  const post = initialPosts.find(p => p.id === postId);
  if (post) {
    post.hasBooped = !post.hasBooped;
    post.boops += post.hasBooped ? 1 : -1;

    const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
    if (post.author === currentUser.name) {
      currentUser.boops = (currentUser.boops || 0) + (post.hasBooped ? 1 : -1);
      localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));
      const boopElem = document.getElementById("statBoopsVal");
      if (boopElem) boopElem.textContent = currentUser.boops;
    }

    saveToLocalStorage();
    renderPosts();
  }
}

function filterSpecies(species) {
  activeFilter = species;
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.includes(species) || (species === 'All' && btn.textContent === 'All Pets'));
  });
  renderPosts();
}

function renderParks() {
  const container = document.getElementById("playdatesFeed");
  if (!container) return;

  container.innerHTML = initialParks.map(park => `
    <div class="card playdate-card">
      <div class="playdate-top">
        <div class="playdate-host">
          <img src="${park.hostAvatar}" alt="${park.hostName}" onerror="handleImageError(this)">
          <div>
            <h4>${park.title}</h4>
            <span style="font-size: 12px; color: var(--text-muted);">${park.hostName}</span>
          </div>
        </div>
        <span class="playdate-badge">${park.energy}</span>
      </div>

      <div class="playdate-details">
        <span>📍 <strong>Location:</strong> ${park.location} &nbsp;<a href="${park.mapUrl}" target="_blank" style="color: var(--primary); text-decoration: underline; font-size: 12px;">Get Directions 🗺️</a></span>
        <span>📅 <strong>Hours:</strong> ${park.dateTime}</span>
      </div>

      <div class="playdate-footer">
        <span class="attendees-preview">🐾 <strong>${park.attendees} pets</strong> visiting today</span>
        <button class="btn ${park.isAttending ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="toggleParkRSVP(${park.id})">
          ${park.isAttending ? '✓ Going!' : 'Visit Park 🐾'}
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function toggleParkRSVP(id) {
  const item = initialParks.find(p => p.id === id);
  if (item) {
    item.isAttending = !item.isAttending;
    item.attendees += item.isAttending ? 1 : -1;
    saveToLocalStorage();
    renderParks();
  }
}

// STORAGE PERSISTENCE
function saveToLocalStorage() {
  localStorage.setItem("pawbook_posts", JSON.stringify(initialPosts));
  localStorage.setItem("pawbook_parks", JSON.stringify(initialParks));
  localStorage.setItem("pawbook_mypack", JSON.stringify(myPackList));
}

function loadFromLocalStorage() {
  const savedPosts = localStorage.getItem("pawbook_posts");
  if (savedPosts) {
    const parsed = JSON.parse(savedPosts);
    initialPosts.length = 0;
    initialPosts.push(...parsed);
  }

  const savedParks = localStorage.getItem("pawbook_parks");
  if (savedParks) {
    const parsed = JSON.parse(savedParks);
    initialParks.length = 0;
    initialParks.push(...parsed);
  }

  const savedPack = localStorage.getItem("pawbook_mypack");
  if (savedPack) {
    const parsed = JSON.parse(savedPack);
    myPackList.length = 0;
    myPackList.push(...parsed);
  }

  const savedDarkMode = localStorage.getItem("pawbook_dark_mode") === "true";
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    const btnText = document.getElementById("darkModeBtnText");
    if (btnText) btnText.textContent = "Light Mode";
  }

  const savedUser = localStorage.getItem("pawbook_current_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (document.getElementById("sidebarPetName")) {
      document.getElementById("sidebarPetName").innerHTML = `${user.name} ${user.verified ? '<span class="verified-badge">🍬</span>' : ''}`;
    }
    if (document.getElementById("menuPetName")) document.getElementById("menuPetName").textContent = user.name;
    if (document.getElementById("sidebarBreed")) document.getElementById("sidebarBreed").textContent = `${user.breed || 'Pet'} • ${user.gender || 'Female'}`;
    if (document.getElementById("sidebarBio")) document.getElementById("sidebarBio").textContent = user.bio || "";
    if (document.getElementById("sidebarLinks")) {
      document.getElementById("sidebarLinks").innerHTML = user.links ? `<a href="${user.links}" target="_blank" style="color:var(--primary-hover);">${user.links}</a>` : '';
    }
    if (document.getElementById("navPetName")) document.getElementById("navPetName").textContent = user.name;
    
    const badgeNav = document.getElementById("navVerifiedBadge");
    const badgeSide = document.getElementById("sidebarVerifiedBadge");
    if (user.verified) {
      badgeNav?.classList.remove("hidden");
      badgeSide?.classList.remove("hidden");
    } else {
      badgeNav?.classList.add("hidden");
      badgeSide?.classList.add("hidden");
    }

    if (document.getElementById("statPalsVal")) document.getElementById("statPalsVal").textContent = user.pals !== undefined ? user.pals : 0;
    if (document.getElementById("statPawstsVal")) document.getElementById("statPawstsVal").textContent = user.pawsts !== undefined ? user.pawsts : 0;
    if (document.getElementById("statBoopsVal")) document.getElementById("statBoopsVal").textContent = user.boops !== undefined ? user.boops : 0;

    if (user.avatar) {
      if (document.getElementById("navAvatar")) document.getElementById("navAvatar").src = user.avatar;
      if (document.getElementById("sidebarAvatar")) document.getElementById("sidebarAvatar").src = user.avatar;
      if (document.getElementById("composerAvatar")) document.getElementById("composerAvatar").src = user.avatar;
    }
  }
}

// PROFILE MENU UTILITIES
function toggleProfileMenu() {
  document.getElementById("profileMenuDropdown")?.classList.toggle("hidden");
}

function triggerEditAvatar() {
  document.getElementById("avatarFileInput")?.click();
  toggleProfileMenu();
}

function uploadProfileAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newAvatarUrl = e.target.result;
      document.getElementById("navAvatar").src = newAvatarUrl;
      document.getElementById("sidebarAvatar").src = newAvatarUrl;
      document.getElementById("composerAvatar").src = newAvatarUrl;

      const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
      user.avatar = newAvatarUrl;
      localStorage.setItem("pawbook_current_user", JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  }
}

function switchAccounts() {
  toggleProfileMenu();
  exitToAuth();
}

function toggleHideAccount() {
  const statusElem = document.getElementById("menuPetStatus");
  const btnText = document.getElementById("hideAccText");

  if (statusElem.textContent.includes("Active")) {
    statusElem.textContent = "● Hidden (Private)";
    statusElem.style.color = "#f59e0b";
    btnText.textContent = "Unhide Account (Public)";
  } else {
    statusElem.textContent = "● Active";
    statusElem.style.color = "#10b981";
    btnText.textContent = "Hide Account (Public)";
  }
  toggleProfileMenu();
}

function deleteAccount() {
  if (confirm("Are you sure you want to delete your pet account? This will clear all saved local data.")) {
    localStorage.clear();
    location.reload();
  }
}

// SHARE PREVIEW MODAL LOGIC
function openShareModal(postId) {
  const post = initialPosts.find(p => p.id === postId);
  if (!post) return;

  const modal = document.getElementById("shareModal");
  const mediaContainer = document.getElementById("shareModalMediaContainer");
  const headline = document.getElementById("shareModalHeadline");
  const linkInput = document.getElementById("shareLinkInput");

  if (post.mediaType === 'video') {
    mediaContainer.innerHTML = `<video src="${post.mediaUrl}" controls class="share-modal-media"></video>`;
  } else {
    mediaContainer.innerHTML = `<img src="${post.mediaUrl || DEFAULT_PET_IMG}" class="share-modal-media" alt="Post media" onerror="handleImageError(this)">`;
  }

  headline.textContent = `Watch ${post.author}'s ${post.activity} on Pawbook! 🐾`;
  linkInput.value = `https://alfonsosanta.github.io/Pawbook/?post=${postId}&ref=${encodeURIComponent(post.author)}`;

  modal?.classList.remove("hidden");
}

function closeShareModal() {
  document.getElementById("shareModal")?.classList.add("hidden");
}

function copyShareLink() {
  const input = document.getElementById("shareLinkInput");
  input.select();
  navigator.clipboard.writeText(input.value);
  alert("Link copied to clipboard! Share it with friends to invite them to Pawbook 🐾");
}

function renderSuggestedPalsAlgorithm() {
  const container = document.getElementById("suggestedPalsList");
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { species: "Dog", city: "Norwalk" };

  const scored = allRegisteredUsers.map(user => {
    let score = 0;
    if (user.city.toLowerCase() === (currentUser.city || "norwalk").toLowerCase()) score += 50;
    if (user.species.toLowerCase() === (currentUser.species || "dog").toLowerCase()) score += 30;
    return { ...user, score };
  }).sort((a, b) => b.score - a.score);

  container.innerHTML = scored.slice(0, 3).map(pal => `
    <div class="pal-item">
      <img src="${pal.image}" alt="${pal.name}" onerror="handleImageError(this)">
      <div class="pal-info">
        <strong>${pal.name}</strong>
        <span>${pal.breed} • ${pal.city}</span>
      </div>
      <button class="btn btn-outline btn-sm add-pal-btn" onclick="sendFriendRequest(this, '${pal.name}')">+ Add</button>
    </div>
  `).join("");
}

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
  const register1 = document.getElementById("registerPetStep1Form");
  const registerEmail = document.getElementById("registerEmailStepForm");
  const registerPending = document.getElementById("emailVerificationPendingScreen");
  const registerPassword = document.getElementById("registerPasswordStepForm");

  const signInBtn = document.getElementById("signInTabBtn");
  const registerBtn = document.getElementById("registerTabBtn");

  if (formType === 'signin') {
    signInForm?.classList.remove("hidden");
    register1?.classList.add("hidden");
    registerEmail?.classList.add("hidden");
    registerPending?.classList.add("hidden");
    registerPassword?.classList.add("hidden");

    signInBtn?.classList.add("active");
    registerBtn?.classList.remove("active");
  } else {
    signInForm?.classList.add("hidden");
    register1?.classList.remove("hidden");
    registerEmail?.classList.add("hidden");
    registerPending?.classList.add("hidden");
    registerPassword?.classList.add("hidden");

    signInBtn?.classList.remove("active");
    registerBtn?.classList.add("active");
  }
}

function updateProfileStatus(newStatus) {
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Luna the Golden" };
  currentUser.status = newStatus;
  localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));
}

function switchMainTab(tabName) {
  document.getElementById("notifDropdown")?.classList.add("hidden");

  const feedTab = document.getElementById("feedViewTab");
  const parksTab = document.getElementById("parksViewTab");
  const packTab = document.getElementById("packViewTab");

  feedTab?.classList.add("hidden");
  parksTab?.classList.add("hidden");
  packTab?.classList.add("hidden");

  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach(t => t.classList.remove("active"));

  const menuFeed = document.getElementById("menuFeed");
  const menuParks = document.getElementById("menuParks");
  const menuPack = document.getElementById("menuPack");
  menuFeed?.classList.remove("active");
  menuParks?.classList.remove("active");
  menuPack?.classList.remove("active");

  if (tabName === "feed") {
    feedTab?.classList.remove("hidden");
    if (navTabs[0]) navTabs[0].classList.add("active");
    menuFeed?.classList.add("active");
  } else if (tabName === "parks") {
    parksTab?.classList.remove("hidden");
    if (navTabs[1]) navTabs[1].classList.add("active");
    menuParks?.classList.add("active");
    renderParks();
  } else if (tabName === "pack") {
    packTab?.classList.remove("hidden");
    menuPack?.classList.add("active");
    renderMyPack();
  }
}

function sendFriendRequest(buttonElement, petName) {
  const card = buttonElement.closest('.pal-item');
  if (!card) return;

  const envelope = document.createElement("div");
  envelope.className = "flying-envelope";
  envelope.innerHTML = "✉️";
  card.appendChild(envelope);

  buttonElement.textContent = "Request Sent ✓";
  buttonElement.disabled = true;

  acceptFriendRequest(petName);

  setTimeout(() => envelope.remove(), 800);
}