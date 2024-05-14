const { randomInt } = require("crypto");
const fs = require("fs");
const print = require("./word-printer").print;


const sample_size = 1; // %


const courses = JSON.parse(
    fs.readFileSync("../output/courses_output.json", "utf8")
  );

const length = courses.courses_length;
const size = Math.ceil(sample_size*length);

const output_file = `random-sample-${size}`;

console.log(`Sampling ${size} of ${length}.`)

const set = new Set();
let i = 0;
while(i < size){
    const course = courses.courses[randomInt(length)];
    if(!set.has(course)){
        set.add(course);
        i++;
    }
}

const output =  {
    sample_size: size,
    courses_length: length,
    courses: Array.from(set)
}
  
fs.writeFileSync(
    `../output/${output_file}.json`,
    JSON.stringify(output, null, 2),
    "utf8"
  );


if (process.argv[2] !== "print") return;


let str = `Output sample (${size} / ${length}) \n`;

str += print(output.courses);

console.log(str)
    

