import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_MANAGERS = 'cache:admin:managers:all';

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

interface RawUser {
    userid: number;
    fname: string;
    lname: string;
    usertype: string;
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
}


// ---- Main Function (Return Full Table Data) ----
export const getAllManagersTableData = async (bypassCache = false): Promise<ManagerTableRow[]> => {
    if (!bypassCache) {
        const cached = cacheGet<ManagerTableRow[]>(CACHE_MANAGERS);
        if (cached) return cached;
    }
    try {
        const [managersRes, usersRes] = await Promise.all([
            axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`),
            axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`)
        ]);

        const managers = managersRes.data.result || [];
        const users = usersRes.data.users || [];

        const finalData: ManagerTableRow[] = managers.map(m => {
            const matchedUser = users.find(u => u.userid === m.p_ManagerId);

            return {
                id: m.p_ManagerId,
                name: matchedUser ? `${matchedUser.fname} ${matchedUser.lname}` : "Unknown",
                phone: m.p_PhoneNo,
                type: m.p_ManagerType,
                education: m.p_Education,
                operatingHours: m.p_OperatingHours
            };
        });

        cacheSet(CACHE_MANAGERS, finalData);
        return finalData;

    } catch (error: unknown) {
        console.error("Error fetching manager data:", error);

        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            console.error("Axios Response:", err.response?.data);
        }
        return [];
    }
};
