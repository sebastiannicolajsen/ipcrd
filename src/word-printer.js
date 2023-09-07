const output_delimiter = "---"

function print(courses, course_break = "\n\n"){
    let str = "";

    const isArray = (input, f) =>  {
        if(!Array.isArray(input)){
            return input;
        } else { 
            let str = ""
            for(const i of input){
                str += f(i) + "\n";
            }
            return str;
    }}

    for(const course of courses){
        str += course_break + output_delimiter + output_delimiter + "\n\n"
        str += `Course '${course.name}' (${course.code} / ${course.internal_id}) \n` + output_delimiter + `\n`
        str += `Responsible(s): \n`
    
    
        const f = (t) => t === "unknown" || t === "none" ? " - " + t : ` - ${t.name}, ${t.position} (${t.email} / ${t.internal_id}) [${t.departments.join(" ; ")}]`
        str += isArray(course.teachers.responsible, f)
    
        str += "Teacher(s): \n"
        str += isArray(course.teachers.teachers, f);
    
        if(course.contents.type.includes("B")){
            str += output_delimiter + `\n`   
            str += 'Knowledge\n' 
            str += isArray(course.contents.knowledge, (k) => " - " + k);
    
            str += 'Skills\n'
            str += isArray(course.contents.skills, (s) => " - " + s);
    
            str += 'Competences\n'
            str += isArray(course.contents.competences, (c) => " - " + c);

        }
        if(course.contents.type.includes("A")){
            str += output_delimiter + "\n";
            str += "Objectives\n"
            str += isArray(course.contents.objectives, (o) => " - " + o);
        }
    
        str += output_delimiter + "\n";
        str += "Contents\n"
        str += isArray(course.contents.contents, (c) => " - " + c);
    
        str += output_delimiter + "\n";
        str += "Extended description\n";
        str += " - " + course.extended_description + "\n";
    
        str += output_delimiter + "\n";
        str += "Educations\n";
        str += isArray(course.educations, (e) => ` - '${e.title}' (${e.core_name}) at '${e.institution.name}' (${e.institution.id})`);
    }
    return str;
}

exports.print = print;