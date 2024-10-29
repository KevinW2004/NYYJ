export interface Course {
    classroom: string;  //教室
    color: string;  //TODO
    //上课时间
    weeks: number[] // 上课周次
    day: number // 星期几
    section: number[] // 第几节
}
export interface CourseInfo{
    key: string;
    name: string; //课程名
    teacher: string; //授课教师

    remark : string; //备注， 课程详细信息
    Courses : Course[];
}

export interface CourseDay {
    day: string;
    courses: Course[];
}
  
export interface Timetable {
    [key: string]: CourseDay;
}  