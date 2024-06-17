// to save: node index.js [save]

const fs = require("fs");
const hash = require("hash-it").default;

// ID generators
const _hash = (prefix, obj) => `${prefix}_${hash(obj)}`;
const hash_institution = (institution) => _hash("i", institution.id);
const hash_education = (education) =>  _hash("e", education.title + education.institution);
  
const hash_course = (course) => _hash("c", course.code);

// list to map helper
const pubMap = (list, accessor, hash) => {
  const map = {};
  list.forEach((i) => {
    map[accessor(i)] = i;
    map[accessor(i)].internal_id = hash(i);
  });
  return map;
};

// validator function
const validateEnum = (list, enums, accessor, err) => {
  list.forEach((i) => {
    let value = accessor(i);
    if (!Array.isArray(value)) value = [value];
    for (const v of value) {
      if (!enums.includes(v)) {
        throw new Error(`Invalid value '${v}' for '${err(i)}' (${accessor.toString()})`);
      }
    }
  });
};

// parse initial data
const file_institutions = JSON.parse(
  fs.readFileSync("../data/institutions.json", "utf8")
);
const file_courses = JSON.parse(
  fs.readFileSync("../data/courses.json", "utf8")
);
const file_educations = JSON.parse(
  fs.readFileSync("../data/educations.json", "utf8")
);

const type_enums = file_institutions["type-enums"];
const course_content_type_enums = file_courses["content-type-enums"];
const course_grading_enums = file_courses["grade-enums"];
const education_type_enums = file_educations["type-enums"];

// validate institution type
validateEnum(
  file_institutions.institutions,
  type_enums,
  (i) => i.type,
  (i) => i.id
);

// institutions build
const institutions = pubMap(
  file_institutions.institutions,
  (i) => i.id,
  hash_institution
);

// validate type of educations
validateEnum(
  file_educations.educations,
  education_type_enums,
  (e) => e.type,
  (e) => e.temp_id
);

// educations build
const educations = pubMap(
  file_educations.educations,
  (e) => e.temp_id,
  hash_education
);


// validate courses
validateEnum(
  file_courses.courses,
  course_content_type_enums,
  (c) => c.contents.type,
  (c) => `${c.code} [${c.education_ids}]`
);

// validate grading enums
validateEnum(
  file_courses.courses,
  course_grading_enums,
  (c) => c.exam.grading,
  (c) => `${c.code} [${c.education_ids}]`
);


// stop if not aiming to save:
if (process.argv[2] !== "save") return;

// courses build (for hash assignment for now)
const courses = pubMap(
  file_courses.courses,
  (e) => e.code + `${e.education_ids}`,
  hash_course
);

let ed_count = 0;

for (const c of file_courses.courses) {
  for (const eid of c.education_ids) {
    const e = educations[eid]; 
    const cshallow = { ...c };
    cshallow.education_ids = undefined;
    e.course = cshallow;
    ed_count++;
  }
}

for (const [_, e] of Object.entries(educations)) {
  const inst = institutions[e.institution];
  if (!inst.educations) inst.educations = [];
  const eshallow = { ...e };
  eshallow.temp_id = undefined;
  eshallow.institution = undefined;
  inst.educations.push(eshallow);
}

// reformat institution file to include building keys:
const inst_out = [];
for (const [_, inst] of Object.entries(institutions)) {
  if(!inst.educations) continue;
  inst_out.push(inst);
}

const institution_output = {
  institutions: inst_out,
  institutions_length: inst_out.length,
  educations_length: ed_count
};

// Create course file

const course_output = {
  courses: [],
};

for (const c of file_courses.courses) {
  const cshallow = { ...c };
  cshallow.educations = [];
  for (const ed of cshallow.education_ids) {
    const eshallow = { ...educations[ed] };
    eshallow.course = undefined;
    eshallow.temp_id = undefined;
    const ishallow = { ...institutions[eshallow.institution] };
    ishallow.educations = undefined;
    eshallow.institution = ishallow;
    cshallow.educations.push(eshallow);
  }
  cshallow.education_ids = undefined;

  course_output.courses.push(cshallow);
}

course_output.courses_length = course_output.courses.length;

// save files

fs.writeFileSync(
  "../output/institution_output.json",
  JSON.stringify(institution_output, null, 2),
  "utf8"
);

const string = JSON.stringify(course_output, null, 2);

fs.writeFileSync(
  "../output/courses_output.json",
  string,
  "utf8"
);

fs.writeFileSync(
  "../pages/src/data/courses_output.json",
  string,
  "utf8"
)

fs.copyFileSync("../data/courses.json", "../pages/src/data/courses.txt")

console.log("saved successfully")