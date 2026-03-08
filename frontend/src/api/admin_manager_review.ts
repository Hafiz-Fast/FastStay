import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_MANAGER_PROFILE = (id: number) => `cache:admin:manager:profile:${id}`;

// ---- RAW Response Interfaces ----
interface RawManager {
    p_ManagerId: number;
    p_PhotoLink: string;
    p_PhoneNo: string;
    p_Education: string;
    p_ManagerType: string;
    p_OperatingHours: number;
}

interface ManagerApiResponse {
    success: boolean;
    result: RawManager[];
}

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

interface UsersApiResponse {
    users: RawUser[];
}

// ---- Final Frontend Table Interface ----
export interface ManagerTableRow {
    id: number;
    name: string;
    phone: string;
    type: string;
    education: string;
    operatingHours: number;
    photoLink?: string;
}


// In your admin_manager_review.ts file, add this delete function:

// ---- Delete Manager ----
export const deleteManager = async (managerId: number): Promise<boolean> => {
    try {
        console.log(`Attempting to delete manager with ID: ${managerId}`);

        const response = await axios.delete(
            `${API_BASE_URL}/faststay_app/ManagerDetails/delete/`,
            {
                data: { p_ManagerId: managerId },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Delete Manager API Response:", response.data);

        // Check response format based on your backend
        if (response.data.result !== undefined) {
            return response.data.result === true || response.data.result === "true";
        } else if (response.data.success !== undefined) {
            return response.data.success === true;
        }

        return false;

    } catch (error: unknown) {
        console.error(`Error deleting manager ${managerId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error("Axios Error Details:", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        return false;
    }
};

// ---- API Functions ----

// 1. Get all managers with user details (combined)
export const getAllManagersTableData = async (): Promise<ManagerTableRow[]> => {
    try {
        const [managersRes, usersRes] = await Promise.all([
            axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`),
            axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`)
        ]);

        const managers = managersRes.data.result || [];
        const users = usersRes.data.users || [];

        const finalData: ManagerTableRow[] = managers.map(manager => {
            const matchedUser = users.find(user => user.userid === manager.p_ManagerId);

            return {
                id: manager.p_ManagerId,
                name: matchedUser ? `${matchedUser.fname} ${matchedUser.lname}` : "Unknown",
                phone: manager.p_PhoneNo,
                type: manager.p_ManagerType,
                education: manager.p_Education,
                operatingHours: manager.p_OperatingHours,
                photoLink: manager.p_PhotoLink
            };
        });

        return finalData;

    } catch (error: unknown) {
        console.error("Error fetching manager data:", error);

        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            console.error("Axios error details:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
        }
        throw error; // Re-throw to let the caller handle it
    }
};

// 2. Get only managers data
export const getAllManagers = async (): Promise<RawManager[]> => {
    try {
        const response = await axios.get<ManagerApiResponse>(
            `${API_BASE_URL}/faststay_app/ManagerDetails/display/all`
        );
        return response.data.result || [];
    } catch (error: unknown) {
        console.error("Error fetching managers:", error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
        }
        throw error;
    }
};

// 3. Get only users data
export const getAllUsers = async (): Promise<RawUser[]> => {
    try {
        const response = await axios.get<UsersApiResponse>(
            `${API_BASE_URL}/faststay_app/users/all`
        );
        return response.data.users || [];
    } catch (error: unknown) {
        console.error("Error fetching users:", error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
        }
        throw error;
    }
};

// 4. Get manager by ID with user details
export const getManagerById = async (managerId: number): Promise<ManagerTableRow | null> => {
    try {
        const [managersRes, usersRes] = await Promise.all([
            axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`),
            axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`)
        ]);

        const manager = managersRes.data.result?.find(m => m.p_ManagerId === managerId);

        if (!manager) {
            console.warn(`Manager with ID ${managerId} not found`);
            return null;
        }

        const users = usersRes.data.users || [];
        const matchedUser = users.find(user => user.userid === managerId);

        return {
            id: manager.p_ManagerId,
            name: matchedUser ? `${matchedUser.fname} ${matchedUser.lname}` : "Unknown",
            phone: manager.p_PhoneNo,
            type: manager.p_ManagerType,
            education: manager.p_Education,
            operatingHours: manager.p_OperatingHours,
            photoLink: manager.p_PhotoLink
        };

    } catch (error: unknown) {
        console.error(`Error fetching manager with ID ${managerId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
        }
        throw error;
    }
};

// 5. Get user details for a specific manager
export const getUserForManager = async (managerId: number): Promise<RawUser | null> => {
    try {
        const response = await axios.get<UsersApiResponse>(
            `${API_BASE_URL}/faststay_app/users/all`
        );

        const users = response.data.users || [];
        const user = users.find(u => u.userid === managerId);

        return user || null;
    } catch (error: unknown) {
        console.error(`Error fetching user for manager ID ${managerId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
        }
        throw error;
    }
};

// Example usage function
export const fetchAndDisplayManagers = async () => {
    try {
        const managersData = await getAllManagersTableData();

        console.log("Managers Table Data:", managersData);
        // You can now use this data in your React component

        return managersData;
    } catch (error) {
        console.error("Failed to fetch managers:", error);
        // Handle error appropriately in your UI
        return [];
    }
};