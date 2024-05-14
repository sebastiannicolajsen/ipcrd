const { createCanvas } = require("canvas");
const fs = require("fs");


const grid_size = 10;
const font = 'bold 50px Times New Roman'

const edu_dist = {
  "Audio-visuel teknik og medieproduktion": 14,
  "Erhvervsøkonomi, administration og jura": 138,
  "Teknik, teknologi og industriel produktion": 198,
  "Samfundsvidenskab": 108,
  "Landbrug og dyrepasning": 1,
  "Jordbrug, skovbrug og fiskeri": 36,
  "Undervisning og læring": 53,
  "Humanistisk": 163,
  "Naturvidenskab": 107,
  "Kunstnerisk": 49,
  "Bygge- og anlægsteknik": 30,
  "Service": 15,
  "Social og sundhed": 90,
  "#N/A":4,
  "Informations- og kommunikationsteknologi (IKT)": 91,
  "Gymnasiale uddannelser": 42,
  "Forsvar, politi og sikkerhed": 1,
  "Mekanik, jern og metal": 15,
  "Forberedende uddannelser": 4,
  "Studiefag uoplyst": 6,
  "Transport": 4,
};

const map1 = {
  "Audio-visuel teknik og medieproduktion": "Audio-visual technology and media production",
  "Erhvervsøkonomi, administration og jura": "Business economics, administration and law",
  "Teknik, teknologi og industriel produktion": "Engineering, technology and industrial production",
  Samfundsvidenskab: "Social science",
  "Landbrug og dyrepasning": "Farming and animal care",
  "Jordbrug, skovbrug og fiskeri": "Agriculture, forestry and fishing",
  "Undervisning og læring": "Teaching and learning",
  Humanistisk: "Humanities",
  Naturvidenskab: "Natural science",
  Kunstnerisk: "Artistic",
  "Bygge- og anlægsteknik": "Building and construction engineering",
  Service: "Service",
  "Social og sundhed": "Social and health",
  "#N/A": "Not available",
  "Informations- og kommunikationsteknologi (IKT)": "Information and Communication Technology (ICT)",
  "Gymnasiale uddannelser": "Secondary education",
  "Forsvar, politi og sikkerhed": "Defence, police and security",
  "Mekanik, jern og metal": "Mechanics, iron and metal",
  "Forberedende uddannelser": "Preparatory courses",
  "Studiefag uoplyst": "Study subject unspecified",
  Transport: "Transportation",
};

const map2 = {
    "BSC": "Bachelor's degree",
    "DPBSC": "Professional bachelor's degree / Bachelor of Engineering",
    MSC: "Master's degree"
}

const windowy = 10000;
const windowx = 2000;

const canvas = createCanvas(windowx, windowy);
const ctx = canvas.getContext("2d");

ctx.font = font

ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, windowx, windowy);

const institutions = JSON.parse(
  fs.readFileSync("../output/institution_output.json", "utf8")
).institutions;

const types = JSON.parse(fs.readFileSync("../data/types.json")).types;

const output = {
  "#N/A": {
    ids: [],
    value: 0,
  },
};

let sorted = undefined;

const f1 = () => {
  for (const t of types) {
    output[t] = {
      ids: [],
      value: 0,
    };
  }

  for (const inst of institutions) {
    for (const edu of inst.educations) {
      output[edu.edu_type].value++;
      output[edu.edu_type].ids.push(edu);
    }
  }
//   for(const o of Object.keys(output)){
//     console.log(o, ",", output[o].value)
//   }
};

const f2 = () => {
  for (const inst of institutions) {
    for (const edu of inst.educations) {
      if (!output[edu.type]) output[edu.type] = { value: 0, ids: [] };
      output[edu.type].value++;
      output[edu.type].ids.push(edu);
    }
  }
};

const f3 = () => {
  for (const inst of institutions) {
    output[inst.name] = { value: 0, ids: [] };
    for (const edu of inst.educations) {
      output[inst.name].value++;
      output[inst.name].ids.push(edu);
    }
  }
};

const render1 = () => {
  sorted = Object.keys(output)
    .map((k) => [k, output[k]])
    .sort((a, b) => edu_dist[b[0]] - edu_dist[a[0]]);

  sorted = sorted.sort(
    (a, b) => b[1].value / edu_dist[b[0]] - a[1].value / edu_dist[a[0]]
  );

  const size = 50;
  let inity = 1;
  let initx = 0;
  const leftb = 50;
  const gspace = 1.2;

  let b = 0;
  let tmp = 0;
  for (let kv of sorted) {
    tmp = inity;
    ctx.fillStyle = "rgba(0,0,0,1)";
    const [k, d] = kv;
    const v = d.value;
    inity += 140;

    let name = map1[k]
    const limit = 30
    const split = name.length >= limit
    let buffer = ""
    if(split){
      const words = name.split(" ");
      let i = 0;
      let c = 0;
      while (c < limit && i < words.length) {
        c += words[i].length;
        i++;
      }
      words[i - 1] = "\n" + words[i - 1];
      buffer = words.slice(i - 1, words.length + 1).join(" ") + " ";
      name = words.join(" ");
    }

    const txt = `${Math.floor(
      (v / edu_dist[k]) * 100.0
    )}% ${name} `
    
    ctx.fillText(txt, initx+leftb, inity)
    const mtext = ctx.measureText(split ?  buffer : txt);
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillText(`${split ? "\n" : ""}(${v} / ${edu_dist[k]})`, initx + leftb + mtext.width, inity + (split ? 1 : 0));
    let aj = 0;
    inity += split ? 110 : 55;
    for (let j = 1; j <= edu_dist[k]; j++) {
      // j <= ctrl[z]
      if (aj >= grid_size) {
        aj = 0;
        inity += size * gspace;
      }
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(initx + leftb + aj * size * gspace, inity, size, size);
      ctx.fillStyle = j <= v ? 'rgba(209,104,66,0.8)' : 'rgba(255,255,255,1)';
      ctx.fillRect(initx + leftb + aj * size * gspace + (size*0.02), inity + (size*0.02), size - (size*0.04), size - (size*0.04));
      

      aj++;
    }
    b++;
  }
};

const render2 = (map) => {
  sorted = Object.keys(output)
    .map((k) => [k, output[k]])
    .sort((a, b) => b[1].value - a[1].value);

 if(!map) {
    map = []
    for(const [k, v] of sorted){
        map[k] = k
    }
 }

  const size = 50;
  let inity = 1;
  let initx = 0;
  const leftb = 50;
  const gspace = 1.2;

  const total = sorted.map(a => a[1].value).reduce((a,b) => a +b, 0)
  const pct = (a) => `${Math.floor(a / total * 100)}%`

  let b = 0;
  let tmp = 0;
  for (let kv of sorted) {
    tmp = inity;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    const [k, d] = kv;
    const v = d.value;
    inity += 140;
    const txt = `${pct(v)} ${map[k]} `
    ctx.fillText(txt, initx+leftb, inity)
    const mtext = ctx.measureText(txt);
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillText(`(${v} / ${total})`, initx + leftb + mtext.width, inity);
    let aj = 0;
    inity += 25;
    for (let j = 1; j <= v; j++) {
      if (aj >= grid_size) {
        aj = 0;
        inity += size * gspace;
      }
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(initx + leftb + aj * size * gspace, inity, size, size);
      ctx.fillStyle = 'rgba(209,104,66,0.8)' ;
      ctx.fillRect(initx + leftb + aj * size * gspace + (size*0.02), inity + (size*0.02), size - (size*0.04), size - (size*0.04));
      aj++;
    }
    b++;
  }
};

let name = "image"

const write =  () => {
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`./${name}.png`, buffer);
}

const edutype = () => {
  f1();
  render1();
  name = "discipline3"
  write()
};
const type = () => {
  f2();
  render2(map2);
  name = "education-level3"
  write()
};
const inst = () => {
  f3();
  render2();
  name = "institution3"
  write()
};

type()




