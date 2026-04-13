import { api } from './api';

export class ItineraryService {
    static async getItinerary(userId: number) {
        const response = await api.get(`/itinerary/active/${userId}`);
        return response.data;
    }

    static async generateItinerary(userId: number, startLatitude: number, startLongitude: number) {
        const response = await api.post('/itinerary/generate', { userId, startLatitude, startLongitude });
        return response.data;
    }

    static async deleteItinerary(itineraryId: number, userId: number) {
        await api.delete(`/itinerary/${itineraryId}/user/${userId}`);
    }
}
