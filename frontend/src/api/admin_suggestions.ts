import axios from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';
import { getAllUsers } from './admin_students_review';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const CACHE_SUGGESTIONS = 'cache:admin:suggestions';

export interface RawSuggestion {
    p_userid: number;
    p_improvements: string;
    p_defects: string;
}

export interface SuggestionRow {
    userId: number;
    rowKey: string;
    userName: string;
    userType: string;
    improvements: string;
    defects: string;
}

export const getAllSuggestions = async (bypassCache = false): Promise<SuggestionRow[]> => {
    if (!bypassCache) {
        const cached = cacheGet<SuggestionRow[]>(CACHE_SUGGESTIONS);
        if (cached) return cached;
    }

    try {
        const [suggestionsRes, users] = await Promise.all([
            axios.get<{ success: boolean; result: RawSuggestion[] }>(
                `${API_BASE_URL}/faststay_app/AppSuggestion/display/`
            ),
            getAllUsers()
        ]);

        if (!suggestionsRes.data.success || !suggestionsRes.data.result) return [];

        const userMap = new Map(users.map(u => [u.userid, u]));

        const rows: SuggestionRow[] = suggestionsRes.data.result.map((s, i) => {
            const user = userMap.get(s.p_userid);
            return {
                userId: s.p_userid,
                rowKey: `${s.p_userid}-${i}`,
                userName: user ? `${user.fname} ${user.lname}` : `User #${s.p_userid}`,
                userType: user?.usertype ?? 'Unknown',
                improvements: s.p_improvements ?? '',
                defects: s.p_defects ?? '',
            };
        });

        cacheSet(CACHE_SUGGESTIONS, rows);
        return rows;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
};
