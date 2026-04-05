import { api } from './api';


export class ItineraryService {
    static async getItinerary(userId: number) {
        const response = await api.post(`/itinerary/mock/${userId}`);

        return response.data;
    }

}