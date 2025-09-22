import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { addDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { existsGrad, getGradovi, izracunajDostavu } from "./distance.js";
import { db } from "./fStore.js";
import AppConfig from "./variables.js";

class Reservation {
  constructor() {
    this.df = null;   // dateFrom
    this.dt = null;   // dateTo
    this.tf = null;   // timeFrom
    this.cn = null;   // cameraName
    this.on = null;   // objectiveName
    this.cln = null;  // clientName
    this.cls = null;  // clientSurname
    this.tel = null;  
    this.mail = null;
    this.desc = null; // clientDescription
    this.del = null;  // delivery
    this.pay = null;  // payment
    this.dr = null;   // dateRequested
    this.st = 0;      // status (0=requested,1=confirmed,2=cancelled,3=completed)
    this.dls = null;  // dateLastStatusChange
    this.usc = null;  // userStatusChanged
    this.adr = null;  // clientAddress
    this.hn = null;   // clientHouseNumber
    this.pn = null;   // clientPostalNumber
    this.ct = null;   // clientCity
    this.fs = 0;   // finalSum
    this.pe = 0;   // postEditing (0=no,1=yes)
  }

  // --- Getters ---
  getCameraName() {
    return this.cn;
  }

  getObjectiveName() {
    return this.on;
  }

  // --- Checks ---
  dateAndTimeSet() {
    return this.df !== null && this.dt !== null && this.tf !== null;
  }

  cameraSet() {
    return this.cn !== null;
  }

  objectiveSet() {
    return this.on !== null;
  }

  clientInfosSet() {
    return (
      this.cln !== null &&
      this.cls !== null &&
      this.tel !== null &&
      this.mail !== null &&
      this.del !== null &&
      this.pay !== null
    );
  }

  // --- Setters ---

  setDate(dateFrom, dateTo) {
    this.df = dateFrom;
    this.dt = dateTo;
  }

  setTime(timeFrom) {
    this.tf = timeFrom;
  }

  setCamera(cameraName) {
    this.cn = cameraName;
  }

  setObjective(objectiveName) {
    this.on = objectiveName;
  }

  setClientInfo(name, surname, telefon, mail, description) {
    this.cln = name;
    this.cls = surname;
    this.tel = telefon;
    this.mail = mail;
    this.desc = description;
  }

  setDeliveryAndPayment(delivery, payment) {
    this.del = delivery;
    this.pay = payment;
  }

  setAddress(address, houseNumber, postalNumber, city) {
    this.adr = address;
    this.hn = houseNumber;
    this.pn = postalNumber;
    this.ct = city;
  }

  clearAdress() {
    this.adr = null;
    this.hn = null;
    this.pn = null;
    this.ct = null;
  }

  setSum(finalSum) {
    this.fs = finalSum;
  }

 setPostEditing(value) {
    this.pe = value ? 1 : 0;
  }

 toFirestore() {
    return {
      df: this.df,
      dt: this.dt,
      tf: this.tf,
      cn: this.cn,
      on: this.on,
      nm: this.cln && this.cls ? `${this.cln} <> ${this.cls}` : null,   // ime + prezime
      tel: this.tel,
      mail: this.mail,
      desc: this.desc,
      del: this.del,
      pay: this.pay,
      dr: this.dr,
      st: this.st,
      dls: this.dls,
      usc: this.usc,
      adr: (this.adr || this.hn || this.pn || this.ct) 
        ? `${this.adr} <> ${this.hn} <> ${this.pn} <> ${this.ct}` 
        : null,
      fs: this.fs,
      pe: this.pe
    };
  }

saveReservation() {
  return signInAnonymously(auth)
    .then(async () => {

      try {
        this.dr = new Date();
        await addDoc(collection(db, "reservations"), this.toFirestore());
        console.log("Rezervacija spremljena");
        return true;
      } catch (e) {
        console.error("Greška kod spremanja:", e);
        return false;
      }

    })
    .catch((error) => {
      console.error("Greška kod logina:", error);
      return false;
    });
}

canSend() {

  return signInAnonymously(auth)
    .then(async () => {

      try {

      if (!this.cln || !this.cls || (!this.tel && !this.mail)) return false;



    const q = query(
      collection(db, "reservations"),
      where("mail", "==", this.mail),
      where("nm", "==", `${this.cln} <> ${this.cls}`),
      where("tel", "==", this.tel),
      where("st", "==", 0)
    );

    const snapshot = await getDocs(q);

// snapshot.docs.map(d => d.data())

for (const doc of snapshot.docs) {
  const data = doc.data();

  if (data.dr) {
    const drDate = data.dr.toDate ? data.dr.toDate() : new Date(data.dr);
    const now = new Date();
    const diffMinutes = (now - drDate) / 1000 / 60;

    if (diffMinutes < 5) {
      return false; // odmah izlazi iz canSend
    }
  }
}

    // console.log("Postojeće rezervacije:", snapshot.docs.map(d => d.data()));

    return true;

      } catch (e) {
        console.error("Greška kod spremanja:", e);
        return false;
      }

    })
    .catch((error) => {
      console.error("Greška kod logina:", error);
      return false;
    });

  }


getCamerasAndObjectives(dateFrom, dateTo) {
  return signInAnonymously(auth)
    .then(async () => {
      try {
        // Pretvaramo datume u objekt za usporedbu
        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        // Firestore query: uzimamo sve rezervacije sa st = 1 (confirmed)
        const q = query(
          collection(db, "reservations"),
          where("st", "==", 1),
          where("df", "<=", to),
          where("dt", ">=", from)
        );

        
        const snapshot = await getDocs(q);
        const result = [];
               
        snapshot.docs.forEach(doc => {
          const data = doc.data();

          // if (data.df && data.dt) {
          //   const dfDate = new Date(data.df);
          //   const dtDate = new Date(data.dt);

          //   // Provjeravamo da li postoji preklapanje s proslijeđenim periodom
          //   if (dfDate <= to && dtDate >= from) {
              result.push({ cn: data.cn, on: data.on });
          //   }
          // }

          //console.log("Zauzete kamere i objektivi:", data.cn, data.on);

        });


        return result; // vraća array objekata { cn, on }

      } catch (e) {
        console.error("Greška kod dohvaćanja kamera i objektiva:", e);
        return [];
      }
    })
    .catch(error => {
      console.error("Greška kod logina:", error);
      return [];
    });
}



}



const cameras = [
  {
    path: "assets/img/steps/nikonz30.png",
    cameraName: "Nikon Z30",
    cameraDescription: "Kompaktan i lagan fotoaparat dizajniran za kreativce u pokretu – donosi vrhunsku kvalitetu slike i besprijekorno snimanje videa, bilo da kreiraš sadržaj za društvene mreže, putopisne vlogove ili svakodnevne uspomene. Intuitivno rukovanje i pametna povezivost omogućuju ti da svaki trenutak podijeliš odmah, jasno i bez kompromisa.",
    features: [
          { icon: "bi-phone-fill", cameraFeature: "Selfie ekran" },
          { icon: "bi-wifi", cameraFeature: "Bežični prijenos slike" },
          { icon: "bi-film", cameraFeature: "4K UHD video bez cropa" }
    ]
  },
  {
    path: "assets/img/steps/nikonz50.png",
    cameraName: "Nikon Z50",
      cameraDescription: "Moćan fotoaparat koji uvijek ide uz tebe – bilo na putovanjima, u šetnji gradom ili dok bilježiš svakodnevne trenutke. Kombinira iznimnu kvalitetu slike i 4K video s praktičnim selfie ekranom i jednostavnom povezivošću, pa je jednako dobar za stvaranje uspomena kao i za dijeljenje sadržaja na društvenim mrežama.",   
         features: [
      { icon: "bi-camera-fill", cameraFeature: "Vrhunska fotografija" },
      { icon: "bi-wifi", cameraFeature: "Bežični prijenos slike" },
      { icon: "bi-stars", cameraFeature: "Odlično snimanje pri slabom svjetlu" }
    ]
  }
];

const objectives = [
  {
    path: "assets/img/objectives/16_50.png",
    name: "NIKKOR Z DX 16-50mm F3.5-6.3 VR",
    features: {
      Fokus: true,
      Portreti: true,
      Zoom: true
    }
  },
  {
    path: "assets/img/objectives/24.png",
    name: "NIKKOR Z DX 24mm F1.7",
    features: {
      Fokus: true,
      Portreti: true,
      Zoom: false
    }
  }
];


const rezervacija = new Reservation();


const auth = getAuth();

(function() {
  "use strict";





function addObjectives(excluded = []) {
  const container = document.getElementById("objectives-container");
  if (!container) return;

  // očisti postojeći sadržaj
  container.innerHTML = "";

  // filtriraj objectives prema excluded
  const filteredObjectives = objectives.filter(obj => {
    return !excluded.some(e => e === obj.name);
  });

  if (filteredObjectives.length === 0) return;

  // Header row (prazne ćelije)
  const headerRow = document.createElement("div");
  headerRow.className = "row text-center fw-bold align-items-center mb-2";
  for (let i = 0; i < 4; i++) {
    const col = document.createElement("div");
    col.className = i === 0 ? "col-2" : "col-3";
    headerRow.appendChild(col);
  }
  container.appendChild(headerRow);

  // Red: slike
  const imgRow = document.createElement("div");
  imgRow.className = "row text-center align-items-center mb-2";
  const emptyCol = document.createElement("div");
  emptyCol.className = "col-2 fw-bold";
  imgRow.appendChild(emptyCol);

  filteredObjectives.forEach(obj => {
    const col = document.createElement("div");
    col.className = "col-3";
    const img = document.createElement("img");
    img.src = obj.path;
    img.className = "img-fluid";
    img.style.maxWidth = "80px";
    img.alt = obj.name;
    col.appendChild(img);
    imgRow.appendChild(col);
  });
  container.appendChild(imgRow);

  // Red: ime
  const nameRow = document.createElement("div");
  nameRow.className = "row text-center align-items-center mb-2";
  const emptyCol2 = document.createElement("div");
  emptyCol2.className = "col-2 fw-bold";
  nameRow.appendChild(emptyCol2);

  filteredObjectives.forEach(obj => {
    const col = document.createElement("div");
    col.className = "col-3";
    col.textContent = obj.name;
    nameRow.appendChild(col);
  });
  container.appendChild(nameRow);

  // Redovi sa feature-ima
  const featureNames = Object.keys(filteredObjectives[0].features);

  featureNames.forEach(featureName => {
    const featureRow = document.createElement("div");
    featureRow.className = "row align-items-center mb-2";

    const colLabel = document.createElement("div");
    colLabel.className = "col-2 fw-bold text-center";
    colLabel.textContent = featureName;
    featureRow.appendChild(colLabel);

    filteredObjectives.forEach(obj => {
      const col = document.createElement("div");
      col.className = "col-3 d-flex justify-content-center";
      const icon = document.createElement("i");
      icon.className = obj.features[featureName] ? "bi bi-check icon-50 icon-check" : "bi bi-x icon-50 icon-x";
      col.appendChild(icon);
      featureRow.appendChild(col);
    });

    container.appendChild(featureRow);
  });

  // Red: dugmad
  const btnRow = document.createElement("div");
  btnRow.className = "row text-center align-items-center mb-2";
  const emptyCol3 = document.createElement("div");
  emptyCol3.className = "col-2 fw-bold";
  btnRow.appendChild(emptyCol3);

  filteredObjectives.forEach(obj => {
    const col = document.createElement("div");
    col.className = "col-3";
    const btn = document.createElement("a");
    btn.className = "buy-btn d-block mx-auto mt-3 text-center objectiveHolder";
    btn.textContent = "Dodaj";
    col.appendChild(btn);
    btnRow.appendChild(col);
  });

  container.appendChild(btnRow);

  const objectiveElements = document.querySelectorAll(".objectiveHolder");
  const objectiveNames = document.querySelectorAll(".row:nth-child(3) .col-3");

  objectiveElements.forEach((el, index) => {
    el.addEventListener("click", () => {
      objectiveElements.forEach(item => item.classList.remove("active"));
      el.classList.add("active");
      const objective = objectiveNames[index].textContent;
      rezervacija.setObjective(objective);
      scrollIntoView('contact');
      hideReview();
    });
  });
}



function deleteAllObjectives() {
    const container = document.getElementById("objectives-container");
  if (!container) return;

  // Izbriši sve postojeće elemente
  container.innerHTML = "";
}

function deleteAllCameras() {
    const container = document.getElementById("camera-container");
  if (!container) return;

  // Izbriši sve postojeće elemente
  container.innerHTML = "";
}

function addCameras(excluded = []) {
  const container = document.getElementById("camera-container");
  if (!container) return;

  deleteAllCameras(); // izbriši stare

  const filteredCameras = cameras.filter(cam => {
    return !excluded.some(e => e === cam.cameraName);
  });

  const descElement = document.getElementById("camera-desc");

  if (filteredCameras.length === 0) {
      descElement.textContent = "Nažalost trenutno nemamo dostupnih uređaja za odabrani period. 😞 Pokušaj odabrati drugo vrijeme!";
          descElement.style.marginBottom = "7px";
  }
  else
  {
      descElement.textContent = "Ovi uređaji hvataju detalje koje tvoje oko možda promaši, ali srce pamti.";
          descElement.style.marginBottom = "0px";
  }


  filteredCameras.forEach(camera => {
    const col = document.createElement("div");
    col.className = "col-lg-4";
    col.setAttribute("data-aos", "fade-up");
    col.setAttribute("data-aos-delay", "200");

    const stepsItem = document.createElement("div");
    stepsItem.className = "steps-item";

    // Slika
    const stepsImage = document.createElement("div");
    stepsImage.className = "steps-image";
    stepsImage.style.display = "flex";
    stepsImage.style.alignItems = "center";
    stepsImage.style.justifyContent = "center";

    const img = document.createElement("img");
    img.src = camera.path;
    img.alt = camera.cameraName;
    img.className = "img-fluid responsive-img";
    img.loading = "lazy";

    stepsImage.appendChild(img);

    // Content
    const stepsContent = document.createElement("div");
    stepsContent.className = "steps-content";

    const h3 = document.createElement("h3");
    h3.textContent = camera.cameraName;

    const p = document.createElement("p");
    p.textContent = camera.cameraDescription;

    const stepsFeatures = document.createElement("div");
    stepsFeatures.className = "steps-features";

    camera.features.forEach(f => {
      const featureItem = document.createElement("div");
      featureItem.className = "feature-item";

      const i = document.createElement("i");
      i.className = `bi ${f.icon}`;

      const span = document.createElement("span");
      span.textContent = f.cameraFeature;

      featureItem.appendChild(i);
      featureItem.appendChild(span);
      stepsFeatures.appendChild(featureItem);
    });

    // Button
    const btn = document.createElement("a");
    btn.className = "buy-btn d-block mx-auto mt-3 text-center cameraHolder";
    btn.textContent = "Odaberi";

    stepsFeatures.appendChild(btn);
    stepsContent.appendChild(h3);
    stepsContent.appendChild(p);
    stepsContent.appendChild(stepsFeatures);

    stepsItem.appendChild(stepsImage);
    stepsItem.appendChild(stepsContent);
    col.appendChild(stepsItem);
    container.appendChild(col);

    // click event
    const elements = document.querySelectorAll(".cameraHolder");
    elements.forEach(el => {
      el.addEventListener("click", () => {
        elements.forEach(item => item.classList.remove("active"));
        el.classList.add("active");
        const stepsContent = el.closest(".steps-content");
        const cameraName = stepsContent.querySelector("h3").textContent;
        rezervacija.setCamera(cameraName);
        scrollIntoView('extras');
        hideReview();
      });
    });
  });
}

  let scrollTop = document.querySelector('.scroll-top');

const termsLink = document.getElementById('terms-link');
const privacyLink = document.getElementById('privacy-link');

const termsCheckbox = document.getElementById('confirm-terms');
const privacyCheckbox = document.getElementById('confirm-privacy');

termsCheckbox.addEventListener('change', setSendBtnStyle);
privacyCheckbox.addEventListener('change', setSendBtnStyle);

function setSendBtnStyle()
{
  if (termsCheckbox.checked && privacyCheckbox.checked) {
    sendBtn.classList.remove("fake-disabled");
  }
  else if (!sendBtn.classList.contains("fake-disabled")) {
    sendBtn.classList.add("fake-disabled");
  }
}

const popupOverlay = document.getElementById('popupOverlay');
// const openPopup = document.getElementById('openPopup');
const closePopup = document.getElementById('closePopup');
const popupText = document.getElementById('popupText');

privacyLink.addEventListener('click', () => {
   openPopup('assets/files/privacy.txt');
});

termsLink.addEventListener('click', () => {
   openPopup('assets/files/terms.txt');
});

function openPopup(contentPath)
{
   //const filePath = './files/terms.txt';

  fetch(contentPath)
    .then(response => {
      if (!response.ok) {
        console.error('Ne mogu učitati datoteku: ' + response.statusText);
      }
      return response.text();
    })
    .then(text => {
      document.getElementById('popupText').textContent = text;
         document.body.classList.add('no-scroll'); // blokira scroll na body
          scrollTop.classList.add('d-none'); // sakrij scrollTop
            popupOverlay.style.display = 'flex';

    })
    .catch(error => {
      console.error('Greška:', error);
      document.getElementById('popupText').textContent = "Greška pri učitavanju sadržaja.";
    });
}

  // document.body.classList.add('no-scroll'); // blokira scroll na body
  // scrollTop.classList.add('d-none'); // sakrij scrollTop

closePopup.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
  document.body.classList.remove('no-scroll');
   scrollTop.classList.remove('d-none');
});



/* Custom */


  let startDate = null;
  let endDate = null;
  let nextToBeAssigned = null;

  let dateSum = 0;
  let deliverySum = 0;

  const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');

const getStartedBtn = document.getElementById('getStartedBtn');
getStartedBtn.addEventListener('click', (e) => {
  e.preventDefault();

  //dateFromClick();
  scrollIntoView('calendar');
hideReview();
  document.body.classList.remove("dark-background");

});


const calendarElement = document.getElementById('calendarElement');


  const checkoutBtn = document.getElementById("checkout-btn");
  const sendBtn = document.getElementById("send-btn");
const deliveryRadio = document.getElementById("delivery-radio");
const cashRadio = document.getElementById("cash-radio");
const bankRadio = document.getElementById("bank-radio");

  const inputIds = [
  "first-name-field",
  "last-name-field",
  "phone-field",
  "email-field",
  "note-field",
  "delivery-radio",
  "pickup-radio",
  "cash-radio",
  "bank-radio"
];

inputIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    // Za tekstualne inpute i textarea
    if (el.tagName === "INPUT" && el.type !== "radio" || el.tagName === "TEXTAREA") {
      el.addEventListener("input", hideReview);
    } else {
      // Za radio i checkbox
        el.addEventListener("change", () => {
          
          let delivery = id === "delivery-radio";
          let pickup = id === "pickup-radio";

if(delivery || pickup) {
  toggleDeliveryFields();
}

if(pickup){
                        cashRadio.disabled = false; 
}

    

          hideReview();
        });
    }
  }
});


//   function disableSelection(e) {
//   e.preventDefault(); // sprječava označavanje teksta
// }

// dateFrom.addEventListener("mousedown", disableSelection); // desktop
// dateFrom.addEventListener("touchstart", disableSelection); // mobilni uređaji

// dateTo.addEventListener("mousedown", disableSelection); // desktop
// dateTo.addEventListener("touchstart", disableSelection); // mobilni uređaji


  const citySelect = document.getElementById("city-field");
  const nearCitySelect = document.getElementById("near-city-field");


nearCitySelect.addEventListener("change", function () {

checkPaymentOptions(this.value);
        }


 // console.log("Odabrani grad:", this.value);
);

function checkPaymentOptions(grad) {
  //  console.log("Odabrani grad:", grad);
         let deliverySumm = izracunajDostavu(grad);

          if (deliverySumm && deliverySumm > 40) {
            cashRadio.checked = false;
            bankRadio.checked = true;
            cashRadio.disabled = true; 
          }
          else
          {
             cashRadio.disabled = false; 
          }
        }


        // if(delivery) {

        //     let deliverySumm = izracunajDostavu("Zagreb");

        //   if (deliveryRadio.checked && deliverySumm > 40) {
        //     cashRadio.checked = false;
        //     bankRadio.checked = true;
        //     cashRadio.disabled = true; 
        //   }
        //   else
        //   {
        //                 cashRadio.disabled = false; 
        //   }
        // }


citySelect.addEventListener("input", () => {
  
let exist = existsGrad(citySelect.value);

if(exist) {
nearCitySelect.value = exist;
checkPaymentOptions(exist);

}});


checkAppconfig();


function showConfirmation() {
  document.getElementById("confirm-firstName").textContent = rezervacija.cln;
  document.getElementById("confirm-lastName").textContent = rezervacija.cls;
  document.getElementById("confirm-phone").textContent = rezervacija.tel;
  document.getElementById("confirm-email").textContent = rezervacija.mail;

  const pickupElement = document.getElementById("confirm-pickup");

if (rezervacija.del.toLowerCase() === "osobno") {
    pickupElement.textContent = `${rezervacija.del} - Kapucinska 35, 31000, Osijek`;
} else {
    pickupElement.textContent = rezervacija.del;
}

const paymentElement = document.getElementById("confirm-payment");

if (rezervacija.pay.toLowerCase() === "preuzimanje") {
    paymentElement.textContent = "prilikom preuzimanja";
} else if (rezervacija.pay.toLowerCase() === "uplatnica") {
    paymentElement.textContent = "putem uplatnice";
} else {
    paymentElement.textContent = rezervacija.pay;
}

document.getElementById("confirm-dateFrom").textContent = formatDateToDDMMYYYY(rezervacija.df);
  document.getElementById("confirm-dateTo").textContent = formatDateToDDMMYYYY(rezervacija.dt);
  document.getElementById("confirm-time").textContent = rezervacija.tf;
  document.getElementById("confirm-camera").textContent = rezervacija.cn;
  document.getElementById("confirm-objective").textContent = rezervacija.on;
  document.getElementById("confirm-note").textContent = rezervacija.desc || "–";


const sumNoteEl = document.getElementById("sum-note");

if (deliverySum && deliverySum > 0) {
  sumNoteEl.innerHTML = `Trošak dostave: ${deliverySum.toFixed(2)} €<br>
Najam opreme: ${dateSum.toFixed(2)} €<br>
Ukupno: ${rezervacija.fs.toFixed(2)} €`;
} else {
  sumNoteEl.innerHTML = `Ukupno: ${rezervacija.fs.toFixed(2)} €`;
}

  
}

  sendBtn.addEventListener("click", function(e) {

  e.preventDefault(); // spriječi automatsko slanje forme


if (!termsCheckbox.checked) {
  alert("Molimo potvrdi da si pročitao/la i prihvaćaš Uvjete korištenja.");
  return;
}

if (!privacyCheckbox.checked) {
  alert("Molimo potvrdi da si pročitao/la i prihvaćaš Pravila privatnosti.");
  return;
}


  rezervacija.canSend().then(can => {

     // console.log("Može li se poslati?", can);
let finalMsg = "";


    if (!can) {

finalMsg = "📩 Zahtjev je već ranije poslan i trenutno je u obradi. ⏳ Dok traje obrada nije moguće poslati novi zahtjev. Ako imate dodatnih pitanja ili želite nadopuniti informacije, slobodno nas kontaktirajte putem društvenih mreža ili e-maila. 💌";
        document.getElementById("final-message").textContent = finalMsg;

    }
      else{

  rezervacija.saveReservation().then(success => {


    if (success) {

  finalMsg = "💌 Vaš zahtjev poslan! Naš tim će ga obraditi te se javiti u što kraćem roku. ";
  if (rezervacija.pay === "uplatnica") {
    finalMsg += "Račun će biti poslan na navedeni e-mail. ";
  }
  finalMsg += "Ako imate dodatnih pitanja, slobodno nas kontaktirajte putem društvenih mreža ili e-maila! 📬";

    } else {

  finalMsg = "❌ Došlo je do greške prilikom slanja. Molimo pokušajte ponovno ili nas kontaktirajte putem društvenih mreža ili e-maila! 📬";

    }


        document.getElementById("final-message").textContent = finalMsg;

  });
}



  });
});





  checkoutBtn.addEventListener("click", function(e) {

 e.preventDefault(); // spriječi automatsko slanje forme

  // dohvat polja
  const firstName = document.getElementById("first-name-field").value.trim();
  const lastName = document.getElementById("last-name-field").value.trim();
  const phone = document.getElementById("phone-field").value.trim();
  const email = document.getElementById("email-field").value.trim();
  const note = document.getElementById("note-field").value.trim();

  const pickupMethod = document.querySelector('input[name="pickup_method"]:checked');
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked');



  const addressField = document.getElementById("address-field").value.trim();
  const houseNumberField = document.getElementById("house-number-field").value.trim();
  const postalCodeField = document.getElementById("postal-code-field").value.trim();




  // provjera obaveznih polja
let missing = [];

const fromDate = new Date(getDateFromInput(dateFrom.value));
const toDate = new Date(getDateFromInput(dateTo.value));

let dateFromOK = !isNaN(fromDate.getTime());
let dateToOK = !isNaN(toDate.getTime());

// tekst za obavezna polja (ispuniti)
if (!firstName) missing.push("Ispuniti ime ✏️");
if (!lastName) missing.push("Ispuniti prezime ✏️");
if (!phone) missing.push("Ispuniti broj telefona 📞");
if (!email) missing.push("Ispuniti email 📧");

// za odabire pišemo "odabrati"
if (!pickupMethod) missing.push("Odabrati način preuzimanja 🚚");
if (!paymentMethod) missing.push("Odabrati način plaćanja 💳");
if (!dateFromOK) missing.push("Odabrati datum preuzimanja 📅");
if (!dateToOK) missing.push("Odabrati datum povrata 📅");
if (!timeSelect) missing.push("Odabrati vrijeme ⏰");
if (!rezervacija.getCameraName()) missing.push("Odabrati kameru 📸");
if (!rezervacija.getObjectiveName()) missing.push("Odabrati objektiv 🔍");

// dodatna provjera ako je dostava odabrana
if (deliveryRadio.checked) {
  if (!addressField) missing.push("Ispuniti adresu 🏠");
  if (!houseNumberField) missing.push("Ispuniti kućni broj 🏠");
  if (!postalCodeField) missing.push("Ispuniti poštanski broj 📮");
  if (!citySelect.value) missing.push("Odabrati grad 🏙️");
  if (!nearCitySelect.value) missing.push("Odabrati grad u blizini 🏙️");
}

if (missing.length > 0) {
  alert("Ups! 😅 Čini se da ste zaboravili:\n\n- " + missing.join("\n- ") + "\n\nMolimo ispunite ili odaberite sve kako bismo mogli nastaviti! 🚀");
  return;
}

// set standardna polja
rezervacija.setDate(startDate, endDate);
rezervacija.setTime(timeSelect.value);
rezervacija.setClientInfo(firstName, lastName, phone, email, note);
rezervacija.setDeliveryAndPayment(pickupMethod.value, paymentMethod.value);

// set polja za dostavu samo ako je deliveryRadio.checked
if (deliveryRadio.checked) {
  rezervacija.setAddress(addressField, houseNumberField, postalCodeField, citySelect.value);
} else {
rezervacija.clearAdress();
}


if (deliveryRadio && deliveryRadio.checked) {
  deliverySum = izracunajDostavu(nearCitySelect.value);

 // console.log("Trošak dostave: " + deliverySum + "€");
} else {
  deliverySum = 0;
}

  rezervacija.setSum(dateSum + deliverySum);

 showConfirmation();

 scrollIntoView('review');

  });


  function getDateFromInput(input) {
    const parts = input.split("."); // razdvoji dan, mjesec, godinu
const day = parseInt(parts[0], 10);
const month = parseInt(parts[1], 10) - 1; // JS mjeseci idu od 0 do 11
const year = parseInt(parts[2], 10);
return new Date(year, month, day);
  }


function dateFromClick(){
  calendarElement.classList.remove('collapse');
  nextToBeAssigned = 'start';
  hideReview();

  scrollIntoView('calendar');
}

dateFrom.addEventListener('click', () => {
dateFromClick();
});

dateTo.addEventListener('click', () => {
  calendarElement.classList.remove('collapse');
  nextToBeAssigned = 'end';
  hideReview();
  scrollIntoView('calendar');

});

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault(); // spriječi pravo slanje forme
});

    function formatDateToDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0'); // mjeseci su 0-based
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const monthNames = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const monthLabel = document.getElementById('monthLabel');
  const daysGrid = document.getElementById('daysGrid');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let viewDate = new Date();

  function populateMonthYearControls(){
    monthSelect.innerHTML = '';
    monthNames.forEach((m,i)=>{
      const opt = document.createElement('option');
      opt.value=i;
      opt.textContent=m;
      monthSelect.appendChild(opt);
    });
    yearSelect.innerHTML = '';
    const start = viewDate.getFullYear()-1;
    for(let y=start; y<=start+15; y++){
      const opt = document.createElement('option');
      opt.value=y;
      opt.textContent=y;
      yearSelect.appendChild(opt);
    }
  }

  function startOfWeekMonday(date){
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    let w = d.getDay();
    w = (w+6)%7; // Monday=0
    return w;
  }

  function isFuture(date){
    const today = new Date();
    today.setHours(0,0,0,0);

let increment = 1;

if (today.getDay() === 5) {increment = 3;}

  if (today.getDay() === 6) {increment = 2;}

    today.setDate(today.getDate() + increment);
    return date.getTime() > today.getTime();
  }

  function render(){
    daysGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    monthLabel.textContent = `${monthNames[month]} ${year}`;
    monthSelect.value = month;
    yearSelect.value = year;

    const firstWeekday = startOfWeekMonday(viewDate);
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const totalCells = 42;
    for(let i=0;i<totalCells;i++){
      const cell = document.createElement('div');
      cell.className = 'day';
      const cellInnerNum = document.createElement('div');
      cellInnerNum.className = 'day-num';

      const dayIndex = i - firstWeekday + 1;
      let cellDate = null;

      if(dayIndex <= 0){
        const num = daysInPrev + dayIndex;
        cellInnerNum.textContent = num;
        cell.classList.add('inactive');
        cellDate = new Date(year, month-1, num);
      } else if(dayIndex > daysInMonth){
        const num = dayIndex - daysInMonth;
        cellInnerNum.textContent = num;
        cell.classList.add('inactive');
        cellDate = new Date(year, month+1, num);
      } else {
        const num = dayIndex;
        cellInnerNum.textContent = num;
        cellDate = new Date(year, month, num);
      }

      cell.dataset.date = cellDate.toISOString();

      if(isFuture(cellDate)){
        cell.classList.add('enabled');
        cell.addEventListener('click', ()=>{

          hideReview();

if (nextToBeAssigned === 'start' || cellDate < startDate || !startDate) {
  startDate = cellDate;
          endDate = new Date(startDate);      
          endDate.setDate(endDate.getDate() + 1);
            nextToBeAssigned = 'end'; // next click will set endDate

dateFrom.value = formatDateToDDMMYYYY(startDate); // format as DD-MM-YYYY
      dateTo.value = formatDateToDDMMYYYY(endDate); // format as DD-MM-YYYY
dateSum = 0;
} else if (nextToBeAssigned === 'end') {
  if(startDate)
  {
      if(cellDate === startDate)
      {
          endDate = new Date(startDate);      
          endDate.setDate(endDate.getDate() + 1);
      }
        else
        {
              endDate = cellDate;
        }

      dateTo.value = formatDateToDDMMYYYY(endDate); // format as DD-MM-YYYY
        nextToBeAssigned = 'start'; 
        dateSum = 0;

  }
 
      
}

// if(!endDate){
//   dateTo.value = 'Datum povrata';
// }

updateSelection();
}
);  

      } else {
        cell.classList.add('disabled');
      }

      cell.appendChild(cellInnerNum);
      const meta = document.createElement('div');
      meta.className='meta';
      cell.appendChild(meta);

      daysGrid.appendChild(cell);
    }
   updateSelection();
  }




function updateSelection(){
 const days = document.querySelectorAll('.day');
  
  // reset
  days.forEach(c => {
    c.classList.remove('selected', 'in-range');
    const meta = c.querySelector('.meta');
    if (meta) meta.textContent = '';
  });

updateControlsState();


  if (!startDate) return;

  let dayArray = [];
let selectedDaysCount = 0;

  days.forEach(c => {
    const d = new Date(c.dataset.date);

    if (!endDate) {
      // samo startDate je odabran
      if (d.getTime() === startDate.getTime()) {
        c.classList.add('selected');
      }
    } else {
      // startDate i endDate su odabrani
      if (d.getTime() === startDate.getTime() || d.getTime() === endDate.getTime()) {
        c.classList.add('selected'); // krajnji dani
      } else if (d > startDate && d < endDate) {
        c.classList.add('in-range'); // svi između
      }
    }


              // Za cijene: dodaj sve dane između startDate i endDate
      if(endDate && d >= startDate && d <= endDate){
        dayArray.push(c);
      }
  });



      
    // Ako korisnik klikne samo jedan dan, automatski dodaj sutrašnji dan za cijenu
    // if(!endDate){
    //   const nextDay = new Date(startDate);
    //   //nextDay.setDate(nextDay.getDate() + 1);
    //   days.forEach(c=>{
    //     const d = new Date(c.dataset.date);
    //     if(d.getTime() === nextDay.getTime()){
    //       dayArray.push(c); // dodaj sutrašnji dan u izračun cijene
    //     }
    //   });
    // }
    
    selectedDaysCount = dayArray.length;

    // Izračun cijene po danu (preskoči zadnji dan)
    dayArray.forEach((c, i) => {
      const d = new Date(c.dataset.date);
      const meta = c.querySelector('.meta');

     // Preskoči zadnji odabrani dan (ne prikazuje cijenu)
      if(i === dayArray.length - 1 && endDate) {
       // meta.textContent = 'Povrat ' + timeSelect.value;
      }
      else
      {

      let price = 60;

      if(selectedDaysCount > 3) price = 50;

      const dayOfWeek = d.getDay(); // Nedjelja=0, Subota=6
      if(dayOfWeek === 0 || dayOfWeek === 6) price = 100;

      meta.textContent = price + '€';


      }

    });

 dateSum = calculateTotal(startDate, endDate);


  }


function calculateTotal(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    console.error("Unesite ispravne datume");
    return 0;
  }

  // Ako je endDate manji od startDate, swap
  if (endDate < startDate) [startDate, endDate] = [endDate, startDate];

  let total = 0;
  let dayCount = 0;

  // Kreiramo kopiju datuma da ne mijenjamo original
  let currentDate = new Date(startDate);

  // Prvo izračunamo broj dana između start i end (isključujući endDate)
  while (currentDate <= endDate) { 
    dayCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Ponovo iteriramo po danima za izračun cijene
  currentDate = new Date(startDate);

  while (currentDate < endDate) { // < umjesto <=
    let price = 60;

    // Ako je više od 3 dana ukupno, vrijednost po danu je 50
    if (dayCount > 3) price = 50;

    // Subota = 6, Nedjelja = 0 → 100€
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) price = 100;

    total += price;

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return total;
}



function populateTimePicker(){
  timeSelect.innerHTML = '';
  const startHour = 8;
  const endHour = 14;

  for(let h = startHour; h <= endHour; h++){
    ['00','30'].forEach(min=>{

if(h === endHour && min === '30') return; 

      const option = document.createElement('option');
      const hourStr = h.toString().padStart(2,'0');
      option.value = `${hourStr}:${min}`;
      option.textContent = `${hourStr}:${min}`;
      timeSelect.appendChild(option);
    });
  }

  // Postavi default odabrano vrijeme na 09:00
  timeSelect.value = '09:00';
}

  populateMonthYearControls();
  render();
populateTimePicker();

  prevBtn.addEventListener('click', ()=>{
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
    populateMonthYearControls(); render();
  });
  nextBtn.addEventListener('click', ()=>{
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
    populateMonthYearControls(); render();
  });
  monthSelect.addEventListener('change',(e)=>{
    viewDate = new Date(viewDate.getFullYear(), parseInt(e.target.value), 1);
    render();
  });
  yearSelect.addEventListener('change',(e)=>{
    viewDate = new Date(parseInt(e.target.value), viewDate.getMonth(), 1);
    render();
  });
  document.addEventListener('keydown',(e)=>{
    if(e.key === 'ArrowLeft') { prevBtn.click(); }
    if(e.key === 'ArrowRight'){ nextBtn.click(); }
  });
});



    // Funkcija za popunjavanje comboboxa gradovima
    function populateGradovi() {
        const select = document.getElementById("near-city-field");
        select.innerHTML = ""; // očisti prethodne opcije

             const option = document.createElement("option");
            option.value = "";
            option.textContent = "";
                    select.appendChild(option);

        getGradovi().forEach(grad => {
            const option = document.createElement("option");
            option.value = grad;
            option.textContent = grad;
            select.appendChild(option);
        });
    }

    // Prikaz/skrivanje polja prema odabranoj opciji
    function toggleDeliveryFields() {

const deliveryFields = document.getElementById('delivery-fields');


        if (deliveryRadio.checked) {
            deliveryFields.style.display = "flex";
            populateGradovi();
        } else {
            deliveryFields.style.display = "none";
        }
    }

    
const confirmPostEditing = document.getElementById('confirm-post-editing');

confirmPostEditing.addEventListener('change', ()=>{
  rezervacija?.setPostEditing(confirmPostEditing.checked);
});

const calendarControls = document.getElementById('calendarControls');
const availabilityButton = document.getElementById('availabilityButton');
    //time picker
const timeSelect = document.getElementById('timeSelect');

timeSelect.addEventListener('change', ()=>{
  hideReview();
});

availabilityButton.addEventListener('click', ()=>{
  if(availabilityButton.classList.contains('active')){
   
 rezervacija.getCamerasAndObjectives(startDate, endDate).then(data => {


  const camerasArray = data.map(r => r.cn);
const objectivesArray = data.map(r => r.on);

//     console.log(data);
// console.log("Rezervirane kamere u odabranom periodu:", camerasArray);
// console.log("Rezervirani objektivi u odabranom periodu:", objectivesArray);

  deleteAllCameras();
  addCameras(camerasArray);

  deleteAllObjectives();
   addObjectives(objectivesArray);

  scrollIntoView('camera');

 });




  }
})

function hideReview() {
  const reviewSection = document.getElementById('review');
  if (!reviewSection.classList.contains('collapse')) {
    reviewSection.classList.add('collapse');
  }

        document.getElementById("final-message").textContent = "";

}

function scrollIntoView(element) {
  let section = document.getElementById(element);
if(section.classList.contains('collapse')){
  section.classList.remove('collapse');
}

 section.scrollIntoView({
    behavior: 'smooth',
    block: 'start' // scrolla na početak sekcije
  });
};

function checkAppconfig() {

  console.log("Provjera appConfigInstance.SHOW_ALL_PAGES:", AppConfig.SHOW_ALL_PAGES);
if(!AppConfig.SHOW_ALL_PAGES) return;

const sections = ['calendar', 'camera', 'extras', 'contact', 'review'];

sections.forEach(element => {

    let section = document.getElementById(element);
if(section.classList.contains('collapse')){
  section.classList.remove('collapse');
}

    document.body.classList.remove("dark-background");
    document.body.classList.add("light-background");
})

if(AppConfig.DEBUG){


  rezervacija.setDate(new Date(2024, 6, 10), new Date(2024, 6, 12));
  rezervacija.setTime("09:30");
  rezervacija.setCamera("Nikon Z30");
  rezervacija.setObjective("NIKKOR Z DX 16-50mm F3.5-6.3 VR");
  rezervacija.setClientInfo("Test", "Korisnik", "0912345678", "test@example.com", "Testna napomena");
  rezervacija.setDeliveryAndPayment("osobno", "preuzimanje");
  rezervacija.setAddress("Test ulica", "123", "31000", "Osijek");
  rezervacija.setSum(120);

  showConfirmation();


}
}

function updateControlsState() {
  if(startDate && endDate){
    availabilityButton.classList.add('active');
  } else {
    availabilityButton.classList.remove('active');
  }
}


  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
scrollTop.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('calendar').scrollIntoView({
    behavior: 'smooth',
    block: 'start' // scrolla na početak sekcije
  });
});

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();