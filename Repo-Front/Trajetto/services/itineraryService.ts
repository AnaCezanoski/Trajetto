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

    static async getAllItineraries(userId: number) {
        const response = await api.get(`/itinerary/all/${userId}`);
        return response.data;
    }

    static async activateItinerary(itineraryId: number, userId: number) {
        const response = await api.patch(`/itinerary/${itineraryId}/activate/${userId}`);
        return response.data;
    }

    static async deleteItinerary(itineraryId: number, userId: number) {
        await api.delete(`/itinerary/${itineraryId}/user/${userId}`);
    }

    static async rateItinerary(itineraryId: number, rating: number | null, ratingDescription: string | null) {
        const response = await api.patch(`/itinerary/${itineraryId}/rating`, { rating, ratingDescription });
        return response.data;
    }

    static async updateDate(itineraryId: number, date: string | null) {
        const response = await api.patch(`/itinerary/${itineraryId}/date`, { date });
        return response.data;
    }

    static async replacePlace(itineraryId: number, orderIndex: number, place: {
        name: string; address: string; latitude: number; longitude: number;
        estimatedVisitTime: string; openingHours?: string | null;
        category?: string | null; fee?: string | null;
    }) {
        const response = await api.patch(`/itinerary/${itineraryId}/place/${orderIndex}`, place);
        return response.data;
    }
}
