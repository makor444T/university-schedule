export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type TimeSlot = "8:30-10:00" | "10:15-11:45" | "12:15-13:45" | "14:00-15:30" | "15:45-17:15";
export type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

// a) Професор
export type Professor = {
    id: number;
    name: string;
    department: string;
};

// b) Аудиторія
export type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

// c) Курс (предмет)
export type Course = {
    id: number;
    name: string;
    type: CourseType;
};

// d) Заняття в розкладі
export type Lesson = {
    id: number; 
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

// Тип для конфліктів
export type ConflictType = "ProfessorConflict" | "ClassroomConflict";

export type ScheduleConflict = {
    type: ConflictType;
    lessonDetails: Lesson;
};