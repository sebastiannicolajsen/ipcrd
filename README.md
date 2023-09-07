# Introductory Programming Courses and Related Data (IPCRD)

A dataset containing a snapshot of all introductory programming courses in Denmark from March 2023 and related data, i.e., institution and teachers. The generated data set is currently work in progress (and partially in Danish). To view aggregated data, see `./output` or the liveview [here](https://sebastiannicolajsen.github.io/ipcrd/).

The data set exclusively contains information from further (tertiary) education, i.e., 'Videregående uddannelser' due to the availability of such data.

Below you find various enumerations used within the data set (related to the different data structures).

## Courses

### Type enums
- A: Uses ILOs to describe course outcome.
- B: Uses 'knowledge', 'skills', and 'competencies' to describe course outcome.
- AB: Combines A and B to describe course outcome.

### Grade enums
- boolean: Uses a pass / fail approach to grading.
- point: Uses the Danish 7-point scale to grade.
- unknown: the grading strategy is not known.

## Educations

### Type enums
- BSC: A bachelor programme.
- DPBSC: A bachelor of Engineering or other professional bachelor programme.
- MSC: A masters programme.

## Institutions

### Type enums
- U: University
- UC: University College
- VE: Vocational Education
- BA: Business Academy

## People

Information on people are obtained through institutional 'pure' sites. For UC institutions, 'uc-viden' was utilised. The different abbreviations (enums) are explained below.

### Position enums
- Unknown: The position is unknown
- RA: Research Assistant
- PL: Part-time Lecturer
- EL: External Lecturer
- T: Teacher
- GR: Guest Researcher
- PHD: PhD Student
- PD: Post Doctoral Researcher
- ID: 'Ingeniør Docent'
- R: Researcher
- SR: Senior Researcher
- SAP: 'Studielektor'
- AM: 'Akademisk medarbejder'
- ASP: Assistant Professor
- AP: Associate Professor
- FP: Full Professor
- HoD: Head of Department
- HoC: Head of Center
