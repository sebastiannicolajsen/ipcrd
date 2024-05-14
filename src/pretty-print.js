const print = require("./word-printer").print;
const hash = require("hash-it").default;
const fs = require("fs");

const courses = JSON.parse(
    fs.readFileSync("../output/random-sample-133.json", "utf8")
  );

const length = courses.courses_length;

const file_code = hash(courses.courses);
const output_file = `pretty-print-${file_code}`;

for(let i = 0; i < length; i++){
  const course = courses.courses[i];
  const outputid = `${i+1}-${length}-${hash(course)}`;
  let str = `### Output of ${i+1}/${length} (id '${file_code}')   \n`;
  str += print([course], "\f");
  fs.writeFileSync(
    `../output/files/${outputid}.txt`,
    str,
    "utf8"
  );
}


