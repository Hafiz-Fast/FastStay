import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

// Base URL for the FastStay API
const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_HOSTELS = 'cache:admin:hostels:all';

// --- API Response Interfaces ---

// 1. Interface for raw hostel data from API
interface RawHostel {
    p_hostelid: number;
    p_managerid: number;
    p_blockno: string;
    p_houseno: string;
    p_hosteltype: string;
    p_isparking: boolean;
    p_numrooms: number;
    p_numfloors: number;
    p_watertimings: string;
    p_cleanlinesstenure: number;
    p_issueresolvingtenure: number;
    p_messprovide: boolean;
    p_geezerflag: boolean;
    p_name: string;
}

// 2. Interface for raw user data from API
interface RawUser {
    userid: number;
    loginid: number;
    usertype: string;
    fname: string;
    lname: string;
    age: number;
    gender: string;
    city: string;
}

// 3. Interface for hostel API response structure
interface HostelsApiResponse {
    hostels: RawHostel[];
    count: number;
}

// 4. Interface for users API response structure
interface UsersApiResponse {
    users: RawUser[];
    count: number;
}

// --- Frontend Data Interfaces ---

// Final interface for table row in React component (All Hostels Page)
export interface HostelTableRow {
    id: number;              // p_hostelid
    name: string;            // p_name
    blockHouse: string;      // Combined p_blockno + p_houseno (replacing City)
    type: string;            // p_hosteltype
    rooms: number;           // p_numrooms
    floors: number;          // p_numfloors
    managerID: number;       // p_managerid
    managerName: string;     // Manager name fetched from users
    isParking: boolean;
    waterTimings: string;
    cleanlinessTenure: number;
    issueResolvingTenure: number;
    messProvide: boolean;
    geezerFlag: boolean;
    avgRating?: number | null;
}

// Interface for recent hostel (for Dashboard widget)
export interface RecentHostel {
    hostelId: number;
    hostelName: string;
    houseNo: string;
    blockNo: string;
    managerName: string;
}

// --- API Functions ---

/**
 * Fetches all hostels and combines with manager names for the main table.
 * @returns A promise that resolves to an array of HostelTableRow.
 */
interface RawRating {
    p_hostelid: number;
    p_ratingstar: number;
}

interface RatingsApiResponse {
    ratings: RawRating[];
}

export const getAllHostelsTableData = async (bypassCache = false): Promise<HostelTableRow[]> => {
    if (!bypassCache) {
        const cached = cacheGet<HostelTableRow[]>(CACHE_HOSTELS);
        if (cached) return cached;
    }
    try {
        const [hostelsResponse, usersResponse, ratingsResponse] = await Promise.all([
            axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`),
            axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`),
            axios.get<RatingsApiResponse>(`${API_BASE_URL}/faststay_app/display/hostel_rating`).catch(() => ({ data: { ratings: [] } })),
        ]);

        const hostels = hostelsResponse.data?.hostels || [];
        const users = usersResponse.data?.users || [];
        const ratingsRaw: RawRating[] = ratingsResponse.data?.ratings || [];

        // Build avg star map per hostel
        const ratingsMap = new Map<number, number[]>();
        ratingsRaw.forEach(r => {
            if (!ratingsMap.has(r.p_hostelid)) ratingsMap.set(r.p_hostelid, []);
            ratingsMap.get(r.p_hostelid)!.push(r.p_ratingstar);
        });

        // Create a map for quick manager lookup
        const managerMap = new Map<number, string>();
        users.forEach(user => {
            if (user.usertype === 'Hostel Manager') {
                managerMap.set(user.userid, `${user.fname} ${user.lname}`);
            }
        });

        // Transform and combine data
        const hostelTableRows: HostelTableRow[] = hostels.map(hostel => {
            const stars = ratingsMap.get(hostel.p_hostelid);
            const avgRating = stars && stars.length > 0
                ? stars.reduce((a, b) => a + b, 0) / stars.length
                : null;
            return {
                id: hostel.p_hostelid,
                name: hostel.p_name,
                blockHouse: `${hostel.p_blockno} - ${hostel.p_houseno}`,
                type: hostel.p_hosteltype,
                rooms: hostel.p_numrooms,
                floors: hostel.p_numfloors,
                managerID: hostel.p_managerid,
                managerName: managerMap.get(hostel.p_managerid) || 'Unknown',
                isParking: hostel.p_isparking,
                waterTimings: hostel.p_watertimings,
                cleanlinessTenure: hostel.p_cleanlinesstenure,
                issueResolvingTenure: hostel.p_issueresolvingtenure,
                messProvide: hostel.p_messprovide,
                geezerFlag: hostel.p_geezerflag,
                avgRating,
            };
        });

        cacheSet(CACHE_HOSTELS, hostelTableRows);
        return hostelTableRows;

    } catch (error: unknown) {
        console.error("Error fetching hostels data:", error);

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
 * Fetches recent hostels for a dashboard widget (limit specified).
 * @param limit The maximum number of recent hostels to return (default: 5).
 * @returns A promise that resolves to an array of RecentHostel.
 */
export const getRecentHostelsTableData = async (limit: number = 5): Promise<RecentHostel[]> => {
    try {
        const hostels = await getAllHostelsTableData();

        // Sort by hostel ID (assuming higher ID = more recent)
        const sortedHostels = [...hostels].sort((a, b) => b.id - a.id);

        // Take only the specified limit
        const recentHostels = sortedHostels.slice(0, limit);

        // Transform to RecentHostel format
        const recentHostelData: RecentHostel[] = recentHostels.map(hostel => ({
            hostelId: hostel.id,
            hostelName: hostel.name,
            // Reversing the combined blockHouse for individual fields
            houseNo: hostel.blockHouse.split(' - ')[1] || 'N/A',
            blockNo: hostel.blockHouse.split(' - ')[0] || 'N/A',
            managerName: hostel.managerName,
        }));

        return recentHostelData;

    } catch (error) {
        // Error handling is already done in getAllHostelsTableData
        console.error(error); // now it's used
        return [];
    }
};

/**
 * Optional: Get single hostel by ID
 * @param hostelId The ID of the hostel to retrieve.
 * @returns A promise that resolves to a HostelTableRow or null.
 */
export const getHostelById = async (hostelId: number): Promise<HostelTableRow | null> => {
    try {
        const hostels = await getAllHostelsTableData();
        const hostel = hostels.find(h => h.id === hostelId);
        return hostel || null;
    } catch (error) {
        // Error handling is already done in getAllHostelsTableData
        console.error(error); // now it's used
        return null;
    }
};

/**
 * Optional: Filter hostels by type
 * @param type The hostel type to filter by (e.g., 'Portion').
 * @returns A promise that resolves to an array of matching HostelTableRow.
 */
export const getHostelsByType = async (type: string): Promise<HostelTableRow[]> => {
    try {
        const hostels = await getAllHostelsTableData();
        return hostels.filter(hostel => hostel.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
        // Error handling is already done in getAllHostelsTableData
        console.error(error); // now it's used
        return [];
    }
};

/**
 * Optional: Search hostels by name or block/house number
 * @param searchTerm The term to search for.
 * @returns A promise that resolves to an array of matching HostelTableRow.
 */
export const searchHostelsByName = async (searchTerm: string): Promise<HostelTableRow[]> => {
    try {
        const hostels = await getAllHostelsTableData();
        const term = searchTerm.toLowerCase();
        return hostels.filter(hostel =>
            hostel.name.toLowerCase().includes(term) ||
            hostel.blockHouse.toLowerCase().includes(term)
        );
    } catch (error) {
        // Error handling is already done in getAllHostelsTableData
        console.error(error); // now it's used
        return [];
    }
};