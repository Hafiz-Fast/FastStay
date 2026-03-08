

import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

// Base URL for the FastStay API
const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_STUDENTS = 'cache:admin:students:all';

// --- API Response Interfaces ---

// 1. Interface for raw user data from API (already provided in the original code)
interface RawUser {
    userid: number;
    loginid: number;
    usertype: string;
    fname: string;
    lname: string;
    age: number;
    gender: string;
    city: string;
    // Assuming 'email' or 'loginid' would be used for a unique identifier if needed,
    // but the final table will not display an email field.
}

// 2. Interface for users API response structure (already provided in the original code)
interface UsersApiResponse {
    users: RawUser[];
    count: number;
}

// --- Frontend Data Interfaces ---

/**
 * Final interface for a table row in the Students View component.
 * Note: 'Email' attribute has been deliberately excluded as requested.
 */
export interface StudentTableRow {
    id: number;          // userid
    loginId: number;     // loginid
    name: string;        // Combined fname + lname
    age: number;
    gender: string;
    city: string;
}

/**
 * Interface for a recent student (for Dashboard widget, if needed).
 */
export interface RecentStudent {
    studentId: number;
    studentName: string;
    city: string;
}

// --- API Functions for Students ---

/**
 * Fetches all users from the API and filters/transforms them into student table rows.
 * Only users with usertype === 'Student' are included.
 * @returns A promise that resolves to an array of StudentTableRow.
 */
export const getAllStudentsTableData = async (bypassCache = false): Promise<StudentTableRow[]> => {
    if (!bypassCache) {
        const cached = cacheGet<StudentTableRow[]>(CACHE_STUDENTS);
        if (cached) return cached;
    }
    try {
        const usersResponse = await axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`);

        const users = usersResponse.data?.users || [];

        // Filter for students and transform data
        const studentTableRows: StudentTableRow[] = users
            .filter(user => user.usertype === 'Student')
            .map(student => ({
                id: student.userid,
                loginId: student.loginid,
                name: `${student.fname} ${student.lname}`,
                age: student.age,
                gender: student.gender,
                city: student.city,
                // Email is deliberately omitted
            }));

        cacheSet(CACHE_STUDENTS, studentTableRows);
        return studentTableRows;

    } catch (error: unknown) {
        console.error("Error fetching students data:", error);

        // Log detailed error message if available
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error("Axios status:", axiosError.response?.status);
            console.error("Axios data:", axiosError.response?.data);
        } else if (error instanceof Error) {
            console.error("General error message:", error.message);
        }

        // Return empty array on error
        return [];
    }
};

/**
 * Fetches recent students for a dashboard widget (limit specified).
 * Assumes a higher student ID (userid) means more recent registration.
 * @param limit The maximum number of recent students to return (default: 5).
 * @returns A promise that resolves to an array of RecentStudent.
 */
export const getRecentStudentsData = async (limit: number = 5): Promise<RecentStudent[]> => {
    try {
        const students = await getAllStudentsTableData();

        // Sort by student ID (assuming higher ID = more recent)
        const sortedStudents = [...students].sort((a, b) => b.id - a.id);

        // Take only the specified limit
        const recentStudents = sortedStudents.slice(0, limit);

        // Transform to RecentStudent format
        const recentStudentData: RecentStudent[] = recentStudents.map(student => ({
            studentId: student.id,
            studentName: student.name,
            city: student.city,
        }));

        return recentStudentData;

    } catch (error) {
        // Error handling is already done in getAllStudentsTableData
        console.error("Error getting recent students:", error);
        return [];
    }
};

/**
 * Optional: Get single student by ID
 * @param studentId The ID of the student to retrieve.
 * @returns A promise that resolves to a StudentTableRow or null.
 */
export const getStudentById = async (studentId: number): Promise<StudentTableRow | null> => {
    try {
        const students = await getAllStudentsTableData();
        const student = students.find(s => s.id === studentId);
        return student || null;
    } catch (error) {
        console.error("Error getting student by ID:", error);
        return null;
    }
};

/**
 * Optional: Filter students by city
 * @param city The city to filter students by.
 * @returns A promise that resolves to an array of matching StudentTableRow.
 */
export const getStudentsByCity = async (city: string): Promise<StudentTableRow[]> => {
    try {
        const students = await getAllStudentsTableData();
        return students.filter(student => student.city.toLowerCase() === city.toLowerCase());
    } catch (error) {
        console.error("Error filtering students by city:", error);
        return [];
    }
};

/**
 * Optional: Filter students by gender
 * @param gender The gender to filter students by.
 * @returns A promise that resolves to an array of matching StudentTableRow.
 */
export const getStudentsByGender = async (gender: string): Promise<StudentTableRow[]> => {
    try {
        const students = await getAllStudentsTableData();
        return students.filter(student => student.gender.toLowerCase() === gender.toLowerCase());
    } catch (error) {
        console.error("Error filtering students by gender:", error);
        return [];
    }
};

/**
 * Optional: Search students by name or city
 * @param searchTerm The term to search for.
 * @returns A promise that resolves to an array of matching StudentTableRow.
 */
export const searchStudents = async (searchTerm: string): Promise<StudentTableRow[]> => {
    try {
        const students = await getAllStudentsTableData();
        const term = searchTerm.toLowerCase();
        return students.filter(student =>
            student.name.toLowerCase().includes(term) ||
            student.city.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error("Error searching students:", error);
        return [];
    }
};