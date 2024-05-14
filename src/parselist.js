const fs = require("fs");
const csv = require("csv-parser");

const grid_size = 25;

// comparitor values:

let a = "Planning";

if (process.argv.length >= 3) {
  a = process.argv[2]
};


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

fs.createReadStream("../data/code-query-actual.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {

    const fetchType = (i) => {
      const course = courses[order[i].internal_id];
      return `${course.name} - ${course.educations.map(e => `(${e.title}, ${e.institution.name})`).join(", ")}`
    };

    for (const data of results) {
      const [k, v] = data[""].split("-")[0].split(" : ")
      delete data[""];
      const value = parseInt(v)-1;
      if(value === 108 || value === 29 || value == 65) continue; // skipping irrelevant from working sample
      for (const key of Object.keys(data)) {
        const [_, name] = key.split(" : ");
        if (!results[name]) results[name] = [];
        if (parseInt(data[key]) > 0)
          results[name].push(fetchType(value))
      }
    }

    for(const i of results[a]){
      console.log(`- ${i}`)
    }
  });
