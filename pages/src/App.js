import "./App.css";
import DataTable from "react-data-table-component";
import { useState } from "react";
import data from "./data/courses_output.json";
import { MultiSelect } from "react-multi-select-component";
import ReactJson from "react-json-view";
import originalFilePath from "./data/courses.txt";
import { BiEditAlt } from "react-icons/bi";
import { BiMailSend } from "react-icons/bi";
const url =
  "https://github.com/sebastiannicolajsen/ipcrd/blob/main/data/courses.json";

const subjectTag = "[IPCRD]:";


const gradeEnums = {
  point: "7-point scale",
  boolean: "pass / fail",
  unknown: "unknown"
}

const courses = data.courses;

const param = new URLSearchParams(document.location.search).get("inline");
console.log(param);
const isInline = param !== null || param === "true";
console.log(isInline);

let file = null;
async function provideLineLink(course) {
  if (!file) file = await (await fetch(originalFilePath)).text();
  const idstart = file.indexOf(course.code);
  const linestart = file.substring(0, idstart).split("\n").length;
  const idend = file.substring(idstart, file.length - 1).indexOf("internal_id");
  const lineend = file.substring(idstart, idstart + idend).split("\n").length;
  console.log(idstart, linestart, idend, lineend);
  return `${url}#L${linestart - 2}-L${linestart + (lineend - 3)}`;
}

const columns = [
  {
    name: "name",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "educations",
    selector: (row) => row.educations.map((e) => `${e.core_name} (${e.type})`).join(", "),
    sortable: true,
  },
  {
    name: "universities",
    selector: (row) =>
      [...new Set(row.educations.map((e) => e.institution.id))].join(", "),
    sortable: true,
  },
];

const preformat = (str) => str?.toLowerCase().trim();

const flstReduction = (f, lst, str) => {
  if (lst === "unknown") return false;
  return lst
    ? lst.reduce((acc, ele) => acc || f(ele).toLowerCase().includes(str), false)
    : false;
};
const lstReduction = (lst, str) => flstReduction((e) => e, lst, str);

const allowedSearches = [
  "id",
  "code",
  "name",
  "contents",
  "goals",
  "educations",
  "institutions",
  "education type"
];

const dropdownOptions = allowedSearches.map((id) => ({ value: id, label: id }));

const searchAllowed = (group, type, f) => (group.includes(type) ? f() : false);

const searchCourse = (group, str, c) => {
  str = preformat(str);
  return (
    searchAllowed(group, "id", () => preformat(c.internal_id)?.includes(str)) ||
    searchAllowed(group, "code", () => preformat(c.code).includes(str)) ||
    searchAllowed(group, "name", () => preformat(c.name)?.includes(str)) ||
    searchAllowed(group, "contents", () =>
      preformat(c.extended_description)?.includes(str)
    ) ||
    searchAllowed(group, "goals", () =>
      lstReduction(c.contents.objectives, str)
    ) ||
    searchAllowed(group, "goals", () =>
      lstReduction(c.contents.knowledge, str)
    ) ||
    searchAllowed(group, "education type", () => lstReduction( c.educations.map(e => e.type), str)) ||
    searchAllowed(group, "goals", () => lstReduction(c.contents.skills, str)) ||
    searchAllowed(group, "goals", () =>
      lstReduction(c.contents.competences, str)
    ) ||
    searchAllowed(group, "contents", () =>
      lstReduction(c.contents.contents, str)
    ) ||
    searchAllowed(group, "educations", () =>
      flstReduction((e) => e.title, c.educations, str)
    ) ||
    searchAllowed(group, "institutions", () =>
      flstReduction((e) => e.institution.id, c.educations, str)
    ) ||
    searchAllowed(group, "institutions", () =>
      flstReduction((e) => e.institution.name, c.educations, str)
    )
  );
};

const Header = ({ data }) => (
  <div
    style={{
      display: "flex",
      alignContent: "flex-start",
      flexFlow: "column wrap",
      textAlign: "start",
      backgroundColor: "white",
      padding: 10,
    }}
  >
    <div style={{ fontSize: 16 }}>
      <span>{data.name.trim()} </span>
      <span style={{ color: "gray" }}>
        <span>({data.name === data.code ? "Code missing" : data.code})</span>
        <span>
          ,{" "}
          {[
            ...new Set(data.educations.map((e) => e.institution.name.trim())),
          ].join(", ")}
        </span>
        <span style={{ paddingLeft: 10 }}>
          <button
            style={{
              fontSize: 16,
              cursor: "pointer",
              backgroundColor: "#EAEAEA",
              paddingLeft: 5,
              paddingRight: 10,
              color: "gray",
              border: "#FAFAFA",
              borderRadius: 5,
            }}
            onClick={() =>
              provideLineLink(data).then((l) => window.open(l, "_blank"))
            }
          >
            <BiEditAlt /> Edit
          </button>
          <button
            style={{
              fontSize: 16,
              cursor: "pointer",
              backgroundColor: "#EAEAEA",
              paddingLeft: 5,
              paddingRight: 10,
              marginLeft: 10,
              color: "gray",
              border: "#FAFAFA",
              borderRadius: 5,
            }}
          >
            <a
              style={{ color: "gray", textDecoration: "none" }}
              href={`mailto:sebni@itu.dk?subject=${subjectTag}[${data.internal_id}]: Update Suggestion&body=Please write your updates here and provide references (do not change subject of email).`}
            >
              <BiMailSend /> Edit via email
            </a>
          </button>
        </span>
      </span>
      <div style={{ paddingTop: 5, fontSize: 14, color: "#929292" }}>
      {data.educations.map((e) => `${e.core_name} (${e.type})`).join(", ")} | {data.size} ECTS
      </div>
      
    </div>
  </div>
);

const goalTitle = { fontWeight: 500, paddingBottom: 2, paddingTop: 2 };

const flexBox = {
  display: "flex",
  alignContent: "flex-start",
  flexFlow: "column wrap",
  textAlign: "start",
};
const flexElement = {
  paddingBottom: "2px",
  marginTop: "2px",
  borderBottom: "solid #F8F8F8 3px",
  width: "100%",
};

const Exam = ({ data }) => (
  <div style={{ ...flexBox, fontSize: "12px", fontWeight: 400, width: "100%" }}>
    <span style={flexElement}>
      <span style={goalTitle}>Prerequisites</span>
      {": "}
      <span>{data.exam.prerequisites}</span>
    </span>
    <span style={flexElement}>
      <span style={goalTitle}>Type</span>
      {": "}
      <span>{data.exam.type}</span>
    </span>
    <span style={flexElement}>
      <span style={goalTitle}>Grading</span>
      {": "}
      <span>{gradeEnums[data.exam.grading]}</span>
    </span>
    <span style={flexElement}>
      <span style={goalTitle}>Aids</span>
      {": "}
      <span>{data.exam.aids}</span>
    </span>
  </div>
);

const LearningGoals = ({ data }) => (
  <div style={{ ...flexBox, fontSize: "12px", fontWeight: 400 }}>
    {data.contents.type.includes("A") && (
      <>
        {data.contents.objectives.map((o) => (
          <span style={flexElement}>- {o}</span>
        ))}
      </>
    )}
    {data.contents.type.includes("B") && (
      <>
        <span style={goalTitle}>Skills</span>
        {data.contents.skills.map((s) => (
          <span style={flexElement}>- {s}</span>
        ))}
        <span style={goalTitle}>Competencies</span>
        {data.contents.competencies.map((c) => (
          <span style={flexElement}>- {c}</span>
        ))}
        <span style={goalTitle}>Knowledge</span>
        {data.contents.skills.map((k) => (
          <span style={flexElement}>- {k}</span>
        ))}
      </>
    )}
  </div>
);

const Title = () => (
  <div style={{ textAlign: "start", padding: 20 }}>
    <div style={{ fontSize: 20, fontWeight: 500 }}>
      The Introductory Programming Courses and Related Data Initiative
    </div>
    <div style={{ paddingTop: 10 }}>
      The Introductory Programming Courses and Related Data (IPCRD) initiative
      aims to map where, who, and what we teach of programming. <br />
      Currently, the initiative comprises of data from Danish introductory
      courses in all disciplines within tertiary education. <br /> The data is
      maintained by the{" "}
      <a href="https://ccer.itu.dk/ipcrd">
        Center for Computing Education Research at the IT University of
        Copenhagen
      </a>{" "}
      and is publicly available for all in our{" "}
      <a href="https://github.com/sebastiannicolajsen/ipcrd">repository</a>.
      <br /> <br />
      Is a course missing? Either edit the{" "}
      <a href="https://github.com/sebastiannicolajsen/ipcrd">repository</a> or
      submit a request{" "}
      <a
        href={`mailto:sebni@itu.dk?subject=${subjectTag} Adding Course&body=[insert course link in brackets]`}
      >
        here
      </a>
      .
    </div>
  </div>
);

const ExpandedComponent = ({ data }) => (
  <div
    style={{
      backgroundColor: "#FCFCFC",
      display: "flex",
      paddingTop: 10,
      paddingLeft: 10,
      flexDirection: "column",
      alignContent: "flex-start",
      fontSize: 12,
    }}
  >
    <Header data={data} />

    <div
      style={{
        display: "flex",
        alignContent: "flex-start",
        flexFlow: "row",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          backgroundColor: "#FEFEFE",
          display: "flex",
          alignContent: "flex-start",
          flexFlow: "column wrap",
          textAlign: "start",
          padding: "10px",
          margin: "15px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500" }}>
          Learning goals
        </span>
        <LearningGoals data={data} />
      </div>
      <div>
        <div
          style={{
            backgroundColor: "#FEFEFE",
            display: "flex",
            alignContent: "flex-start",
            flexFlow: "column wrap",
            textAlign: "start",
            padding: "10px",
            margin: "15px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            Exam information
          </span>
          <Exam data={data} />
        </div>
        <div
          style={{
            backgroundColor: "#FEFEFE",
            display: "flex",
            alignContent: "flex-start",
            flexFlow: "column wrap",
            textAlign: "start",
            padding: "10px",
            margin: "15px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            Extended description
          </span>
          <div>{data.extended_description}</div>
        </div>
      </div>
    </div>
    <div
      style={{
        backgroundColor: "#FEFEFE",
        display: "flex",
        alignContent: "flex-start",
        flexFlow: "column wrap",
        textAlign: "start",
        padding: "10px",
        margin: "15px",
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: "500" }}>Raw data</span>
      <ReactJson src={data} collapsed={true} />
    </div>
  </div>
);

function App() {
  const [search, setSearch] = useState("");
  const [shownCourses, setShownCourses] = useState([...courses]);
  const [enabledSearches, setEnabledSearches] = useState([...dropdownOptions]);

  const handleSearch = () => {
    setShownCourses([
      ...courses.filter((c) =>
        searchCourse(
          enabledSearches.map((e) => e.value),
          search,
          c
        )
      ),
    ]);
  };

  return (
    <div className="App" style={ !isInline ? {width: "80%", marginLeft: "auto", marginRight: "auto"} : {}}>
      <div>
        {!isInline && (
          <div>
            <Title />
          </div>
        )}
        <div>
          <div
            style={{
              display: "flex",
              alignContent: "row",
              padding: 15,
              fontSize: 15,
            }}
          >
            <input
              style={{
                fontSize: 16,
                height: "2.25em",
                marginRight: 5,
                marginTop: 0,
                marginBottom: 1,
                border: "solid 1px #CACACA",
                borderRadius: 4,
              }}
              type="text"
              value={search}
              placeholder="Search..."
              onInput={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSearch() : false)}
            />
            <span style={{ width: "10em" }}>
              <MultiSelect
                style={{ margin: 5 }}
                options={dropdownOptions}
                value={enabledSearches}
                onChange={setEnabledSearches}
              />
            </span>
            <input
              style={{
                fontSize: 16,
                height: "2.5em",
                marginLeft: 5,
                marginTop: 0,
                backgroundColor: "#FAFAFA",
                marginBottom: 1,
                border: "solid 1px #CACACA",
                borderRadius: 4,
                hover: {
                  backgroundColor: "#BABABA",
                },
              }}
              type="button"
              onClick={handleSearch}
              value="search"
            />
          </div>
        </div>
        <div style={{ minHeight: 150 }}>
          <DataTable
            columns={columns}
            data={isInline ? shownCourses.slice(0, 5) : shownCourses}
            pagination={!isInline}
            expandableRows={!isInline}
            expandableRowsComponent={ExpandedComponent}
          />
        </div>

        {isInline && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 150,
              top: "-150px",
              background: "rgb(255,255,255)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div style={{ position: "relative", top: 175, color: "#929292" }}>
              The complete data set is available{" "}
              <a
                style={{ opacity: "75%" }}
                target="_blank"
                rel="noreferrer"
                href="https://sebastiannicolajsen.github.io/ipcrd/"
              >
                here
              </a>
              .
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
