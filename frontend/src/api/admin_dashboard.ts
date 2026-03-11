import axios from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

const API_BASE_URL = 'http://localhost:8000';

// Cache keys exported so the component can read them directly for SWR
export const CACHE_DASHBOARD   = 'cache:admin:dashboard:summary';
export const CACHE_RECENT_USERS   = 'cache:admin:users:recent';
export const CACHE_RECENT_HOSTELS = 'cache:admin:hostels:recent';

interface User {
  usertype: string;
}

interface ManagerApiResponse {
  success: boolean;
  result: unknown[];
}

export const getDashboardSummary = async (bypassCache = false) => {
  const cached = cacheGet<{ total_students: number; total_managers: number; total_hostels: number; total_rooms: number }>(CACHE_DASHBOARD);
  if (cached && !bypassCache) return cached;

  try {
    const [usersResponse, hostelsResponse, roomsResponse, managersResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/faststay_app/users/all/`),
      axios.get(`${API_BASE_URL}/faststay_app/display/all_hostels`),
      axios.get(`${API_BASE_URL}/faststay_app/display/all_rooms`),
      axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`)
    ]);

    const users = usersResponse.data?.users || [];
    const total_hostels = hostelsResponse.data?.count || 0;
    const total_rooms = roomsResponse.data?.count || 0;

    const total_students = users.filter((user: User) =>
      user.usertype === 'Student'
    ).length;

    const total_managers = (managersResponse.data?.result || []).length;

    const summary = { total_students, total_managers, total_hostels, total_rooms };
    cacheSet(CACHE_DASHBOARD, summary);
    return summary;

  } catch (error: unknown) {
    console.error("Error fetching dashboard summary:", error);
    if (error instanceof Error) console.error("Error message:", error.message);
    return { total_students: 0, total_managers: 0, total_hostels: 0, total_rooms: 0 };
  }
};





interface RawUser {
    userid: number;
    usertype: string;
    fname: string;
    lname: string;
    city: string;
    // ... potentially other fields like loginid, age, gender
}

// 2. Interface for the API response structure for the users endpoint
interface UsersApiResponse {
    users: RawUser[];
    count: number;
}

// 3. Interface for the final, formatted data the React component will use for the table
export interface RecentUserAccount {
    userid:number;
    Name: string; // Combined 'fname' and 'lname'
    City: string;
    UserType: string; // The 'usertype' field
}


export const getRecentUsersTableData = async (limit: number = 10, bypassCache = false): Promise<RecentUserAccount[]> => {
    const cacheKey = `${CACHE_RECENT_USERS}:${limit}`;
    const cached = cacheGet<RecentUserAccount[]>(cacheKey);
    if (cached && !bypassCache) return cached;

    try {
        const response = await axios.get<UsersApiResponse>(
            `${API_BASE_URL}/faststay_app/users/all/`
        );

        const allUsers = response.data?.users || [];
        const sortedUsers = [...allUsers].sort((a, b) => b.userid - a.userid);
        const recentUsers = sortedUsers.slice(0, limit);

        const recentUserAccounts: RecentUserAccount[] = recentUsers.map(user => ({
            userid: user.userid,
            Name: `${user.fname} ${user.lname}`,
            City: user.city,
            UserType: user.usertype,
        }));

        cacheSet(cacheKey, recentUserAccounts);
        return recentUserAccounts;

    } catch (error: unknown) {
        console.error("Error fetching and processing recent users:", error);
        if (error instanceof Error) console.error("Error message:", error.message);
        return [];
    }
}



// Interface for raw hostel data from API
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
  p_isapproved?: boolean;
}

// Interface for API response structure
interface HostelsApiResponse {
  hostels: RawHostel[];
  count: number;
}

// Interface for manager data
interface ManagerData {
  userid: number;
  fname: string;
  lname: string;
}

// Interface for final formatted hostel data
export interface RecentHostel {
  hostelId: number;
  hostelName: string;
  houseNo: string;
  blockNo: string;
  hostelType: string;
  managerName: string; // Manager name fetched from users endpoint
  totalRooms: number;
  action: string; // For view button
}

export const getRecentHostelsTableData = async (limit: number = 10, bypassCache = false): Promise<RecentHostel[]> => {
  const cacheKey = `${CACHE_RECENT_HOSTELS}:${limit}`;
  const cached = cacheGet<RecentHostel[]>(cacheKey);
  if (cached && !bypassCache) return cached;

  try {
    const hostelsResponse = await axios.get<HostelsApiResponse>(
      `${API_BASE_URL}/faststay_app/display/all_hostels`
    );

    const allHostels = hostelsResponse.data?.hostels || [];

    // Sort hostels by ID (assuming higher ID = more recent)
    const sortedHostels = [...allHostels].sort((a, b) => b.p_hostelid - a.p_hostelid);

    // Get only recent hostels
    const recentHostels = sortedHostels.slice(0, limit);

    // Fetch all users to get manager names
    const usersResponse = await axios.get<{ users: ManagerData[] }>(
      `${API_BASE_URL}/faststay_app/users/all/`
    );

    const allUsers = usersResponse.data?.users || [];

    // Create a map of manager IDs to manager names for quick lookup
    const managerMap = new Map<number, string>();

    allUsers.forEach(user => {
      managerMap.set(user.userid, `${user.fname} ${user.lname}`);
    });

    // Format the recent hostels data
    const recentHostelList: RecentHostel[] = recentHostels.map(hostel => {
      // Get manager name from the map, fallback to "Unknown" if not found
      const managerName = managerMap.get(hostel.p_managerid) || "Unknown Manager";

      return {
        hostelId: hostel.p_hostelid,
        hostelName: hostel.p_name || "Unnamed Hostel",
        houseNo: hostel.p_houseno,
        blockNo: hostel.p_blockno,
        hostelType: hostel.p_hosteltype,
        managerName: managerName,
        totalRooms: hostel.p_numrooms,
        action: "View Details"
      };
    });

    cacheSet(cacheKey, recentHostelList);
    return recentHostelList;

  } catch (error: unknown) {
    console.error("Error fetching and processing recent hostels:", error);
    if (error instanceof Error) console.error("Error message:", error.message);
    return [];
  }
};

// Shared raw-users cache key — written here, reused by review APIs to avoid duplicate /users/all calls
export const CACHE_ALL_USERS_RAW     = 'cache:admin:users:all:raw';
export const CACHE_ALL_MANAGERS_RAW  = 'cache:admin:managers:all:raw';
export const CACHE_ALL_HOSTELS_RAW   = 'cache:admin:hostels:all:raw';

/**
 * Single unified fetch: 3 parallel calls → derives summary + recentUsers + recentHostels.
 * Also seeds CACHE_ALL_USERS_RAW so subsequent profile prefetches cost 0 extra network calls.
 */
export const loadDashboardData = async (bypassCache = false): Promise<{
  summary: { total_students: number; total_managers: number; total_hostels: number; total_rooms: number; total_pending: number };
  recentUsers: RecentUserAccount[];
  recentHostels: RecentHostel[];
}> => {
  if (!bypassCache) {
    const s = cacheGet<{ total_students: number; total_managers: number; total_hostels: number; total_rooms: number; total_pending: number }>(CACHE_DASHBOARD);
    const u = cacheGet<RecentUserAccount[]>(`${CACHE_RECENT_USERS}:5`);
    const h = cacheGet<RecentHostel[]>(`${CACHE_RECENT_HOSTELS}:5`);
    if (s && u && h) return { summary: s, recentUsers: u, recentHostels: h };
  }

  const [usersRes, hostelsRes, roomsRes, managersRes] = await Promise.all([
    axios.get<{ users: RawUser[] }>(`${API_BASE_URL}/faststay_app/users/all/`),
    axios.get<HostelsApiResponse>(`${API_BASE_URL}/faststay_app/display/all_hostels`),
    axios.get(`${API_BASE_URL}/faststay_app/display/all_rooms`),
    axios.get<ManagerApiResponse>(`${API_BASE_URL}/faststay_app/ManagerDetails/display/all`),
  ]);

  const users = usersRes.data?.users || [];
  const allHostels = hostelsRes.data?.hostels || [];

  // Seed raw caches so profile prefetches reuse this data immediately
  cacheSet(CACHE_ALL_USERS_RAW, users);
  cacheSet(CACHE_ALL_HOSTELS_RAW, allHostels);

  // Summary
  const summary = {
    total_students: users.filter(u => u.usertype === 'Student').length,
    total_managers: (managersRes.data?.result || []).length,
    total_hostels: hostelsRes.data?.count || 0,
    total_rooms: roomsRes.data?.count || 0,
    total_pending: allHostels.filter(h => h.p_isapproved === false).length,
  };

  // Recent users (top 5 by highest userid)
  const recentUsers: RecentUserAccount[] = [...users]
    .sort((a, b) => b.userid - a.userid)
    .slice(0, 5)
    .map(u => ({ userid: u.userid, Name: `${u.fname} ${u.lname}`, City: u.city, UserType: u.usertype }));

  // Manager name lookup map
  const managerMap = new Map<number, string>(users.map(u => [u.userid, `${u.fname} ${u.lname}`]));

  // Recent hostels (top 5 by highest hostelid)
  const recentHostels: RecentHostel[] = [...allHostels]
    .sort((a, b) => b.p_hostelid - a.p_hostelid)
    .slice(0, 5)
    .map(h => ({
      hostelId: h.p_hostelid,
      hostelName: h.p_name || 'Unnamed Hostel',
      houseNo: h.p_houseno,
      blockNo: h.p_blockno,
      hostelType: h.p_hosteltype,
      managerName: managerMap.get(h.p_managerid) || 'Unknown Manager',
      totalRooms: h.p_numrooms,
      action: 'View Details',
    }));

  cacheSet(CACHE_DASHBOARD, summary);
  cacheSet(`${CACHE_RECENT_USERS}:5`, recentUsers);
  cacheSet(`${CACHE_RECENT_HOSTELS}:5`, recentHostels);

  return { summary, recentUsers, recentHostels };
};