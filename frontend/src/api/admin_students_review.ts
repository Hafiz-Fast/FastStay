import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_STUDENT_PROFILE = (id: number) => `cache:admin:student:profile:${id}`;

// --- RAW API RESPONSE INTERFACES ---

// 1. Raw Student Demographic Details from DisplayStudent API (POST)
export interface RawStudentDetail {
    p_Semester: number;
    p_Department: string;
    p_Batch: number;
    p_RoomateCount: number;
    p_UniDistance: number;
    p_isAcRoom: boolean;
    p_isMess: boolean;
    p_BedType: string;
    p_WashroomType: string;
}

// 2. Response structure for Display Student API
export interface StudentDetailApiResponse {
    success: boolean;
    result: RawStudentDetail;
}

// 3. Request body for Display Student API
export interface StudentDetailRequest {
    p_StudentId: number;
}

// 4. Raw User Data from users/all/ API (GET)
export interface RawUser {
    userid: number;
    loginid: number;
    usertype: string;
    fname: string;
    lname: string;
    age: number;
    gender: string;
    city: string;
}

// 5. Response structure for Users API
export interface UsersApiResponse {
    users: RawUser[];
}

// --- FRONTEND DATA INTERFACES ---

// 6. Combined Student Profile for display in React components
export interface StudentProfile {
    // From users/all API
    userId: number;
    loginId: number;
    userType: string;
    firstName: string;
    lastName: string;
    fullName: string;
    age: number;
    gender: string;
    city: string;

    // From DisplayStudent API
    semester: number;
    department: string;
    batch: number;
    roommateCount: number;
    universityDistance: number;
    isAcRoom: boolean;
    isMess: boolean;
    bedType: string;
    washroomType: string;
}

// 7. Student Table Row for list view
export interface StudentTableRow {
    id: number;               // userid
    name: string;             // fname + lname
    age: number;
    gender: string;
    city: string;
    semester: number;
    department: string;
    batch: number;
    roommateCount: number;
    universityDistance: number;
    hasAcRoom: boolean;
    hasMess: boolean;
    bedType: string;
    washroomType: string;
}

// --- API FUNCTIONS ---

/**
 * Fetches student demographic details by student ID
 * @param studentId - The ID of the student
 * @returns Promise with student details or null if not found
 */
export const getStudentDetailsById = async (studentId: number): Promise<RawStudentDetail | null> => {
    try {
        const response = await axios.post<StudentDetailApiResponse>(
            `${API_BASE_URL}/faststay_app/UserDetail/display/`,
            { p_StudentId: studentId }
        );

        if (response.data.success && response.data.result) {
            return response.data.result;
        }
        return null;
    } catch (error: unknown) {
        console.error(`Error fetching student details for ID ${studentId}:`, error);

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error("Axios error:", {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message
            });
        }
        return null;
    }
};

/**
 * Fetches all users from the system
 * @returns Promise with array of all users
 */
export const getAllUsers = async (): Promise<RawUser[]> => {
    try {
        const response = await axios.get<UsersApiResponse>(
            `${API_BASE_URL}/faststay_app/users/all/`
        );
        return response.data.users || [];
    } catch (error: unknown) {
        console.error("Error fetching users:", error);

        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        }
        return [];
    }
};

/**
 * Fetches a single user by user ID
 * @param userId - The ID of the user to fetch
 * @returns Promise with user data or null if not found
 */
export const getUserById = async (userId: number): Promise<RawUser | null> => {
    try {
        const users = await getAllUsers();
        return users.find(user => user.userid === userId) || null;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        return null;
    }
};

/**
 * Fetches all students (users with usertype = 'Student')
 * @returns Promise with array of student users
 */
export const getAllStudents = async (): Promise<RawUser[]> => {
    try {
        const users = await getAllUsers();
        return users.filter(user => user.usertype.toLowerCase() === 'student');
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
};

/**
 * Fetches complete student profile by student ID (combines user info + student details)
 * @param studentId - The ID of the student
 * @returns Promise with complete student profile or null if not found
 */
export const getStudentProfile = async (studentId: number, bypassCache = false): Promise<StudentProfile | null> => {
    if (!bypassCache) {
        const cached = cacheGet<StudentProfile>(CACHE_STUDENT_PROFILE(studentId));
        if (cached) return cached;
    }
    try {
        const [userData, studentDetails] = await Promise.all([
            getUserById(studentId),
            getStudentDetailsById(studentId)
        ]);

        // Check if both data sources are available
        if (!userData) {
            console.warn(`User with ID ${studentId} not found`);
            return null;
        }

        if (!studentDetails) {
            console.warn(`Student details for ID ${studentId} not found`);
            return null;
        }

        // Combine the data
        const profile: StudentProfile = {
            // User data
            userId: userData.userid,
            loginId: userData.loginid,
            userType: userData.usertype,
            firstName: userData.fname,
            lastName: userData.lname,
            fullName: `${userData.fname} ${userData.lname}`,
            age: userData.age,
            gender: userData.gender,
            city: userData.city,

            // Student details
            semester: studentDetails.p_Semester,
            department: studentDetails.p_Department,
            batch: studentDetails.p_Batch,
            roommateCount: studentDetails.p_RoomateCount,
            universityDistance: studentDetails.p_UniDistance,
            isAcRoom: studentDetails.p_isAcRoom,
            isMess: studentDetails.p_isMess,
            bedType: studentDetails.p_BedType,
            washroomType: studentDetails.p_WashroomType
        };
        cacheSet(CACHE_STUDENT_PROFILE(studentId), profile);
        return profile;
    } catch (error) {
        console.error(`Error fetching complete student profile for ID ${studentId}:`, error);
        return null;
    }
};

/**
 * Fetches all students with their complete details for table view
 * @returns Promise with array of student table rows
 */
export const getAllStudentsTableData = async (): Promise<StudentTableRow[]> => {
    try {
        // Get all students (users with usertype = 'Student')
        const students = await getAllStudents();

        // Fetch details for each student in parallel
        const studentPromises = students.map(async (student) => {
            const details = await getStudentDetailsById(student.userid);

            if (!details) {
                // Return minimal info if details not found
                return {
                    id: student.userid,
                    name: `${student.fname} ${student.lname}`,
                    age: student.age,
                    gender: student.gender,
                    city: student.city,
                    semester: 0,
                    department: "Not Available",
                    batch: 0,
                    roommateCount: 0,
                    universityDistance: 0,
                    hasAcRoom: false,
                    hasMess: false,
                    bedType: "Not Available",
                    washroomType: "Not Available"
                };
            }

            return {
                id: student.userid,
                name: `${student.fname} ${student.lname}`,
                age: student.age,
                gender: student.gender,
                city: student.city,
                semester: details.p_Semester,
                department: details.p_Department,
                batch: details.p_Batch,
                roommateCount: details.p_RoomateCount,
                universityDistance: details.p_UniDistance,
                hasAcRoom: details.p_isAcRoom,
                hasMess: details.p_isMess,
                bedType: details.p_BedType,
                washroomType: details.p_WashroomType
            };
        });

        const studentTableRows = await Promise.all(studentPromises);
        return studentTableRows;
    } catch (error) {
        console.error("Error fetching all students table data:", error);
        return [];
    }
};

/**
 * Searches students by name, department, or city
 * @param searchTerm - The term to search for
 * @returns Promise with array of matching students
 */
export const searchStudents = async (searchTerm: string): Promise<StudentTableRow[]> => {
    try {
        const allStudents = await getAllStudentsTableData();
        const term = searchTerm.toLowerCase().trim();

        if (!term) return allStudents;

        return allStudents.filter(student =>
            student.name.toLowerCase().includes(term) ||
            student.department.toLowerCase().includes(term) ||
            student.city.toLowerCase().includes(term) ||
            student.bedType.toLowerCase().includes(term) ||
            student.washroomType.toLowerCase().includes(term) ||
            student.gender.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error("Error searching students:", error);
        return [];
    }
};

/**
 * Filters students by department
 * @param department - The department to filter by
 * @returns Promise with array of students in the department
 */
export const getStudentsByDepartment = async (department: string): Promise<StudentTableRow[]> => {
    try {
        const allStudents = await getAllStudentsTableData();
        return allStudents.filter(student =>
            student.department.toLowerCase() === department.toLowerCase()
        );
    } catch (error) {
        console.error(`Error filtering students by department ${department}:`, error);
        return [];
    }
};

/**
 * Filters students by semester range
 * @param minSemester - Minimum semester (inclusive)
 * @param maxSemester - Maximum semester (inclusive)
 * @returns Promise with array of students in the semester range
 */
export const getStudentsBySemesterRange = async (
    minSemester: number,
    maxSemester: number
): Promise<StudentTableRow[]> => {
    try {
        const allStudents = await getAllStudentsTableData();
        return allStudents.filter(student =>
            student.semester >= minSemester && student.semester <= maxSemester
        );
    } catch (error) {
        console.error(`Error filtering students by semester range ${minSemester}-${maxSemester}:`, error);
        return [];
    }
};

/**
 * Filters students by AC room preference
 * @param hasAcRoom - Whether the student requires AC room
 * @returns Promise with array of students with AC preference
 */
export const getStudentsByAcPreference = async (hasAcRoom: boolean): Promise<StudentTableRow[]> => {
    try {
        const allStudents = await getAllStudentsTableData();
        return allStudents.filter(student => student.hasAcRoom === hasAcRoom);
    } catch (error) {
        console.error(`Error filtering students by AC preference ${hasAcRoom}:`, error);
        return [];
    }
};

/**
 * Filters students by mess requirement
 * @param hasMess - Whether the student requires mess
 * @returns Promise with array of students with mess requirement
 */
export const getStudentsByMessRequirement = async (hasMess: boolean): Promise<StudentTableRow[]> => {
    try {
        const allStudents = await getAllStudentsTableData();
        return allStudents.filter(student => student.hasMess === hasMess);
    } catch (error) {
        console.error(`Error filtering students by mess requirement ${hasMess}:`, error);
        return [];
    }
};

/**
 * Gets student statistics (counts, averages)
 * @returns Promise with student statistics object
 */
export const getStudentStatistics = async () => {
    try {
        const students = await getAllStudentsTableData();

        if (students.length === 0) {
            return {
                totalStudents: 0,
                averageAge: 0,
                averageSemester: 0,
                averageRoommateCount: 0,
                averageDistance: 0,
                acRoomPercentage: 0,
                messPercentage: 0,
                departmentDistribution: {},
                genderDistribution: {},
                bedTypeDistribution: {},
                washroomTypeDistribution: {}
            };
        }

        // Calculate averages
        const totalAge = students.reduce((sum, student) => sum + student.age, 0);
        const totalSemester = students.reduce((sum, student) => sum + student.semester, 0);
        const totalRoommateCount = students.reduce((sum, student) => sum + student.roommateCount, 0);
        const totalDistance = students.reduce((sum, student) => sum + student.universityDistance, 0);

        // Count preferences
        const acRoomCount = students.filter(student => student.hasAcRoom).length;
        const messCount = students.filter(student => student.hasMess).length;

        // Calculate distributions
        const departmentDistribution: Record<string, number> = {};
        const genderDistribution: Record<string, number> = {};
        const bedTypeDistribution: Record<string, number> = {};
        const washroomTypeDistribution: Record<string, number> = {};

        students.forEach(student => {
            departmentDistribution[student.department] = (departmentDistribution[student.department] || 0) + 1;
            genderDistribution[student.gender] = (genderDistribution[student.gender] || 0) + 1;
            bedTypeDistribution[student.bedType] = (bedTypeDistribution[student.bedType] || 0) + 1;
            washroomTypeDistribution[student.washroomType] = (washroomTypeDistribution[student.washroomType] || 0) + 1;
        });

        return {
            totalStudents: students.length,
            averageAge: totalAge / students.length,
            averageSemester: totalSemester / students.length,
            averageRoommateCount: totalRoommateCount / students.length,
            averageDistance: totalDistance / students.length,
            acRoomPercentage: (acRoomCount / students.length) * 100,
            messPercentage: (messCount / students.length) * 100,
            departmentDistribution,
            genderDistribution,
            bedTypeDistribution,
            washroomTypeDistribution
        };
    } catch (error) {
        console.error("Error calculating student statistics:", error);
        return {
            totalStudents: 0,
            averageAge: 0,
            averageSemester: 0,
            averageRoommateCount: 0,
            averageDistance: 0,
            acRoomPercentage: 0,
            messPercentage: 0,
            departmentDistribution: {},
            genderDistribution: {},
            bedTypeDistribution: {},
            washroomTypeDistribution: {}
        };
    }
};

// Optional: Batch operation for multiple students
/**
 * Fetches multiple student profiles in batch
 * @param studentIds - Array of student IDs to fetch
 * @returns Promise with array of student profiles
 */
export const getBatchStudentProfiles = async (studentIds: number[]): Promise<StudentProfile[]> => {
    try {
        const profilePromises = studentIds.map(id => getStudentProfile(id));
        const profiles = await Promise.all(profilePromises);
        return profiles.filter((profile): profile is StudentProfile => profile !== null);
    } catch (error) {
        console.error("Error fetching batch student profiles:", error);
        return [];
    }
};