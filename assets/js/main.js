import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./fStore.js";

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

  setSum(finalSum) {
    this.fs = finalSum;
  }

 toFirestore() {
    return {
      df: this.df,
      dt: this.dt,
      tf: this.tf,
      cn: this.cn,
      on: this.on,
      nm: this.cln && this.cls ? `${this.cln} ${this.cls}` : null,   // ime + prezime
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
        ? `${this.adr} ${this.hn}, ${this.pn} ${this.ct}` 
        : null,
      fs: this.fs
    };
  }

saveReservation() {
  return signInAnonymously(auth)
    .then(async () => {
      console.log("Anonimni login uspješan");

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
      console.error("Greška kod anonimnog logina:", error);
      return false;
    });
}


}



const auth = getAuth();

(function() {
  "use strict";

/* Custom */

const rezervacija = new Reservation();

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

  scrollIntoView('calendar');
hideReview();
  document.body.classList.remove("dark-background");
});


const calendarElement = document.getElementById('calendarElement');


  const checkoutBtn = document.getElementById("checkout-btn");
  const sendBtn = document.getElementById("send-btn");
const deliveryRadio = document.getElementById("delivery-radio");

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
          // Poziv funkcije nakon provjere
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


function showConfirmation() {
  document.getElementById("confirm-firstName").textContent = rezervacija.cln;
  document.getElementById("confirm-lastName").textContent = rezervacija.cls;
  document.getElementById("confirm-phone").textContent = rezervacija.tel;
  document.getElementById("confirm-email").textContent = rezervacija.mail;
  document.getElementById("confirm-pickup").textContent = rezervacija.del;
  document.getElementById("confirm-payment").textContent = rezervacija.pay;
  document.getElementById("confirm-dateFrom").textContent = rezervacija.df;
  document.getElementById("confirm-dateTo").textContent = rezervacija.dt;
  document.getElementById("confirm-time").textContent = rezervacija.tf;
  document.getElementById("confirm-camera").textContent = rezervacija.cn;
  document.getElementById("confirm-objective").textContent = rezervacija.on;
  document.getElementById("confirm-note").textContent = rezervacija.desc || "–";
  document.getElementById("sum-note").textContent = rezervacija.fs.toFixed(2) + "€";;
}

  sendBtn.addEventListener("click", function(e) {

  e.preventDefault(); // spriječi automatsko slanje forme


  rezervacija.saveReservation().then(success => {

let finalMsg = "";

    if (success) {

  finalMsg = "💌 Vaš zahtjev poslan! Naš tim će ga obraditi te se javiti u što kraćem roku. ";
  if (rezervacija.pay === "uplatnica") {
    finalMsg += "Račun će biti poslan na navedeni email. ";
  }
  finalMsg += "Ako imate dodatnih pitanja, slobodno nas kontaktirajte putem društvenih mreža ili E-maila! 📬";

    } else {

  finalMsg = "❌ Došlo je do greške prilikom slanja. Molimo pokušajte ponovno ili nas kontaktirajte putem društvenih mreža ili E-maila! 📬";

    }

      document.getElementById("final-message").textContent = finalMsg;


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

  // provjera obaveznih polja
let missing = [];

  const fromDate = new Date(getDateFromInput(dateFrom.value));
  const toDate = new Date(getDateFromInput(dateTo.value));

let dateFromOK = isNaN(fromDate.getTime()) === false;
let dateToOK = isNaN(toDate.getTime()) === false;

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

if (missing.length > 0) {
  alert("Ups! 😅 Čini se da ste zaboravili:\n\n- " + missing.join("\n- ") + "\n\nMolimo ispunite ili odaberite sve kako bismo mogli nastaviti! 🚀");
  return;
}

    rezervacija.setDate(dateFrom.value, dateTo.value);
  rezervacija.setTime(timeSelect.value);
  rezervacija.setClientInfo(firstName, lastName, phone, email, note);
  rezervacija.setDeliveryAndPayment(pickupMethod.value, paymentMethod.value);

if (deliveryRadio && deliveryRadio.checked) {
  deliverySum = 25;
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

  const elements = document.querySelectorAll(".cameraHolder");
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

  elements.forEach(el => {
  el.addEventListener("click", () => {
    elements.forEach(item => item.classList.remove("active"));

    el.classList.add("active");


    const stepsContent = el.closest(".steps-content");
    // Dohvati <h3> unutar tog roditelja
    const cameraName = stepsContent.querySelector("h3").textContent;
rezervacija.setCamera(cameraName);

scrollIntoView('extras');
  hideReview();

  });
});

dateFrom.addEventListener('click', () => {
  calendarElement.classList.remove('collapse');
  nextToBeAssigned = 'start';
  hideReview();

});

dateTo.addEventListener('click', () => {
  calendarElement.classList.remove('collapse');
  nextToBeAssigned = 'end';
  hideReview();

});

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault(); // spriječi pravo slanje forme
});

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
  }
 
      
}

if(!endDate){
  dateTo.value = 'Datum povrata';
}

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
      if(endDate && d >= startDate && d <= endDate || (!endDate && d.getTime() === startDate.getTime())){
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

    dateSum = 0;
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

      dateSum += price;

      }

    });

  }

    function formatDateToDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0'); // mjeseci su 0-based
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function populateTimePicker(){
  timeSelect.innerHTML = '';
  const startHour = 8;
  const endHour = 18;

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



const calendarControls = document.getElementById('calendarControls');
const availabilityButton = document.getElementById('availabilityButton');
    //time picker
const timeSelect = document.getElementById('timeSelect');

timeSelect.addEventListener('change', ()=>{
  hideReview();
});

availabilityButton.addEventListener('click', ()=>{
  if(availabilityButton.classList.contains('active')){
  scrollIntoView('camera');
   

  }
})

function hideReview() {
  const reviewSection = document.getElementById('review');
  if (!reviewSection.classList.contains('collapse')) {
    reviewSection.classList.add('collapse');
  }
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
  let scrollTop = document.querySelector('.scroll-top');

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