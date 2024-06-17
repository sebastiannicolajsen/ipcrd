const { createCanvas } = require("canvas");
const fs = require("fs");
const csv = require("csv-parser");

const grid_size = 10;
const font = 'bold 50px Times New Roman'

// comparitor values:

let a = "Planning";
let b = "";

if (process.argv.length >= 3) {
  a = process.argv[2];
  if (process.argv.length >= 4) {
    b = process.argv[3];
  }
}

const codes = {
  Samfundsvidenskab: 9,
  "Teknik, teknologi og industriel produktion": 57,
  Naturvidenskab: 45,
  "Social og sundhed": 1,
  "Jordbrug, skovbrug og fiskeri": 8,
  "Erhvervsøkonomi, administration og jura": 8,
  "Bygge- og anlægsteknik": 3,
  "Mekanik, jern og metal": 8,
  "Informations- og kommunikationsteknologi (IKT)": 40,
};

const map1 = {
  "Audio-visuel teknik og medieproduktion":
    "Audio-visual technology and media production",
  "Erhvervsøkonomi, administration og jura":
    "Business economics, administration and law",
  "Teknik, teknologi og industriel produktion":
    "Engineering, technology and industrial production",
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
  "Informations- og kommunikationsteknologi (IKT)":
    "Information and Communication Technology (ICT)",
  "Gymnasiale uddannelser": "Secondary education",
  "Forsvar, politi og sikkerhed": "Defence, police and security",
  "Mekanik, jern og metal": "Mechanics, iron and metal",
  "Forberedende uddannelser": "Preparatory courses",
  "Studiefag uoplyst": "Study subject unspecified",
  Transport: "Transportation",
};

const window = 7000;

const canvas = createCanvas(window, window);
const ctx = canvas.getContext("2d");
ctx.font = font

ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, window, window);

let tmpCourses = JSON.parse(
  fs.readFileSync("../output/courses_output.json")
).courses;
let courses = {};

const order = JSON.parse(
  fs.readFileSync("../output/working-sample.json")
).courses;

for (const course of tmpCourses) {
  courses[course.internal_id] = course;
}

const results = [];

fs.createReadStream("../data/code-query-corrected-1.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {
    const fetchType = (i) => {
      const edus = courses[order[i].internal_id].educations;
      const res = edus.map((e) => [e.edu_type, e.internal_id]);
      return res;
    };

    for (const data of results) {
      const [k, v] = data[""].split("-")[0].split(" : ");
      delete data[""];
      const value = parseInt(v) - 1;
      if (value === 108 || value === 29 || value == 65) continue; // skipping irrelevant from working sample
      for (const key of Object.keys(data)) {
        const [_, name] = key.split(" : ");
        if (!results[name]) results[name] = [];
        if (parseInt(data[key]) > 0)
          results[name] = [...results[name], ...fetchType(value)];
      }
    }

    const f = (key) => {
      const output = {};
      for (const item of results[key]) {
        const [cat, id] = item;
        if (!output[cat])
          output[cat] = {
            value: 0,
            ids: [],
          };
        output[cat].value++;
        output[cat].ids.push(id);
      }

      return output;
    };

    // modifies input
    const comp = (a, b) => {
      const output = {};
      for (const ka of Object.keys(a)) {
        const av = a[ka];
        const bv = b[ka];
        if (bv) {
          const intersection = bv.ids.filter((v) => av.ids.includes(v));
          const inboth = intersection.length;
          av.value -= inboth;
          bv.value -= inboth;
          output[ka] = { value: inboth, ids: intersection };
        }
      }
      return output;
    };

    const bexist = b !== "";

    const outputa = f(a);
    const outputb = bexist ? f(b) : 0;
    const outputc = bexist ? comp(outputa, outputb) : 0;

    const render = () => {
      const size = 50;
      let inity = 50;
      let initx = 0;
      const leftb = 50;
      const gspace = 1.2;

      let v = {
        0: "rgba(181,117,100,1)",
        1: "rgba(61 ,3,0, 1)",
        2: "rgba(214, 209, 177, 1)",
        3: "rgba(255,255,255,1)",
      };

      const paint = (i, txt) => {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(initx + leftb, inity, size, size);
        ctx.fillStyle = v[i];
        ctx.fillRect(leftb + initx + 1, inity + 1, size - 2, size - 2);

        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillText(txt, initx + leftb + size + 5, inity + size * 0.9);
      };

      paint(0, `"${a}"`);
      if (bexist) {
        initx += ctx.measureText(`"${a}"`).width + 100;
        paint(1, "Both codes");
        initx += ctx.measureText("Both codes").width + 100;
        paint(2, `"${b}"`);
        inity += 110;
        initx = 0;
        paint(3, "Education introducing programming without association to the codes.");
      } else { 
        initx += ctx.measureText(`"${a}"`).width + 100;
        paint(3, "Education introducing programming without association to the codes.");
      }

      inity += 50;

      const sorted = Object.keys(codes).sort((a, b) => codes[b] - codes[a]);
      console.log(sorted);

      for (let k of sorted) {
        ctx.fillStyle = "rgba(0,0,0,1)";
        const barriers = {
          0: outputa[k] ? outputa[k].value : 0,
          1: bexist ? (outputc[k] ? outputc[k].value : 0) : 0,
          2: bexist ? (outputb[k] ? outputb[k].value : 0) : 0,
          3: Number.MAX_VALUE,
        };

        let barrierc = 0;
        let barrieri = 0;
        inity += 140;

        let name = map1[k];
        const limit = 30;
        const split = name.length >= limit;
        let buffer = "";
        if (split) {
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

        console.log(name, name.length)

        const txt = `${name}`;
        const mtxt = ctx.measureText(split ? buffer : name);
        ctx.fillText(txt, initx + leftb, inity);

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        const txt2 = `${split ? "\n" : ""} (${
          bexist ? barriers[0] : `${Math.round(barriers[0]/codes[k]*100)}% - ${barriers[0]}`
        }${
          bexist ? `/${barriers[1]}/${barriers[2]}` : ""
        })`;
        ctx.fillText(txt2, initx + leftb + mtxt.width, inity + (split ? 2 : 0));
        inity += split ? 110 : 55 ;

        let aj = 0;
        for (let j = 1; j <= codes[k]; j++) {
          if (aj >= grid_size) {
            aj = 0;
            inity += size * gspace;
          }

          while (barrieri >= barriers[barrierc]) {
            barrierc++;
            barrieri = 0;
          }

          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.fillRect(initx + leftb + aj * size * gspace, inity, size, size);
          ctx.fillStyle = v[barrierc];
          ctx.fillRect(
            initx + leftb + aj * size * gspace + (size*0.02),
            inity + (size*0.02),
            size - (size*0.04),
            size - (size*0.04)
          );

          barrieri++;
          aj++;
        }
      }
    };

    render();
    let name = `[${a}]-[${b}]`;

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./comparison-${name}.png`, buffer);
  });
