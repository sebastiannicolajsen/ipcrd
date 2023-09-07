const print = require("./word-printer").print;
const hash = require("hash-it").default;
const fs = require("fs");

const courses = JSON.parse(
    fs.readFileSync("../output/courses_output.json", "utf8")
  );

const length = courses.courses_length;

const file_code = hash(courses.courses);
const output_file = `pretty-print-${file_code}`;

let str = `### Output of ${length} (id '${file_code}')   \n`;
str += print(courses.courses, "\f");

fs.writeFileSync(
    `../output/${output_file}.txt`,
    str,
    "utf8"
  );