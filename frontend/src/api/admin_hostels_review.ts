import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';
import { CACHE_ALL_USERS_RAW, CACHE_ALL_MANAGERS_RAW, CACHE_ALL_HOSTELS_RAW } from './admin_dashboard';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_HOSTEL_DETAIL = (id: number) => `cache:admin:hostel:detail:${id}`;
export const CACHE_PENDING_HOSTELS = 'cache:admin:hostels:pending';

// ---- Lightweight type for the pending-approvals list ----
export interface PendingHostel {
    id: number;
    name: string;
    blockNo: string;
    houseNo: string;
    type: string;
    managerName: string;
    managerId: number;
}

// ---- RAW Response Interfaces ----

interface RawHostel {
    p_hostelid: number;
    p_managerid: number;
    p_blockno: string;
    p_houseno: string;
    p_hosteltype: string;
    p_isparking: boolean;
    p_numrooms: number;
    p_numfloors: number;
    p_watertimings: number;
    p_cleanlinesstenure: number;
    p_issueresolvingtenure: number;
    p_messprovide: boolean;
    p_geezerflag: boolean;
    p_name: string;
    p_isapproved: boolean;
}

interface HostelsApiResponse {
    hostels: RawHostel[];
}

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
// export interface HostelTableRow {
//     id: number;
//     name: string;
//     blockNo: string;
//     houseNo: string;
//     type: string;
//     parking: boolean;
//     rooms: number;
//     floors: number;
//     waterTimings: string;
//     cleanlinessTenure: string;
//     issueResolvingTenure: string;
//     messProvide: boolean;
//     geezer: boolean;
//     photos: string[];
//     managerName: string;
//     managerPhone: string;
//     managerType: string;
//     managerEducation: string;
// }

export interface HostelTableRow {
    id: number;
    name: string;
    blockNo: string;
    houseNo: string;
    type: string;
    parking: boolean;
    rooms: number;
    floors: number;
    waterTimings: string;
    cleanlinessTenure: string;
    issueResolvingTenure: string;
    messProvide: boolean;
    geezer: boolean;
    photos: string[];
    managerName: string;
    managerPhone: string;
    managerType: string;
    managerEducation: string;
    approved?: boolean; // Add this field
}

// ---- Approve Hostel ----
export const approveHostel = async (hostelId: number, adminSecret: string): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/faststay_app/hosteldetails/approve`,
            { p_HostelId: hostelId, admin_secret: adminSecret }
        );
        return response.data.success || false;
    } catch (error: unknown) {
        console.error(`Error approving hostel ${hostelId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error("Axios Response:", error.response?.data);
        }
        return false;
    }
};

export const disapproveHostel = async (hostelId: number, adminSecret: string): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/faststay_app/hosteldetails/disapprove`,
            { p_HostelId: hostelId, admin_secret: adminSecret }
        );
        return response.data.success || false;
    } catch (error: unknown) {
        console.error(`Error disapproving hostel ${hostelId}:`, error);
        return false;
    }
};

// In your admin_hostels_review.ts file, update the deleteHostel function:

export const deleteHostel = async (hostelId: number): Promise<boolean> => {
    try {
        console.log(`Attempting to delete hostel with ID: ${hostelId}`);

        // Use POST method as your Django view expects POST
        // Send p_HostelId (with capital H) as per your Django view
        const response = await axios.post(
            `${API_BASE_URL}/faststay_app/hosteldetails/delete`,
            { p_HostelId: hostelId.toString() }, // Convert to string as your backend expects
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Delete API Response:", response.data);

        // Your backend returns different response formats based on success/failure
        // Check for success messages
        if (response.status === 200 && response.data.message) {
            // Success response: {'message': f'Hostel ID {hostel_id} successfully deleted'}
            return true;
        } else if (response.status === 404) {
            // Not found response
            console.error("Hostel not found:", response.data.error);
            return false;
        } else if (response.status === 500) {
            // Server error response
            console.error("Server error:", response.data.error);
            return false;
        }

        return false;

    } catch (error: unknown) {
        console.error(`Error deleting hostel ${hostelId}:`, error);

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error("Axios Error Details:", {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message
            });

            // Check for specific error responses from your backend
            if (axiosError.response?.status === 404) {
                console.log("Hostel not found - 404 error");
            } else if (axiosError.response?.status === 400) {
                console.log("Bad request - 400 error");
            }
        }
        return false;
    }
};



// ---- CORRECTED: Function to get hostel pictures by ID ----
export const getHostelPictures = async (hostelId: number): Promise<string[]> => {
    try {
        // Using GET method with query parameter as shown in your working example
        const response = await axios.get(
            `${API_BASE_URL}/faststay_app/display/hostel_pic`,
            {
                params: { p_HostelId: hostelId }
            }
        );

        console.log("Hostel pics response for ID", hostelId, ":", response.data); // Debug log

        let images: string[] = [];

        // Handle the response based on the actual structure
        if (Array.isArray(response.data)) {
            // If response is an array (like your working example suggests)
            images = response.data.map((item: any) => item.p_photolink);
        } else if (response.data?.p_photolink) {
            // If response is a single object with p_photolink
            images = [response.data.p_photolink];
        } else if (response.data && typeof response.data === 'object') {
            // If response is an object that might have the photo link
            images = [response.data.p_photolink].filter(Boolean);
        }

        console.log("Extracted images:", images); // Debug log
        return images;

    } catch (error: unknown) {
        console.error(`Error fetching pictures for hostel ${hostelId}:`, error);

        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            console.error("Axios Response:", err.response?.data);
        }
        return [];
    }
};

// ---- Updated Main Function ----
export const getAllHostelsTableData = async (): Promise<HostelTableRow[]> => {
    try {
        // Fetch all necessary data in parallel
        const [hostelsRes, managersRes, usersRes] = await Promise.all([
            axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`),
            axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`),
            axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`)
        ]);

        const hostels = hostelsRes.data.hostels || [];
        const managers = managersRes.data.result || [];
        const users = usersRes.data.users || [];

        // Map hostels to final frontend structure
        const finalData: HostelTableRow[] = await Promise.all(hostels.map(async hostel => {
            // Get hostel photos using the new function
            const photos: string[] = await getHostelPictures(hostel.p_hostelid);

            // Get manager info
            const manager = managers.find(m => m.p_ManagerId === hostel.p_managerid);
            const user = users.find(u => u.userid === hostel.p_managerid);

            return {
                id: hostel.p_hostelid,
                name: hostel.p_name,
                blockNo: hostel.p_blockno,
                houseNo: hostel.p_houseno,
                type: hostel.p_hosteltype,
                parking: hostel.p_isparking,
                rooms: hostel.p_numrooms,
                floors: hostel.p_numfloors,
                waterTimings: `${hostel.p_watertimings} hrs`,
                cleanlinessTenure: `${hostel.p_cleanlinesstenure} days`,
                issueResolvingTenure: `${hostel.p_issueresolvingtenure} days`,
                messProvide: hostel.p_messprovide,
                geezer: hostel.p_geezerflag,
                photos,
                managerName: user ? `${user.fname} ${user.lname}` : 'Unknown',
                managerPhone: manager?.p_PhoneNo || 'N/A',
                managerType: manager?.p_ManagerType || 'N/A',
                managerEducation: manager?.p_Education || 'N/A',
                approved: hostel.p_isapproved,
            };
        }));

        console.log("Final hostel data with photos:", finalData); // Debug log
        return finalData;

    } catch (error: unknown) {
        console.error("Error fetching hostel data:", error);

        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            console.error("Axios Response:", err.response?.data);
        }
        return [];
    }
};

// ---- CORRECTED: Function to get single hostel details with pictures ----
export const getHostelDetails = async (hostelId: number, bypassCache = false): Promise<HostelTableRow | null> => {
    if (!bypassCache) {
        const cached = cacheGet<HostelTableRow>(CACHE_HOSTEL_DETAIL(hostelId));
        if (cached) return cached;
    }
    try {
        // Run all 4 fetches in parallel — use shared raw caches when available
        const getCachedHostels = async (): Promise<RawHostel[]> => {
            const c = cacheGet<RawHostel[]>(CACHE_ALL_HOSTELS_RAW);
            if (c) return c;
            const res = await axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`);
            const list = res.data.hostels || [];
            cacheSet(CACHE_ALL_HOSTELS_RAW, list);
            return list;
        };
        const getCachedManagers = async (): Promise<RawManager[]> => {
            const c = cacheGet<RawManager[]>(CACHE_ALL_MANAGERS_RAW);
            if (c) return c;
            const res = await axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`);
            const list = res.data.result || [];
            cacheSet(CACHE_ALL_MANAGERS_RAW, list);
            return list;
        };
        const getCachedUsers = async (): Promise<RawUser[]> => {
            const c = cacheGet<RawUser[]>(CACHE_ALL_USERS_RAW);
            if (c) return c;
            const res = await axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`);
            const list = res.data.users || [];
            cacheSet(CACHE_ALL_USERS_RAW, list);
            return list;
        };

        const [hostelsList, photos, managers, users] = await Promise.all([
            getCachedHostels(),
            getHostelPictures(hostelId),
            getCachedManagers(),
            getCachedUsers(),
        ]);

        const hostel = hostelsList.find(h => h.p_hostelid === hostelId);

        if (!hostel) {
            console.error(`Hostel with ID ${hostelId} not found`);
            return null;
        }

        const manager = managers.find(m => m.p_ManagerId === hostel.p_managerid);
        const user = users.find(u => u.userid === hostel.p_managerid);

        const result: HostelTableRow = {
            id: hostel.p_hostelid,
            name: hostel.p_name,
            blockNo: hostel.p_blockno,
            houseNo: hostel.p_houseno,
            type: hostel.p_hosteltype,
            parking: hostel.p_isparking,
            rooms: hostel.p_numrooms,
            floors: hostel.p_numfloors,
            waterTimings: `${hostel.p_watertimings} hrs`,
            cleanlinessTenure: `${hostel.p_cleanlinesstenure} days`,
            issueResolvingTenure: `${hostel.p_issueresolvingtenure} days`,
            messProvide: hostel.p_messprovide,
            geezer: hostel.p_geezerflag,
            photos,
            managerName: user ? `${user.fname} ${user.lname}` : 'Unknown',
            managerPhone: manager?.p_PhoneNo || 'N/A',
            managerType: manager?.p_ManagerType || 'N/A',
            managerEducation: manager?.p_Education || 'N/A',
            approved: hostel.p_isapproved,
        };
        cacheSet(CACHE_HOSTEL_DETAIL(hostelId), result);
        return result;

    } catch (error: unknown) {
        console.error(`Error fetching hostel ${hostelId} details:`, error);
        return null;
    }
};

// ---- Pending Approvals: hostels where isapproved = false ----
export const getPendingHostels = async (bypassCache = false): Promise<PendingHostel[]> => {
    if (!bypassCache) {
        const cached = cacheGet<PendingHostel[]>(CACHE_PENDING_HOSTELS);
        if (cached) return cached;
    }
    try {
        const getCachedHostels = async (): Promise<RawHostel[]> => {
            const c = cacheGet<RawHostel[]>(CACHE_ALL_HOSTELS_RAW);
            if (c) return c;
            const res = await axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`);
            const list = res.data.hostels || [];
            cacheSet(CACHE_ALL_HOSTELS_RAW, list);
            return list;
        };
        const getCachedUsers = async (): Promise<RawUser[]> => {
            const c = cacheGet<RawUser[]>(CACHE_ALL_USERS_RAW);
            if (c) return c;
            const res = await axios.get<UsersApiResponse>(`${API_BASE_URL}/faststay_app/users/all`);
            const list = res.data.users || [];
            cacheSet(CACHE_ALL_USERS_RAW, list);
            return list;
        };

        const [hostels, users] = await Promise.all([getCachedHostels(), getCachedUsers()]);

        const pending: PendingHostel[] = hostels
            .filter(h => h.p_isapproved === false)
            .map(h => {
                const user = users.find(u => u.userid === h.p_managerid);
                return {
                    id: h.p_hostelid,
                    name: h.p_name,
                    blockNo: h.p_blockno,
                    houseNo: h.p_houseno,
                    type: h.p_hosteltype,
                    managerName: user ? `${user.fname} ${user.lname}` : 'Unknown',
                    managerId: h.p_managerid,
                };
            });

        cacheSet(CACHE_PENDING_HOSTELS, pending);
        return pending;
    } catch (err: unknown) {
        console.error('Error fetching pending hostels:', err);
        return [];
    }
};

// ---- Hostel Expenses ----
export interface HostelExpenses {
    expense_id: number;
    isIncludedInRoomCharges: boolean;
    RoomCharges: number[];
    SecurityCharges: number;
    MessCharges: number;
    KitchenCharges: number;
    InternetCharges: number;
    AcServiceCharges: number;
    ElectricitybillType: string;
    ElectricityCharges: number;
}

export const getHostelExpenses = async (hostelId: number): Promise<HostelExpenses | null> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/faststay_app/Expenses/display/`, {
            p_HostelId: hostelId,
        });
        if (response.data?.success && response.data?.result) {
            return response.data.result as HostelExpenses;
        }
        return null;
    } catch {
        return null;
    }
};

export const getHostelSecurityInfo = async (hostelId: number): Promise<Record<string, any> | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/faststay_app/display/security_info`, {
            params: { p_HostelId: hostelId },
        });
        if (response.data && !response.data.error) return response.data;
        return null;
    } catch {
        return null;
    }
};

export const getHostelMessInfo = async (hostelId: number): Promise<Record<string, any> | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/faststay_app/display/hostel_mess`, {
            params: { p_HostelId: hostelId },
        });
        if (response.data && !response.data.error) return response.data;
        return null;
    } catch {
        return null;
    }
};

// ---- Hostel Rooms ----
export interface HostelRoom {
    p_FloorNo: number;
    p_SeaterNo: number;
    p_BedType: string;
    p_WashroomType: string;
    p_CupboardType: string;
    p_RoomRent: number;
    p_isVentilated: boolean;
    p_isCarpet: boolean;
    p_isMiniFridge: boolean;
}

export const getHostelRooms = async (hostelId: number): Promise<HostelRoom[]> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/faststay_app/Rooms/DisplayAllHostel/`, {
            p_HostelId: hostelId,
        });
        if (response.data?.success && Array.isArray(response.data?.result)) {
            return response.data.result as HostelRoom[];
        }
        return [];
    } catch {
        return [];
    }
};

// ---- Room Pics ----
export interface RoomPicItem {
    p_PhotoLink: string | null;
    p_RoomSeaterNo: number;
}

export const getHostelRoomPics = async (hostelId: number): Promise<RoomPicItem[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/faststay_app/display/room_pic`, {
            params: { p_HostelId: hostelId },
        });
        if (Array.isArray(response.data)) return response.data as RoomPicItem[];
        return [];
    } catch {
        return [];
    }
};

// ---- Manager Hostels: summary cards for all hostels a manager owns ----

export interface ManagerHostelCard {
    id: number;
    name: string;
    blockNo: string;
    houseNo: string;
    type: string;
    parking: boolean;
    rooms: number;
    floors: number;
    messProvide: boolean;
    geezer: boolean;
    photos: string[];
    approved?: boolean;
    avgRating: number | null;
}

interface RawRatingMH { p_hostelid: number; p_ratingstar: number; }
interface RatingsApiResponseMH { ratings: RawRatingMH[]; }

export const getManagerHostels = async (managerId: number): Promise<ManagerHostelCard[]> => {
    try {
        const getCachedHostels = async (): Promise<RawHostel[]> => {
            const c = cacheGet<RawHostel[]>(CACHE_ALL_HOSTELS_RAW);
            if (c) return c;
            const res = await axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`);
            const list = res.data.hostels || [];
            cacheSet(CACHE_ALL_HOSTELS_RAW, list);
            return list;
        };

        const [hostelsList, ratingsRes] = await Promise.all([
            getCachedHostels(),
            axios.get<RatingsApiResponseMH>(`${API_BASE_URL}/faststay_app/display/hostel_rating`)
                .catch(() => ({ data: { ratings: [] as RawRatingMH[] } })),
        ]);

        const managerHostels = hostelsList.filter(h => h.p_managerid === managerId);

        const ratingsMap = new Map<number, number[]>();
        (ratingsRes.data?.ratings || []).forEach(r => {
            if (!ratingsMap.has(r.p_hostelid)) ratingsMap.set(r.p_hostelid, []);
            ratingsMap.get(r.p_hostelid)!.push(r.p_ratingstar);
        });

        const photosResults = await Promise.all(
            managerHostels.map(h => getHostelPictures(h.p_hostelid).catch(() => [] as string[]))
        );

        return managerHostels.map((hostel, idx) => {
            const stars = ratingsMap.get(hostel.p_hostelid);
            const avgRating = stars && stars.length > 0
                ? stars.reduce((a, b) => a + b, 0) / stars.length
                : null;
            return {
                id: hostel.p_hostelid,
                name: hostel.p_name,
                blockNo: hostel.p_blockno,
                houseNo: hostel.p_houseno,
                type: hostel.p_hosteltype,
                parking: hostel.p_isparking,
                rooms: hostel.p_numrooms,
                floors: hostel.p_numfloors,
                messProvide: hostel.p_messprovide,
                geezer: hostel.p_geezerflag,
                photos: photosResults[idx],
                approved: hostel.p_isapproved,
                avgRating,
            };
        });
    } catch (error) {
        console.error("Error fetching manager hostels:", error);
        return [];
    }
};

// ---- Student reviews for a specific hostel ----

export interface HostelReview {
    ratingId: number;
    studentId: number;
    studentName: string;
    ratingStar: number;
    maintenanceRating: number;
    issueResolvingRate: number;
    managerBehaviour: number;
    challenges: string | null;
}

interface RawRatingRow {
    p_ratingid: number;
    p_hostelid: number;
    p_studentid: number;
    p_ratingstar: number;
    p_maintenancerating: number;
    p_issueresolvingrate: number;
    p_managerbehaviour: number;
    p_challenges: string | null;
}

interface RatingsDisplayResponse {
    ratings: RawRatingRow[];
    count: number;
}

export const getHostelReviews = async (hostelId: number): Promise<HostelReview[]> => {
    try {
        const [ratingsRes, usersRes] = await Promise.all([
            axios.get<RatingsDisplayResponse>(`${API_BASE_URL}/faststay_app/display/hostel_rating`),
            axios.get<{ users: { userid: number; fname: string; lname: string; usertype: string }[] }>(
                `${API_BASE_URL}/faststay_app/users/all`
            ).catch(() => ({ data: { users: [] as { userid: number; fname: string; lname: string; usertype: string }[] } })),
        ]);

        const allRatings: RawRatingRow[] = ratingsRes.data?.ratings || [];
        const users = usersRes.data?.users || [];

        const nameMap = new Map<number, string>();
        users.forEach(u => nameMap.set(u.userid, `${u.fname} ${u.lname}`.trim() || `Student #${u.userid}`));

        return allRatings
            .filter(r => r.p_hostelid === hostelId)
            .map(r => ({
                ratingId: r.p_ratingid,
                studentId: r.p_studentid,
                studentName: nameMap.get(r.p_studentid) || `Student #${r.p_studentid}`,
                ratingStar: r.p_ratingstar,
                maintenanceRating: r.p_maintenancerating,
                issueResolvingRate: r.p_issueresolvingrate,
                managerBehaviour: r.p_managerbehaviour,
                challenges: r.p_challenges || null,
            }));
    } catch (error) {
        console.error("Error fetching hostel reviews:", error);
        return [];
    }
};