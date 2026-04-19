// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let properties = [];

// AUTH
function register(){
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.createUserWithEmailAndPassword(email, password);
}

function login(){
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
}

function logout(){
  auth.signOut();
}

// USER STATE
auth.onAuthStateChanged(user=>{
  if(user){
    userInfo.innerText = "Hi, " + user.email;
    loadFavorites();
  }else{
    userInfo.innerText = "";
  }
});

// LOAD PROPERTIES
function loadProperties(){
  db.collection("properties").get().then(snapshot=>{
    properties = [];
    snapshot.forEach(doc=>properties.push(doc.data()));
    displayProperties(properties);
  });
}

// DISPLAY
function displayProperties(list){
  propertyList.innerHTML = "";

  list.forEach(p=>{
    propertyList.innerHTML += `
    <div class="property-card">
      <img src="${p.image}" width="100%">
      <p>${p.title}</p>
      <p>₦${p.price}</p>
      <button onclick='toggleFavorite(${JSON.stringify(p)})'>❤️</button>
      <button onclick="contactAgent('${p.title}')">Contact</button>
    </div>
    `;
  });
}

// FILTER
locationInput.oninput = filter;
typeFilter.onchange = filter;
bedFilter.oninput = filter;

function filter(){
  let filtered = properties.filter(p=>{
    return (!locationInput.value || p.location.toLowerCase().includes(locationInput.value.toLowerCase()))
    && (!typeFilter.value || p.type === typeFilter.value)
    && (!bedFilter.value || p.bedrooms >= bedFilter.value);
  });

  displayProperties(filtered);
}

// FAVORITES
function toggleFavorite(p){
  const user = auth.currentUser;
  if(!user) return alert("Login first");

  const ref = db.collection("favorites").doc(user.uid).collection("items").doc(p.title);

  ref.get().then(doc=>{
    doc.exists ? ref.delete() : ref.set(p);
    loadFavorites();
  });
}

// LOAD FAVORITES
function loadFavorites(){
  const user = auth.currentUser;
  if(!user) return;

  db.collection("favorites").doc(user.uid).collection("items")
  .get().then(snapshot=>{
    savedList.innerHTML = "";

    snapshot.forEach(doc=>{
      const p = doc.data();
      savedList.innerHTML += `<div class="property-card">${p.title}</div>`;
    });
  });
}

// ADMIN ADD
function addProperty(){

  const file = pImageFile.files[0];

  const ref = storage.ref("images/" + file.name);

  ref.put(file).then(()=>{
    ref.getDownloadURL().then(url=>{

      db.collection("properties").add({
        title:pTitle.value,
        price:Number(pPrice.value),
        location:pLocation.value,
        type:pType.value,
        bedrooms:Number(pBeds.value),
        image:url
      });

      adminStatus.innerText="Added!";
      loadProperties();
    });
  });
}

// CONTACT
function contactAgent(title){
  window.open(`https://wa.me/234XXXXXXXXXX?text=Interested in ${title}`);
}

// MENU
function toggleMenu(){
  navLinks.classList.toggle("active");
}

// INIT
loadProperties();