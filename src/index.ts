import { Professor, Classroom, Course, Lesson, ScheduleConflict, DayOfWeek, TimeSlot, CourseType } from './types';

let professors: Professor[] = [];
let classrooms: Classroom[] = [];
let courses: Course[] = [];
let schedule: Lesson[] = [];


// Додавання професора
function addProfessor(professor: Professor): void {
    professors.push(professor);
    console.log(`Professor ${professor.name} added.`);
}

// Валідація
function validateLesson(lesson: Lesson): ScheduleConflict | null {
    const professorConflict = schedule.find(l => 
        l.professorId === lesson.professorId && 
        l.dayOfWeek === lesson.dayOfWeek && 
        l.timeSlot === lesson.timeSlot
    );

    if (professorConflict) return { type: "ProfessorConflict", lessonDetails: professorConflict };

    const classroomConflict = schedule.find(l => 
        l.classroomNumber === lesson.classroomNumber && 
        l.dayOfWeek === lesson.dayOfWeek && 
        l.timeSlot === lesson.timeSlot
    );

    if (classroomConflict) return { type: "ClassroomConflict", lessonDetails: classroomConflict };

    return null;
}

// Додавання заняття
function addLesson(lesson: Lesson): boolean {
    const conflict = validateLesson(lesson);
    if (conflict) {
        console.error(`Conflict: ${conflict.type}`);
        return false;
    }
    schedule.push(lesson);
    console.log(`Lesson added successfully.`);
    return true;
}

// Пошук вільних аудиторій
function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
    const occupiedClassrooms = schedule
        .filter(l => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
        .map(l => l.classroomNumber);

    return classrooms
        .filter(c => !occupiedClassrooms.includes(c.number))
        .map(c => c.number);
}

// Отримання розкладу викладача
function getProfessorSchedule(professorId: number): Lesson[] {
    return schedule.filter(l => l.professorId === professorId);
}

// Аналіз використання аудиторії
function getClassroomUtilization(classroomNumber: string): number {
    const totalSlots = 25;
    const used = schedule.filter(l => l.classroomNumber === classroomNumber).length;
    
    return Math.round((used / totalSlots) * 100);
}

// Найпопулярніший тип занять
function getMostPopularCourseType(): CourseType {
    const counts: Record<string, number> = { "Lecture": 0, "Seminar": 0, "Lab": 0, "Practice": 0 };
    
    schedule.forEach(l => {
        const course = courses.find(c => c.id === l.courseId);
        if (course) counts[course.type]++;
    });

    let maxType: CourseType = "Lecture";
    let maxCount = 0;

    for (const type in counts) {
        if (counts[type] > maxCount) {
            maxCount = counts[type];
            maxType = type as CourseType;
        }
    }
    return maxType;
}

// Перепризначення аудиторії
function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
    const lesson = schedule.find(l => l.id === lessonId);
    if (!lesson) return false;

    const conflict = schedule.find(l => 
        l.classroomNumber === newClassroomNumber && 
        l.dayOfWeek === lesson.dayOfWeek && 
        l.timeSlot === lesson.timeSlot &&
        l.id !== lessonId
    );

    if (conflict) {
        console.error(`Classroom ${newClassroomNumber} is occupied.`);
        return false;
    }

    lesson.classroomNumber = newClassroomNumber;
    console.log(`Lesson ${lessonId} moved to ${newClassroomNumber}.`);
    return true;
}

// Скасування заняття
function cancelLesson(lessonId: number): void {
    const initialLength = schedule.length;
    schedule = schedule.filter(l => l.id !== lessonId);
    if (schedule.length < initialLength) {
        console.log(`Lesson ${lessonId} cancelled.`);
    }
}

// Наповнюємо даними
professors.push({ id: 1, name: "Ivanenko", department: "IT" });
classrooms.push({ number: "101", capacity: 30, hasProjector: true });
classrooms.push({ number: "102", capacity: 20, hasProjector: false });
courses.push({ id: 100, name: "TypeScript Basics", type: "Lecture" });

// Додаємо заняття
addLesson({
    id: 1,
    courseId: 100,
    professorId: 1,
    classroomNumber: "101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00"
});

// Перевірка на вільні аудиторії
console.log("Вільні аудиторії:", findAvailableClassrooms("8:30-10:00", "Monday"));

// Перевірка статистики
console.log("Завантаженість 101:", getClassroomUtilization("101") + "%");

// Перепризначення аудиторії
reassignClassroom(1, "102");

// Перевірка найпопулярнішого типу
console.log("Найпопулярніший тип занять:", getMostPopularCourseType());

// Скасування заняття
cancelLesson(1);