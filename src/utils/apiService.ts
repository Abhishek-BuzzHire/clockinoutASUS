import axios from 'axios';
import { Candidate } from '@/lib/types';
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiService = {
    async addCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'>): Promise<Candidate> {
        try {
            // axios automatically serializes the candidate object to JSON and sets Content-Type header
            const response = await axios.post(`${API_URL}/api/candidates/`, candidate, { headers: { Authorization: `Bearer ${token}` } });
            return response.data; // axios puts the response body in .data
        } catch (error) {
            console.error('Error adding Candidate:', error);
            // axios errors have a response property with status and data
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                throw new Error(error.response.data.error || `API error: ${error.response.status}`);
            }
            throw error; // Rethrow other errors
        }
    },
}

const token = Cookies.get("access");

const api = axios.create({
    
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'multipart/form-data',
    }
});

export const uploadAndParseResume = async (file : File) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await api.post('/api/parse-resume/', formData);
        return response.data;
    } catch (error){
        console.error("Error Upload resume: ", error);
        throw error;
    }
};