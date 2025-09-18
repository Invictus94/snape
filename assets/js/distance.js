export { existsGrad, getGradovi, izracunajDostavu };

const gradovi = [
  { naziv: "Bakar", udaljenost: 432 },
  { naziv: "Beli Manastir", udaljenost: 34 },
  { naziv: "Belišće", udaljenost: 32 },
  { naziv: "Benkovac", udaljenost: 485 },
  { naziv: "Biograd na Moru", udaljenost: 588 },
  { naziv: "Bjelovar", udaljenost: 251 },
  { naziv: "Buje", udaljenost: 915 },
  { naziv: "Buzet", udaljenost: 484 },
  { naziv: "Čabar", udaljenost: 385 },
  { naziv: "Čakovec", udaljenost: 242 },
  { naziv: "Čazma", udaljenost: 251 },
  { naziv: "Cres", udaljenost: 444 },
  { naziv: "Crikvenica", udaljenost: 444 },
  { naziv: "Daruvar", udaljenost: 150 },
  { naziv: "Delnice", udaljenost: 385 },
  { naziv: "Donja Stubica", udaljenost: 267 },
  { naziv: "Donji Miholjac", udaljenost: 55 },
  { naziv: "Drniš", udaljenost: 638 },
  { naziv: "Dubrovnik", udaljenost: 557 },
  { naziv: "Duga Resa", udaljenost: 385 },
  { naziv: "Dugo Selo", udaljenost: 267 },
  { naziv: "Đakovo", udaljenost: 52 },
  { naziv: "Đurđevac", udaljenost: 163 },
  { naziv: "Garešnica", udaljenost: 227 },
  { naziv: "Glina", udaljenost: 803 },
  { naziv: "Gospić", udaljenost: 479 },
  { naziv: "Grubišno Polje", udaljenost: 154 },
  { naziv: "Hrvatska Kostajnica", udaljenost: 228 },
  { naziv: "Hvar", udaljenost: 444 },
  { naziv: "Ilok", udaljenost: 35 },
  { naziv: "Imotski", udaljenost: 464 },
  { naziv: "Ivanec", udaljenost: 337 },
  { naziv: "Ivanić-Grad", udaljenost: 246 },
  { naziv: "Jastrebarsko", udaljenost: 318 },
  { naziv: "Karlovac", udaljenost: 332 },
  { naziv: "Kastav", udaljenost: 449 },
  { naziv: "Kaštela", udaljenost: 664 },
  { naziv: "Klanjec", udaljenost: 355 },
  { naziv: "Knin", udaljenost: 576 },
  { naziv: "Komiža", udaljenost: 588 },
  { naziv: "Koprivnica", udaljenost: 714 },
  { naziv: "Korčula", udaljenost: 444 },
  { naziv: "Kraljevica", udaljenost: 436 },
  { naziv: "Krapina", udaljenost: 341 },
  { naziv: "Križevci", udaljenost: 319 },
  { naziv: "Krk", udaljenost: 444 },
  { naziv: "Kutina", udaljenost: 205 },
  { naziv: "Kutjevo", udaljenost: 82 },
  { naziv: "Labin", udaljenost: 501 },
  { naziv: "Lepoglava", udaljenost: 355 },
  { naziv: "Lipik", udaljenost: 101 },
  { naziv: "Ludbreg", udaljenost: 209 },
  { naziv: "Makarska", udaljenost: 738 },
  { naziv: "Mali Lošinj", udaljenost: 539 },
  { naziv: "Metković", udaljenost: 422 },
  { naziv: "Mursko Središće", udaljenost: 358 },
  { naziv: "Našice", udaljenost: 54 },
  { naziv: "Nin", udaljenost: 444 },
  { naziv: "Nova Gradiška", udaljenost: 187 },
  { naziv: "Novalja", udaljenost: 588 },
  { naziv: "Novigrad", udaljenost: 528 },
  { naziv: "Novi Marof", udaljenost: 321 },
  { naziv: "Novi Vinodolski", udaljenost: 528 },
  { naziv: "Novska", udaljenost: 187 },
  { naziv: "Obrovac", udaljenost: 485 },
  { naziv: "Ogulin", udaljenost: 385 },
  { naziv: "Omiš", udaljenost: 717 },
  { naziv: "Opatija", udaljenost: 452 },
  { naziv: "Opuzen", udaljenost: 422 },
  { naziv: "Orahovica", udaljenost: 107 },
  { naziv: "Oroslavje", udaljenost: 324 },
  { naziv: "Osijek", udaljenost: 25 },
  { naziv: "Otok", udaljenost: 61 },
  { naziv: "Pazin", udaljenost: 494 },
  { naziv: "Petrinja", udaljenost: 257 },
  { naziv: "Pakrac", udaljenost: 150 },
  { naziv: "Ploče", udaljenost: 485 },
  { naziv: "Pleternica", udaljenost: 107 },
  { naziv: "Poreč", udaljenost: 528 },
  { naziv: "Požega", udaljenost: 101 },
  { naziv: "Pregrada", udaljenost: 345 },
  { naziv: "Prelog", udaljenost: 358 },
  { naziv: "Pula", udaljenost: 545 },
  { naziv: "Rab", udaljenost: 444 },
  { naziv: "Rijeka", udaljenost: 445 },
  { naziv: "Rovinj", udaljenost: 528 },
  { naziv: "Samobor", udaljenost: 302 },
  { naziv: "Senj", udaljenost: 440 },
  { naziv: "Sinj", udaljenost: 688 },
  { naziv: "Sisak", udaljenost: 245 },
  { naziv: "Skradin", udaljenost: 638 },
  { naziv: "Slatina", udaljenost: 101 },
  { naziv: "Slavonski Brod", udaljenost: 95 },
  { naziv: "Slunj", udaljenost: 385 },
  { naziv: "Solin", udaljenost: 687 },
  { naziv: "Split", udaljenost: 687 },
  { naziv: "Stari Grad", udaljenost: 661 },
  { naziv: "Supetar", udaljenost: 661 },
  { naziv: "Sveta Nedelja", udaljenost: 302 },
  { naziv: "Sveti Ivan Zelina", udaljenost: 293 },
  { naziv: "Šibenik", udaljenost: 618 },
  { naziv: "Trogir", udaljenost: 661 },
  { naziv: "Trilj", udaljenost: 691 },
  { naziv: "Umag", udaljenost: 534 },
  { naziv: "Valpovo", udaljenost: 37 },
  { naziv: "Varaždin", udaljenost: 238 },
  { naziv: "Varaždinske Toplice", udaljenost: 254 },
  { naziv: "Velika Gorica", udaljenost: 283 },
  { naziv: "Vinkovci", udaljenost: 42 },
  { naziv: "Virovitica", udaljenost: 124 },
  { naziv: "Vis", udaljenost: 444 },
  { naziv: "Vodice", udaljenost: 617 },
  { naziv: "Vodnjan", udaljenost: 545 },
  { naziv: "Vrbovec", udaljenost: 272 },
  { naziv: "Vrbovsko", udaljenost: 449 },
  { naziv: "Vrgorac", udaljenost: 738 },
  { naziv: "Vrlika", udaljenost: 637 },
  { naziv: "Vukovar", udaljenost: 35 },
  { naziv: "Zabok", udaljenost: 341 },
  { naziv: "Zadar", udaljenost: 571 },
  { naziv: "Zagreb", udaljenost: 283 },
  { naziv: "Zaprešić", udaljenost: 284 },
  { naziv: "Zlatar", udaljenost: 355 },
  { naziv: "Županja", udaljenost: 69 }
];

function udaljenostOdOsijeka(imeGrada) {
  const grad = gradovi.find(
    g => g.naziv.toLowerCase() === imeGrada.toLowerCase()
  );

  if (grad) {
    return grad.udaljenost; 
  } else {
    return Number.MAX_VALUE;
  }
}

function izracunajDostavu(imeGrada) {

    const udaljenost = udaljenostOdOsijeka(imeGrada);

    const trosakPoKm = 1; 

    if (udaljenost === Number.MAX_VALUE) {
        return null;
    }  else {
        const trosak = udaljenost * trosakPoKm;
            // zaokruži na sljedeći cijeli 10 €
            return Math.ceil(trosak / 10) * 10;
    }
}

function getGradovi() {
    return gradovi.map(g => g.naziv);
}

function existsGrad(imeGrada) {
  const value = normalizeString(imeGrada);

  const grad = gradovi.find(g => normalizeString(g.naziv) === value);

  return grad ? grad.naziv : null;
}

function normalizeString(str) {
  return str
    .normalize("NFD")         // razdvaja osnovna slova i dijakritiku
    .replace(/[\u0300-\u036f]/g, "") // uklanja dijakritiku
    .toLowerCase();
}