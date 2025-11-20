// Статус студента
enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled"
}

// Тип курсу
enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special"
}

// Семестр
enum Semester {
    First = "First",
    Second = "Second"
}

// Оцінки
enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

// Факультети
enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering"
}

interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade; // Enum Grade
    date: Date;
    semester: Semester;
}

class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: GradeRecord[] = [];
    
    // Додаткове сховище для реєстрацій: [studentId, courseId]
    private registrations: { studentId: number, courseId: number }[] = [];

    private currentStudentId = 1;
    private currentCourseId = 1;

    // Додавання курсу до системи
    public addCourse(courseData: Omit<Course, "id">): Course {
        const newCourse: Course = {
            id: this.currentCourseId++,
            ...courseData
        };
        this.courses.push(newCourse);
        return newCourse;
    }

    // Зарахування студента
    public enrollStudent(studentData: Omit<Student, "id">): Student {
        const newStudent: Student = {
            id: this.currentStudentId++,
            ...studentData
        };
        this.students.push(newStudent);
        console.log(`[Enroll] Студента ${newStudent.fullName} зараховано на факультет ${newStudent.faculty}.`);
        return newStudent;
    }

    // Реєстрація студента на курс
    public registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student || !course) {
            throw new Error("Студента або курс не знайдено.");
        }

        // Валідація: Чи відповідає факультет
        if (student.faculty !== course.faculty && course.type === CourseType.Mandatory) {
             throw new Error(`[Error] Студент ${student.fullName} не може зареєструватися на обов'язковий курс іншого факультету.`);
        }

        // Валідація: Кількість студентів
        const currentRegistrations = this.registrations.filter(r => r.courseId === courseId).length;
        if (currentRegistrations >= course.maxStudents) {
            throw new Error(`[Error] Курс "${course.name}" заповнений. Реєстрація неможлива.`);
        }

        // Перевірка на дублікат реєстрації
        const alreadyRegistered = this.registrations.some(r => r.studentId === studentId && r.courseId === courseId);
        if (alreadyRegistered) {
            console.log(`Студент вже зареєстрований на цей курс.`);
            return;
        }

        this.registrations.push({ studentId, courseId });
        console.log(`[Register] Студента ${student.fullName} зареєстровано на курс "${course.name}".`);
    }

    // Виставлення оцінки
    public setGrade(studentId: number, courseId: number, grade: Grade): void {
        const isRegistered = this.registrations.some(r => r.studentId === studentId && r.courseId === courseId);
        
        if (!isRegistered) {
            throw new Error(`[Error] Неможливо виставити оцінку: студент не зареєстрований на цей курс.`);
        }

        const course = this.courses.find(c => c.id === courseId);
        
        const newGrade: GradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course ? course.semester : Semester.First
        };

        this.grades.push(newGrade);
        console.log(`[Grade] Виставлено оцінку ${grade} студенту ID:${studentId} за курс ID:${courseId}.`);
    }

    // Оновлення статусу студентавалідацією переходу статусів.
    public updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error("Студента не знайдено.");
        }

        // Валідація
        if (student.status === StudentStatus.Expelled && newStatus === StudentStatus.Active) {
             console.warn(`[Warning] Відновлення відрахованого студента ${student.fullName} потребує наказу ректора.`);
        }

        const oldStatus = student.status;
        student.status = newStatus;
        console.log(`[Status] Статус студента ${student.fullName} змінено з ${oldStatus} на ${newStatus}.`);
    }

    // Отримання студентів за факультетом
    public getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    // Отримання оцінок студента
    public getStudentGrades(studentId: number): GradeRecord[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    // Отримання доступних курсів
    public getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }

    // Розрахунок середнього балу
    public calculateAverageGrade(studentId: number): number {
        const studentGrades = this.getStudentGrades(studentId);
        
        if (studentGrades.length === 0) return 0;

        const sum = studentGrades.reduce((acc, record) => acc + record.grade, 0);
        const average = sum / studentGrades.length;
        
        return parseFloat(average.toFixed(2)); 
    }

    /**
     * Отримання списку відмінників по факультету
     * (Середній бал >= 4.5)
     */
    public getTopStudentsByFaculty(faculty: Faculty): Student[] {
        const facultyStudents = this.getStudentsByFaculty(faculty);
        
        return facultyStudents.filter(student => {
            const avg = this.calculateAverageGrade(student.id);
            return avg >= 4.5 && student.status === StudentStatus.Active;
        });
    }
}


// Тестування системи
try {
    const system = new UniversityManagementSystem();

    // Створення курсів
    const jsCourse = system.addCourse({
        name: "JavaScript Basics",
        type: CourseType.Mandatory,
        credits: 5,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 30
    });

    const econCourse = system.addCourse({
        name: "Microeconomics",
        type: CourseType.Mandatory,
        credits: 4,
        semester: Semester.First,
        faculty: Faculty.Economics,
        maxStudents: 50
    });

    // Зарахування студентів
    const student1 = system.enrollStudent({
        fullName: "Олександр Петренко",
        faculty: Faculty.Computer_Science,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date(),
        groupNumber: "CS-101"
    });

    const student2 = system.enrollStudent({
        fullName: "Марія Іваненко",
        faculty: Faculty.Computer_Science,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date(),
        groupNumber: "CS-101"
    });

    // Реєстрація на курси
    console.log("\n--- Реєстрація ---");
    system.registerForCourse(student1.id, jsCourse.id); // OK
    system.registerForCourse(student2.id, jsCourse.id); // OK
    
    // Спроба зареєструвати студента CS на обов'язковий курс Economics
    try {
        system.registerForCourse(student1.id, econCourse.id);
    } catch (e: any) {
        console.error(e.message);
    }

    // Виставлення оцінок
    console.log("\n--- Оцінювання ---");
    system.setGrade(student1.id, jsCourse.id, Grade.Excellent); // 5
    system.setGrade(student2.id, jsCourse.id, Grade.Good);      // 4

    // Спроба виставити оцінку без реєстрації
    try {
        system.setGrade(student1.id, econCourse.id, Grade.Satisfactory);
    } catch (e: any) {
        console.error(e.message);
    }

    // Оновлення статусу
    console.log("\n--- Зміна статусу ---");
    system.updateStudentStatus(student1.id, StudentStatus.Academic_Leave);

    // Розрахунок середнього балу
    console.log("\n--- Статистика ---");
    console.log(`Середній бал ${student1.fullName}: ${system.calculateAverageGrade(student1.id)}`);
    
    // Додамо ще одну оцінку для студента 1
    system.updateStudentStatus(student1.id, StudentStatus.Active);

    // Додамо новий курс і зареєструємо студента
    const tsCourse = system.addCourse({
        name: "TypeScript Advanced",
        type: CourseType.Optional,
        credits: 3,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 20
    });
    system.registerForCourse(student1.id, tsCourse.id);
    system.setGrade(student1.id, tsCourse.id, Grade.Good); 

    console.log(`Новий середній бал ${student1.fullName}: ${system.calculateAverageGrade(student1.id)}`);

    // Пошук відмінників
    console.log("\n--- Відмінники CS ---");
    const topStudents = system.getTopStudentsByFaculty(Faculty.Computer_Science);
    topStudents.forEach(s => console.log(`${s.fullName} (ID: ${s.id}) - Відмінник`));

} catch (error) {
    console.error("Критична помилка системи:", error);
}