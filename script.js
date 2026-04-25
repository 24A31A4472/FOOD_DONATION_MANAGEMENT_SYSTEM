// =====================
// Dictionary of translations
// =====================
const translations = {
  en: {
    welcome: "Welcome to Food Donation Management System",
    donate: "Donate Food",
    request: "Request Food",
    name: "Name",
    phone: "Phone Number",
    foodDetails: "Food Details",
    needDetails: "Need Details",
    submitDonation: "Submit Donation",
    submitRequest: "Submit Request",
    thankYou: "Thank You! Your submission has been received."
  },
  hi: {
    welcome: "खाद्य दान प्रबंधन प्रणाली में आपका स्वागत है",
    donate: "भोजन दान करें",
    request: "भोजन का अनुरोध करें",
    name: "नाम",
    phone: "फ़ोन नंबर",
    foodDetails: "भोजन का विवरण",
    needDetails: "आवश्यकता का विवरण",
    submitDonation: "दान सबमिट करें",
    submitRequest: "अनुरोध सबमिट करें",
    thankYou: "धन्यवाद! आपका सबमिशन प्राप्त हो गया है।"
  },
  te: {
    welcome: "ఆహార దానం నిర్వహణ వ్యవస్థకు స్వాగతం",
    donate: "ఆహారం దానం చేయండి",
    request: "ఆహారం అభ్యర్థించండి",
    name: "పేరు",
    phone: "ఫోన్ నంబర్",
    foodDetails: "ఆహార వివరాలు",
    needDetails: "అవసర వివరాలు",
    submitDonation: "దానం సమర్పించండి",
    submitRequest: "అభ్యర్థన సమర్పించండి",
    thankYou: "ధన్యవాదాలు! మీ సమర్పణ అందింది."
  }
};

// =====================
// Apply translations
// =====================
function applyTranslations(lang) {
  const welcome = document.querySelector("h1");
  if (welcome) welcome.innerText = translations[lang].welcome;

  const donateBtn = document.querySelector(".btnDonate");
  if (donateBtn) donateBtn.innerText = translations[lang].donate;

  const requestBtn = document.querySelector(".btnRequest");
  if (requestBtn) requestBtn.innerText = translations[lang].request;

  const donorForm = document.getElementById("donorForm");
  if (donorForm) {
    donorForm.querySelector("label[for='name']").innerText = translations[lang].name + ":";
    donorForm.querySelector("label[for='phone']").innerText = translations[lang].phone + ":";
    donorForm.querySelector("label[for='foodDetails']").innerText = translations[lang].foodDetails + ":";
    donorForm.querySelector("button").innerText = translations[lang].submitDonation;
  }

  const receiverForm = document.getElementById("receiverForm");
  if (receiverForm) {
    receiverForm.querySelector("label[for='name']").innerText = translations[lang].name + ":";
    receiverForm.querySelector("label[for='phone']").innerText = translations[lang].phone + ":";
    receiverForm.querySelector("label[for='needDetails']").innerText = translations[lang].needDetails + ":";
    receiverForm.querySelector("button").innerText = translations[lang].submitRequest;
  }

  const thankYouMsg = document.querySelector(".thankYouMsg");
  if (thankYouMsg) thankYouMsg.innerText = translations[lang].thankYou;
}

// =====================
// Language selector
// =====================
const languageSelect = document.getElementById("languageSelect");
if (languageSelect) {
  languageSelect.addEventListener("change", function() {
    localStorage.setItem("preferredLanguage", this.value);
    applyTranslations(this.value);
    speak(translations[this.value].welcome, this.value);
  });
}

window.onload = function() {
  const savedLang = localStorage.getItem("preferredLanguage") || "en";
  if (languageSelect) languageSelect.value = savedLang;
  applyTranslations(savedLang);
  
  
  // Load admin data if on admin page
  loadAdminData();
};

// =====================
// Voice assistant
// =====================
function speak(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === "hi") utterance.lang = "hi-IN";
  else if (lang === "te") utterance.lang = "te-IN";
  else utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
function readWelcome() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  const text = translations[lang].welcome;
  speak(text, lang);
}
// =====================
// Speak helper functions
// =====================
function readDonorForm() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  const text = `
    ${translations[lang].name},
    ${translations[lang].phone},
    ${translations[lang].foodDetails},
    ${translations[lang].submitDonation}
  `;
  speak(text, lang);
}

function readReceiverForm() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  const text = `
    ${translations[lang].name},
    ${translations[lang].phone},
    ${translations[lang].needDetails},
    ${translations[lang].submitRequest}
  `;
  speak(text, lang);
}

function readThankYou() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  const text = translations[lang].thankYou;
  speak(text, lang);
}

// =====================
// OTP Simulation
// =====================
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}
let currentOTP;
function sendOTP() {
  currentOTP = generateOTP();
  alert("Your OTP is: " + currentOTP); // Demo only
}
function verifyOTP(userInput) {
  return userInput == currentOTP;
}

// =====================
// Save submissions
// =====================
function saveDonation(name, phone, foodDetails) {
  let donations = JSON.parse(localStorage.getItem("donations")) || [];
  donations.push({ name, phone, foodDetails, approved: false });
  localStorage.setItem("donations", JSON.stringify(donations));
}
function saveRequest(name, phone, needDetails) {
  let requests = JSON.parse(localStorage.getItem("requests")) || [];
  requests.push({ name, phone, needDetails, approved: false });
  localStorage.setItem("requests", JSON.stringify(requests));
}

// =====================
// Donor form handler
// =====================
const donorForm = document.getElementById("donorForm");
if (donorForm) {
  donorForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const foodDetails = document.getElementById("foodDetails").value;

    const regex = /^[6-9]\d{9}$/;
    if (!regex.test(phone)) {
      document.getElementById("phoneError").innerText = "Invalid phone number!";
    } else {
      document.getElementById("phoneError").innerText = "";
      sendOTP();
      const userOTP = prompt("Enter the OTP sent to your number:");
      if (verifyOTP(userOTP)) {
        saveDonation(name, phone, foodDetails);
        window.location.href = "thankyou.html";
      } else {
        alert("Incorrect OTP. Please try again.");
      }
    }
  });
}

// =====================
// Receiver form handler
// =====================
const receiverForm = document.getElementById("receiverForm");
if (receiverForm) {
  receiverForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const needDetails = document.getElementById("needDetails").value;

    const regex = /^[6-9]\d{9}$/;
    if (!regex.test(phone)) {
      document.getElementById("phoneError").innerText = "Invalid phone number!";
    } else {
      document.getElementById("phoneError").innerText = "";
      sendOTP();
      const userOTP = prompt("Enter the OTP sent to your number:");
      if (verifyOTP(userOTP)) {
        saveRequest(name, phone, needDetails);
        window.location.href = "thankyou.html";
      } else {
        alert("Incorrect OTP. Please try again.");
      }
    }
  });
}



// =====================
// Admin panel loader (with Approve/Delete buttons)
// =====================
function loadAdminData() {
  const donationList = document.getElementById("donationList");
  const requestList = document.getElementById("requestList");

  // ----- Donations -----
  if (donationList) {
    let donations = JSON.parse(localStorage.getItem("donations")) || [];
    donations.forEach((d, index) => {
      let li = document.createElement("li");
      li.innerText = `${d.name} (${d.phone}) - ${d.foodDetails}`;

      let approveBtn = document.createElement("button");
      approveBtn.innerText = "Approve";
      approveBtn.className = "admin-btn approve";
      approveBtn.onclick = () => {
        d.approved = true;
        localStorage.setItem("donations", JSON.stringify(donations));
        li.style.backgroundColor = "#d4edda"; // green highlight
        alert(`Donation approved: ${d.name}`);
      };

      let deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.className = "admin-btn delete";
      deleteBtn.onclick = () => {
        donations.splice(index, 1);
        localStorage.setItem("donations", JSON.stringify(donations));
        li.remove();
      };

      li.appendChild(approveBtn);
      li.appendChild(deleteBtn);
      donationList.appendChild(li);
    });
  }

  // ----- Requests -----
  if (requestList) {
    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    requests.forEach((r, index) => {
      let li = document.createElement("li");
      li.innerText = `${r.name} (${r.phone}) - ${r.needDetails}`;

      let approveBtn = document.createElement("button");
      approveBtn.innerText = "Approve";
      approveBtn.className = "admin-btn approve";
      approveBtn.onclick = () => {
        r.approved = true;
        localStorage.setItem("requests", JSON.stringify(requests));
        li.style.backgroundColor = "#d4edda"; // green highlight
        alert(`Request approved: ${r.name}`);
      };

      let deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.className = "admin-btn delete";
      deleteBtn.onclick = () => {
        requests.splice(index, 1);
        localStorage.setItem("requests", JSON.stringify(requests));
        li.remove();
      };

      li.appendChild(approveBtn);
      li.appendChild(deleteBtn);
      requestList.appendChild(li);
    });
  }

}