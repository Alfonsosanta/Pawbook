// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBZR1iIYF-g5LacT1ISPjuN5iCxF8ph0Ro",
  authDomain: "pawbook-347dc.firebaseapp.com",
  projectId: "pawbook-347dc",
  storageBucket: "pawbook-347dc.firebasestorage.app",
  messagingSenderId: "480909703355",
  appId: "1:480909703355:web:b28bacea911c2ad58dd19e",
  measurementId: "G-98L73TD0JL"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const DEFAULT_PET_IMG = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80";

function playCricketChirpSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    function chirp(delay) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(4800, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }, delay);
    }

    chirp(0);
    chirp(60);
    chirp(120);
  } catch (e) {
    console.log("Audio Context not allowed without interaction", e);
  }
}

// STRICT PET / ANIMAL IMAGE DETECTOR
function validateIsPetImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(img, 0, 0, 64, 64);
      
      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      let humanSkinPixels = 0;
      let monotoneOrLandscapePixels = 0;
      let totalPixels = 64 * 64;
      let colorBins = {};

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        colorBins[key] = (colorBins[key] || 0) + 1;

        if (r > 95 && g > 40 && b > 20 && Math.abs(r - g) > 15 && r > g && r > b) {
          humanSkinPixels++;
        }

        const isGray = Math.abs(r - g) < 12 && Math.abs(g - b) < 12;
        const isSkyBlue = b > r && b > g && b > 120;
        const isSnowWhite = r > 210 && g > 210 && b > 210;
        if (isGray || isSkyBlue || isSnowWhite) {
          monotoneOrLandscapePixels++;
        }
      }

      const skinRatio = humanSkinPixels / totalPixels;
      const monotoneRatio = monotoneOrLandscapePixels / totalPixels;
      const uniqueColorsCount = Object.keys(colorBins).length;

      const isMountainOrLandscape = (monotoneRatio > 0.65) || (uniqueColorsCount < 18 && monotoneRatio > 0.45);
      const isHuman = skinRatio > 0.40;

      if (isMountainOrLandscape || isHuman) {
        callback(false, e.target.result);
      } else {
        callback(true, e.target.result);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleImageError(imgElement) {
  imgElement.onerror = null;
  imgElement.src = DEFAULT_PET_IMG;
}

function openContactEmailApp() {
  window.location.href = "mailto:alfonsosanta7448@gmail.com?subject=Pawbook%20Inquiry%20or%20Feedback";
  toggleProfileMenu();
}

function openTermsModal() {
  document.getElementById("termsModal")?.classList.remove("hidden");
  const profileDropdown = document.getElementById("profileMenuDropdown");
  if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
    toggleProfileMenu();
  }
}

function closeTermsModal() {
  document.getElementById("termsModal")?.classList.add("hidden");
}

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

function validatePasswordStrength() {
  const password = document.getElementById("regPassword")?.value || "";
  const ruleError = document.getElementById("passwordRuleError");
  const submitBtn = document.getElementById("completeRegBtn");

  let isValid = true;
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasDigits = /\d/.test(password);

  if (!minLength || !hasUppercase || !hasSpecial || !hasDigits) {
    ruleError.textContent = "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 special character, and digits.";
    isValid = false;
  } else {
    ruleError.textContent = "";
  }

  if (submitBtn) {
    submitBtn.disabled = !isValid;
  }
}

let pendingRegistrationData = {};

function previewRegisterPhoto(event) {
  const file = event.target.files[0];
  const errorElem = document.getElementById("regPhotoError");
  if (!file) return;

  validateIsPetImage(file, (isPet, dataUrl) => {
    if (!isPet) {
      errorElem.textContent = "❌ Must be a pet image (no landscapes, mountains, or human pictures allowed)!";
      event.target.value = "";
      document.getElementById("regPhotoPreviewContainer").classList.add("hidden");
      pendingRegistrationData.avatar = null;
    } else {
      errorElem.textContent = "";
      document.getElementById("regPhotoPreviewImg").src = dataUrl;
      document.getElementById("regPhotoPreviewContainer").classList.remove("hidden");
      pendingRegistrationData.avatar = dataUrl;
    }
  });
}

function handleRegisterAccount(event) {
  event.preventDefault();

  if (!pendingRegistrationData.avatar) {
    alert("Please upload a valid picture of your pet to continue!");
    return;
  }

  const name = document.getElementById("regPetName").value.trim();
  const species = document.getElementById("regPetSpecies").value;
  const breed = document.getElementById("regPetBreed").value.trim();
  const bio = document.getElementById("regPetBio").value.trim();
  const email = document.getElementById("regOwnerEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.sendEmailVerification().then(() => {
        alert("✓ Verification email sent! Please check your inbox and verify your email before signing in.");
        
        const newUser = {
          name: name,
          handle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
          breed: breed,
          bio: bio,
          species: species,
          email: email,
          avatar: pendingRegistrationData.avatar,
          city: "Norwalk",
          gender: "Male",
          birthday: "",
          verified: false,
          pals: 0,
          pawsts: 0,
          boops: 0
        };

        // Save profile specific to this registered email address
        localStorage.setItem(`pawbook_user_${email}`, JSON.stringify(newUser));
        localStorage.setItem("pawbook_current_user", JSON.stringify(newUser));

        switchAuthForm('signin');
      });
    })
    .catch((error) => {
      alert("Registration Error: " + error.message);
    });
}

function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById("signInEmailInput").value.trim().toLowerCase();
  const password = document.getElementById("signInPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (!user.emailVerified) {
        alert("⚠️ Please verify your email address using the link sent to your inbox before logging in.");
        auth.signOut();
        return;
      }

      // Retrieve registered profile corresponding to signed-in email
      const savedUserProfile = localStorage.getItem(`pawbook_user_${email}`);
      if (savedUserProfile) {
        localStorage.setItem("pawbook_current_user", savedUserProfile);
      }

      loadFromLocalStorage();
      enterApp();
    })
    .catch((error) => {
      alert("Sign-in failed: " + error.message);
    });
}

function logOutUser() {
  auth.signOut().then(() => {
    exitToAuth();
  }).catch(() => {
    exitToAuth();
  });
}

let selectedLostPetPhoto = null;

function previewLostPetPhoto(event) {
  const file = event.target.files[0];
  const errorElem = document.getElementById("lostPhotoError");
  if (!file) return;

  validateIsPetImage(file, (isPet, dataUrl) => {
    if (!isPet) {
      errorElem.textContent = "❌ Must be a pet image (no landscapes, mountains, or human pictures allowed)!";
      event.target.value = "";
      document.getElementById("lostPhotoPreviewContainer").classList.add("hidden");
      selectedLostPetPhoto = null;
    } else {
      errorElem.textContent = "";
      selectedLostPetPhoto = dataUrl;
      document.getElementById("lostPhotoPreviewImg").src = dataUrl;
      document.getElementById("lostPhotoPreviewContainer").classList.remove("hidden");
    }
  });
}

// STUART LITTLE MISSING PET PLACEHOLDER
const initialLostPets = [
  {
    id: 1,
    name: "Stuart Little",
    location: "Norwalk, CA",
    radius: 3,
    phone: "(562) 555-0199",
    photo: "https://yourprops.com/movie_props/1999/Stuart-Little-1999/yp_50883_1.jpg",
    date: "2 hours ago"
  }
];

function handleCreateLostPetAlert(event) {
  event.preventDefault();
  if (!selectedLostPetPhoto) {
    alert("Please upload a valid picture of the lost pet to generate the flyer!");
    return;
  }

  const newAlert = {
    id: Date.now(),
    name: document.getElementById("lostPetName").value,
    location: document.getElementById("lostPetLocation").value,
    radius: document.getElementById("lostPetRadius").value,
    phone: document.getElementById("lostPetPhone").value,
    photo: selectedLostPetPhoto,
    date: "Just now"
  };

  initialLostPets.unshift(newAlert);
  saveToLocalStorage();
  renderLostPetsFeed();

  alert("🚨 Lost pet flyer created and broadcasted to local community!");
  event.target.reset();
  document.getElementById("lostPhotoPreviewContainer").classList.add("hidden");
  selectedLostPetPhoto = null;
}

function renderLostPetsFeed(filterCity = '') {
  const container = document.getElementById("lostPetsFeed");
  if (!container) return;

  const filtered = filterCity 
    ? initialLostPets.filter(p => p.location.toLowerCase().includes(filterCity.toLowerCase()))
    : initialLostPets;

  container.innerHTML = filtered.length > 0 
    ? filtered.map(item => `
        <div class="card lost-flyer-poster">
          <h2>
            <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Police%20car%20light/3D/police_car_light_3d.png" style="width: 32px; height: 32px;"> 
            MISSING PET FLYER 
            <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Police%20car%20light/3D/police_car_light_3d.png" style="width: 32px; height: 32px;">
          </h2>
          <img src="${item.photo}" style="width: 100%; max-height: 280px; object-fit: contain; border-radius: 12px; margin: 12px 0;" onerror="handleImageError(this)">
          <h3 style="font-size: 22px; font-family:'Fredoka', cursive;">Name: ${item.name}</h3>
          <p style="font-size: 14px; font-weight: 700; color: #dc2626; margin-top: 4px;">Last Seen Location: ${item.location}</p>
          <p style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">Contact Phone: ${item.phone}</p>

          <div style="background: white; padding: 12px; border-radius: 12px; border: 1px solid #fca5a5; text-align: left;">
            <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">🗺️ Search Radius (${item.radius} Miles):</h4>
            <iframe 
              width="100%" 
              height="180" 
              style="border:0; border-radius: 8px;" 
              loading="lazy" 
              src="https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&t=&z=${15 - parseInt(item.radius)}&ie=UTF8&iwloc=&output=embed">
            </iframe>
          </div>

          <button class="btn btn-primary full-width" style="margin-top: 12px;" onclick="window.print()">🖨️ Print / Download Lost Flyer</button>
        </div>
      `).join('')
    : `<div class="card" style="text-align: center; padding: 20px;"><p style="color: var(--text-muted);">No lost pet alerts in this city.</p></div>`;
}

function filterLostPetsByCity(city) {
  renderLostPetsFeed(city.trim());
}

const talentVideos = [
  {
    id: 1,
    title: "Sully Backflip Fetch! 🏆",
    petName: "Sully",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-dog-catches-a-ball-in-a-river-42751-large.mp4",
    votes: 42
  }
];

function getVotedTalentVideoId() {
  return localStorage.getItem("pawbook_voted_talent_id");
}

function renderTalentTab() {
  const container = document.getElementById("talentContainer");
  if (!container) return;

  const votedId = getVotedTalentVideoId();

  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; font-family: 'Fredoka', cursive; margin-bottom: 8px;">🎥 Submit Your Pet's Trick Video (<10s)</h3>
      <input type="file" accept="video/*" onchange="handleTalentVideoUpload(event)">
    </div>

    ${talentVideos.map(v => {
      const isVotedByMe = votedId == v.id;
      return `
        <div class="card post-card">
          <h4 style="font-family:'Fredoka', cursive; font-size: 18px; margin-bottom: 8px;">${v.title}</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Performer: <strong>${v.petName}</strong></p>
          <video src="${v.videoUrl}" controls class="post-media" style="max-height:280px;"></video>
          <div class="post-actions">
            <button class="btn ${isVotedByMe ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="voteTalentVideo(${v.id})">
              ${isVotedByMe ? '🏆 Voted ✓ (' + v.votes + ' Votes)' : '🏆 Vote for Talent (' + v.votes + ' Votes)'}
            </button>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

function voteTalentVideo(id) {
  const currentVotedId = getVotedTalentVideoId();

  if (currentVotedId && currentVotedId != id) {
    alert("You can only vote for ONE pet talent video! Remove your previous vote first.");
    return;
  }

  const item = talentVideos.find(v => v.id === id);
  if (!item) return;

  if (currentVotedId == id) {
    item.votes = Math.max(0, item.votes - 1);
    localStorage.removeItem("pawbook_voted_talent_id");
  } else {
    item.votes += 1;
    localStorage.setItem("pawbook_voted_talent_id", id.toString());
  }

  renderTalentTab();
}

function handleTalentVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const videoElem = document.createElement("video");
  videoElem.src = URL.createObjectURL(file);
  videoElem.onloadedmetadata = () => {
    if (videoElem.duration > 10.5) {
      alert("Talent videos must be 10 seconds or shorter!");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };
        talentVideos.unshift({
          id: Date.now(),
          title: `${currentUser.name}'s Amazing Trick! 🎉`,
          petName: currentUser.name,
          videoUrl: e.target.result,
          votes: 1
        });
        renderTalentTab();
      };
      reader.readAsDataURL(file);
    }
  };
}

const translations = {
  en: { tagline: "Where pets make pals, share zoomies, and get boops.", navFeed: "Feed", navMyProfile: "My Profile", navParks: "Parks Near Me", navPack: "My Pack", notifHeader: "Notifications", moodLabel: "CURRENT MOOD / STATUS", statPals: "Pals", statPawsts: "Pawsts", statBoops: "Boops", postBtn: "Pawst", filterLabel: "Filter Feed:", parksTitle: "Parks Near Me 🐾", parksSub: "Find local dog parks, running spots, and open lawns for your furry pals!" },
  es: { tagline: "Donde las mascotas hacen amigos y comparten momentos.", navFeed: "Inicio", navMyProfile: "Mi Perfil", navParks: "Parques", navPack: "Mi Manada", notifHeader: "Notificaciones", moodLabel: "ESTADO / ÁNIMO ACTUAL", statPals: "Amigos", statPawsts: "Publicaciones", statBoops: "Boops", postBtn: "Publicar", filterLabel: "Filtrar:", parksTitle: "Parques Cercanos 🐾", parksSub: "¡Encuentra parques para perros y áreas verdes locales!" }
};

function changeLanguage(langCode) {
  const dict = translations[langCode] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    if (dict[key]) {
      elem.textContent = dict[key];
    }
  });
  localStorage.setItem("pawbook_language", langCode);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  const btnText = document.getElementById("darkModeBtnText");
  if (btnText) {
    btnText.textContent = isDark ? "Light Mode" : "Dark Mode";
  }
  localStorage.setItem("pawbook_dark_mode", isDark);
}

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
    archived: false,
    hiddenByUsers: [],
    comments: [
      { author: "Sully", avatar: DEFAULT_PET_IMG, text: "Looking so cozy Barnaby!" }
    ]
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
let activeReportPostId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Ensure app always starts on the Auth view
  exitToAuth();

  loadFromLocalStorage();
  renderPosts();
  renderMyProfileGallery();
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

let pendingEditAvatarUrl = null;

function openEditProfileModal() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
  document.getElementById("editProfileName").value = user.name || "";
  document.getElementById("editProfileHandle").value = user.handle || "@sully";
  document.getElementById("editProfileBio").value = user.bio || "";
  document.getElementById("editProfileLinks").value = user.links || "";
  document.getElementById("editProfileGender").value = user.gender || "Male";
  document.getElementById("editProfileBirthday").value = user.birthday || "";
  document.getElementById("editProfileInfluencer").checked = user.verified || false;
  pendingEditAvatarUrl = null;
  document.getElementById("editPhotoError").textContent = "";

  document.getElementById("editProfileModal")?.classList.remove("hidden");
  toggleProfileMenu();
}

function closeEditProfileModal() {
  document.getElementById("editProfileModal")?.classList.add("hidden");
}

function previewEditProfilePhoto(event) {
  const file = event.target.files[0];
  const errorElem = document.getElementById("editPhotoError");
  if (!file) return;

  validateIsPetImage(file, (isPet, dataUrl) => {
    if (!isPet) {
      errorElem.textContent = "❌ Must be a pet image (no landscapes, mountains, or human pictures allowed)!";
      event.target.value = "";
      pendingEditAvatarUrl = null;
    } else {
      errorElem.textContent = "✓ Verified Pet Image!";
      pendingEditAvatarUrl = dataUrl;
    }
  });
}

function saveProfileEdits() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
  user.name = document.getElementById("editProfileName").value;
  user.bio = document.getElementById("editProfileBio").value;
  user.links = document.getElementById("editProfileLinks").value;
  user.gender = document.getElementById("editProfileGender").value;
  user.birthday = document.getElementById("editProfileBirthday").value;
  user.verified = document.getElementById("editProfileInfluencer").checked;

  if (pendingEditAvatarUrl) {
    user.avatar = pendingEditAvatarUrl;
  }

  if (user.email) {
    localStorage.setItem(`pawbook_user_${user.email.toLowerCase()}`, JSON.stringify(user));
  }
  localStorage.setItem("pawbook_current_user", JSON.stringify(user));

  loadFromLocalStorage();
  checkBirthdayCelebration();
  closeEditProfileModal();
  alert("✓ Profile successfully updated!");
}

function openShareProfileModal() {
  const user = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully", handle: "@sully" };
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

// REPORT & AUTO-HIDE LOGIC
function openReportPostModal(postId) {
  activeReportPostId = postId;
  document.getElementById("reportPostModal")?.classList.remove("hidden");
}

function closeReportPostModal() {
  document.getElementById("reportPostModal")?.classList.add("hidden");
  activeReportPostId = null;
}

function submitPostReport() {
  if (!activeReportPostId) return;

  const post = initialPosts.find(p => p.id === activeReportPostId);
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };

  if (post) {
    if (!post.hiddenByUsers) post.hiddenByUsers = [];
    if (!post.hiddenByUsers.includes(currentUser.name)) {
      post.hiddenByUsers.push(currentUser.name);
    }

    if (post.author === currentUser.name) {
      userNotifications.unshift({
        id: Date.now(),
        type: "system_warning",
        senderName: "Pawbook Safety System",
        senderAvatar: DEFAULT_PET_IMG,
        text: `your post was removed due to guidelines.`,
        isRead: false
      });
      sendPushNotification("Pawbook Safety Notice", "Your post was removed due to guidelines.", DEFAULT_PET_IMG);
    }

    saveToLocalStorage();
    renderPosts();
    renderMyProfileGallery();
    renderNotifications();
  }

  closeReportPostModal();
  alert("✓ Report submitted. This post has been automatically hidden from your feed.");
}

function addComment(postId) {
  const inputElem = document.getElementById(`commentInput-${postId}`);
  const text = inputElem.value.trim();
  if (!text) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully", avatar: DEFAULT_PET_IMG };
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
    renderMyProfileGallery();
    renderNotifications();
  }
}

function sendNoseBoop(petName, buttonElem) {
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };
  
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
    text: `gave you a nose boop! 🐾🐽`,
    isRead: false
  });

  renderNotifications();
  sendPushNotification("Nose Boop Alert! 🐾", `${currentUser.name} gave ${petName} a nose boop!`, currentUser.avatar);
}

function sendFriendRequest(buttonElement, petName) {
  const card = buttonElement.closest('.pal-item');
  if (!card) return;

  playCricketChirpSound();

  const envelope = document.createElement("div");
  envelope.className = "flying-envelope";
  envelope.innerHTML = "✉️";
  card.appendChild(envelope);

  buttonElement.textContent = "Requested ✓ (Undo)";
  buttonElement.classList.add("btn-danger-outline");
  buttonElement.setAttribute("onclick", `undoFriendRequest(this, '${petName}')`);

  setTimeout(() => envelope.remove(), 800);
}

function undoFriendRequest(buttonElement, petName) {
  buttonElement.textContent = "+ Add";
  buttonElement.classList.remove("btn-danger-outline");
  buttonElement.setAttribute("onclick", `sendFriendRequest(this, '${petName}')`);
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

  const notifIndex = userNotifications.findIndex(n => n.senderName.toLowerCase().includes(petName.toLowerCase()));
  if (notifIndex !== -1) {
    userNotifications.splice(notifIndex, 1);
  }

  renderNotifications();
  renderMyPack();
}

function rejectFriendRequest(petName, buttonElement) {
  const notifIndex = userNotifications.findIndex(n => n.senderName.toLowerCase().includes(petName.toLowerCase()));
  if (notifIndex !== -1) {
    userNotifications.splice(notifIndex, 1);
  }
  renderNotifications();
  alert(`Declined friend request from ${petName}.`);
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
  user.pals = Math.max(0, myPackList.length);
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
        <button class="btn btn-outline btn-sm" onclick="sendNoseBoop('${user.name}', this)">🐾 Nose Boop</button>
        <button class="btn btn-danger-outline btn-sm" onclick="removePetPal('${user.name}')">Remove Pal ✕</button>
      </div>
    `;
  } else {
    actionWrapper.innerHTML = `
      <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
        <button class="btn btn-primary btn-sm" onclick="acceptFriendRequest('${user.name}', this); openPetProfile('${user.name}');">+ Add Pal 🐾</button>
        <button class="btn btn-outline btn-sm" onclick="sendNoseBoop('${user.name}', this)">🐾 Nose Boop</button>
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
            <button class="btn btn-secondary btn-sm full-width" onclick="sendNoseBoop('${pal.name}', this)">🐾 Nose Boop</button>
            <button class="btn btn-danger-outline btn-sm full-width" onclick="removePetPal('${pal.name}')">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function handleMediaSelect(event) {
  const file = event.target.files[0];
  const errorElem = document.getElementById("composerMediaError");
  if (!file) return;

  if (file.type.startsWith("video/")) {
    errorElem.textContent = "";
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
    validateIsPetImage(file, (isPet, dataUrl) => {
      if (!isPet) {
        errorElem.textContent = "❌ Must be a pet image (no landscapes, mountains, or human pictures allowed)!";
        event.target.value = "";
        selectedMediaUrl = null;
        document.getElementById("mediaPreviewName").textContent = "";
      } else {
        errorElem.textContent = "";
        selectedMediaType = "image";
        selectedMediaUrl = dataUrl;
        document.getElementById("mediaPreviewName").textContent = `Selected photo: ${file.name} (✓ Verified Pet)`;
      }
    });
  }
}

function publishPost() {
  const captionInput = document.getElementById("postCaptionInput");
  const activitySelect = document.getElementById("activitySelect");
  const caption = captionInput.value.trim();

  if (!caption && !selectedMediaUrl) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully", avatar: DEFAULT_PET_IMG };

  currentUser.status = activitySelect.value;
  document.getElementById("profileStatusSelect").value = activitySelect.value;
  localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));

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
    archived: false,
    hiddenByUsers: [],
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
  renderMyProfileGallery();
  renderNotifications();
}

function formatMentionsInText(text) {
  return text.replace(/@\w+/g, match => `<span class="mention-tag" onclick="openPetProfile('${match.replace('@', '')}')">${match}</span>`);
}

function renderSinglePostHTML(post, isOwnerProfile = false) {
  let mediaHtml = '';
  if (post.mediaUrl) {
    if (post.mediaType === 'video') {
      mediaHtml = `<video src="${post.mediaUrl}" controls class="post-media"></video>`;
    } else {
      mediaHtml = `<img src="${post.mediaUrl}" class="post-media" alt="Post media" onerror="handleImageError(this)">`;
    }
  }

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
  const isMine = post.author === currentUser.name;

  return `
    <div class="card post-card" id="post-${post.id}">
      <div class="post-header">
        <img src="${post.avatar}" class="post-avatar" alt="${post.author}" onerror="handleImageError(this)" onclick="openPetProfile('${post.author}')" style="cursor:pointer;">
        <div class="post-meta">
          <h4 onclick="openPetProfile('${post.author}')" style="cursor:pointer;">${post.author} • <span style="color:var(--primary); font-weight:600;">${post.activity}</span></h4>
          <span>${post.timeAgo} ${post.archived ? '• (Archived)' : ''}</span>
        </div>
        <div style="margin-left: auto; display: flex; gap: 6px; align-items: center;">
          ${isMine && isOwnerProfile ? `
            <button class="btn btn-secondary btn-sm" onclick="toggleArchivePost(${post.id})">${post.archived ? 'Unarchive' : 'Archive'}</button>
            <button class="btn btn-danger-outline btn-sm" onclick="deletePost(${post.id})">Delete</button>
          ` : `
            <button class="btn btn-secondary btn-sm" style="color: #ef4444;" title="Report Post" onclick="openReportPostModal(${post.id})">🚨 Report</button>
          `}
        </div>
      </div>
      <p class="post-content">${formatMentionsInText(post.content)}</p>
      ${mediaHtml}
      <div class="post-actions">
        <div class="post-action-left">
          <button class="action-link ${post.hasBooped ? 'booped' : ''}" onclick="toggleBoop(${post.id})">
            <i data-lucide="heart"></i> <span>${post.boops} Boops</span>
          </button>
          <button class="action-link" onclick="sendNoseBoop('${post.author}', this)"><i data-lucide="smile"></i> Nose Boop</button>
        </div>
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
          <input type="text" id="commentInput-${post.id}" class="comment-input" placeholder="Write a comment and press Enter..." onkeydown="if(event.key === 'Enter') addComment(${post.id})">
        </div>
      </div>
    </div>
  `;
}

function toggleArchivePost(postId) {
  const post = initialPosts.find(p => p.id === postId);
  if (post) {
    post.archived = !post.archived;
    saveToLocalStorage();
    renderPosts();
    renderMyProfileGallery();
  }
}

function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post permanently?")) {
    const index = initialPosts.findIndex(p => p.id === postId);
    if (index !== -1) {
      initialPosts.splice(index, 1);
      saveToLocalStorage();
      renderPosts();
      renderMyProfileGallery();

      const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || {};
      currentUser.pawsts = Math.max(0, (currentUser.pawsts || 1) - 1);
      localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));
      const pawstElem = document.getElementById("statPawstsVal");
      if (pawstElem) pawstElem.textContent = currentUser.pawsts;
    }
  }
}

function renderMyProfileGallery() {
  const container = document.getElementById("myProfileGalleryContainer");
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };
  const myPosts = initialPosts.filter(p => p.author.toLowerCase() === currentUser.name.toLowerCase());

  container.innerHTML = myPosts.length > 0 
    ? myPosts.map(p => renderSinglePostHTML(p, true)).join('')
    : `<div class="card" style="text-align: center; padding: 30px;"><p style="color: var(--text-muted);">You haven't posted anything yet. Share your first pawst!</p></div>`;

  if (window.lucide) window.lucide.createIcons();
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
        <div class="notif-item ${n.isRead ? '' : 'unread'}">
          <img src="${n.senderAvatar}" alt="${n.senderName}" onerror="handleImageError(this)">
          <div style="flex:1;">
            <strong>${n.senderName}</strong> ${n.text}
            ${n.type === 'friend_request' ? `
              <div style="margin-top: 6px; display: flex; gap: 6px;">
                <button class="btn btn-primary btn-sm" onclick="acceptFriendRequest('${n.senderName}', this)">Accept 🐾</button>
                <button class="btn btn-danger-outline btn-sm" onclick="rejectFriendRequest('${n.senderName}', this)">Reject ✕</button>
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

  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };
  const activePosts = initialPosts.filter(p => !p.archived && (!p.hiddenByUsers || !p.hiddenByUsers.includes(currentUser.name)));
  
  const filtered = activeFilter === 'All' 
    ? activePosts 
    : activePosts.filter(p => p.species.toLowerCase() === activeFilter.toLowerCase());

  container.innerHTML = filtered.map(post => renderSinglePostHTML(post, false)).join("");
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
    renderMyProfileGallery();
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

function saveToLocalStorage() {
  localStorage.setItem("pawbook_posts", JSON.stringify(initialPosts));
  localStorage.setItem("pawbook_parks", JSON.stringify(initialParks));
  localStorage.setItem("pawbook_mypack", JSON.stringify(myPackList));
  localStorage.setItem("pawbook_lostpets", JSON.stringify(initialLostPets));
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

  const savedLostPets = localStorage.getItem("pawbook_lostpets");
  if (savedLostPets) {
    const parsed = JSON.parse(savedLostPets);
    initialLostPets.length = 0;
    initialLostPets.push(...parsed);
  }

  const savedDarkMode = localStorage.getItem("pawbook_dark_mode") === "true";
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    const btnText = document.getElementById("darkModeBtnText");
    if (btnText) btnText.textContent = "Light Mode";
  }

  const savedLang = localStorage.getItem("pawbook_language") || "en";
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) langSelect.value = savedLang;
  changeLanguage(savedLang);

  const savedUser = localStorage.getItem("pawbook_current_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    user.pals = myPackList.length;
    localStorage.setItem("pawbook_current_user", JSON.stringify(user));

    if (document.getElementById("sidebarPetName")) {
      document.getElementById("sidebarPetName").innerHTML = `${user.name} ${user.verified ? '<span class="verified-badge">🍬</span>' : ''}`;
    }
    if (document.getElementById("menuPetName")) document.getElementById("menuPetName").textContent = user.name;
    if (document.getElementById("sidebarBreed")) document.getElementById("sidebarBreed").textContent = `${user.breed || 'Pet'} • ${user.gender || 'Male'}`;
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

    if (document.getElementById("statPalsVal")) document.getElementById("statPalsVal").textContent = user.pals;
    if (document.getElementById("statPawstsVal")) document.getElementById("statPawstsVal").textContent = user.pawsts !== undefined ? user.pawsts : 0;
    if (document.getElementById("statBoopsVal")) document.getElementById("statBoopsVal").textContent = user.boops !== undefined ? user.boops : 0;

    if (user.avatar) {
      if (document.getElementById("navAvatar")) document.getElementById("navAvatar").src = user.avatar;
      if (document.getElementById("sidebarAvatar")) document.getElementById("sidebarAvatar").src = user.avatar;
      if (document.getElementById("composerAvatar")) document.getElementById("composerAvatar").src = user.avatar;
    }
    if (user.status && document.getElementById("profileStatusSelect")) {
      document.getElementById("profileStatusSelect").value = user.status;
    }
  }
}

function toggleProfileMenu() {
  document.getElementById("profileMenuDropdown")?.classList.toggle("hidden");
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
  const registerForm = document.getElementById("registerForm");

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

function updateProfileStatus(newStatus) {
  const currentUser = JSON.parse(localStorage.getItem("pawbook_current_user")) || { name: "Sully" };
  currentUser.status = newStatus;
  localStorage.setItem("pawbook_current_user", JSON.stringify(currentUser));
}

function switchMainTab(tabName) {
  document.getElementById("notifDropdown")?.classList.add("hidden");

  const feedTab = document.getElementById("feedViewTab");
  const myProfileTab = document.getElementById("myProfileViewTab");
  const talentTab = document.getElementById("talentViewTab");
  const lostPetTab = document.getElementById("lostPetViewTab");
  const parksTab = document.getElementById("parksViewTab");
  const packTab = document.getElementById("packViewTab");

  feedTab?.classList.add("hidden");
  myProfileTab?.classList.add("hidden");
  talentTab?.classList.add("hidden");
  lostPetTab?.classList.add("hidden");
  parksTab?.classList.add("hidden");
  packTab?.classList.add("hidden");

  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach(t => t.classList.remove("active"));

  const menuFeed = document.getElementById("menuFeed");
  const menuMyProfile = document.getElementById("menuMyProfile");
  const menuTalent = document.getElementById("menuTalent");
  const menuLostPet = document.getElementById("menuLostPet");
  const menuParks = document.getElementById("menuParks");
  const menuPack = document.getElementById("menuPack");

  menuFeed?.classList.remove("active");
  menuMyProfile?.classList.remove("active");
  menuTalent?.classList.remove("active");
  menuLostPet?.classList.remove("active");
  menuParks?.classList.remove("active");
  menuPack?.classList.remove("active");

  if (tabName === "feed") {
    feedTab?.classList.remove("hidden");
    if (navTabs[0]) navTabs[0].classList.add("active");
    menuFeed?.classList.add("active");
  } else if (tabName === "myprofile") {
    myProfileTab?.classList.remove("hidden");
    if (navTabs[1]) navTabs[1].classList.add("active");
    menuMyProfile?.classList.add("active");
    renderMyProfileGallery();
  } else if (tabName === "talent") {
    talentTab?.classList.remove("hidden");
    if (navTabs[2]) navTabs[2].classList.add("active");
    menuTalent?.classList.add("active");
    renderTalentTab();
  } else if (tabName === "lostpet") {
    lostPetTab?.classList.remove("hidden");
    if (navTabs[3]) navTabs[3].classList.add("active");
    menuLostPet?.classList.add("active");
    renderLostPetsFeed();
  } else if (tabName === "parks") {
    parksTab?.classList.remove("hidden");
    menuParks?.classList.add("active");
    renderParks();
  } else if (tabName === "pack") {
    packTab?.classList.remove("hidden");
    menuPack?.classList.add("active");
    renderMyPack();
  }
}