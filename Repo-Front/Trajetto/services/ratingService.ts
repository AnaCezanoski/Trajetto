import { api } from './api';

export interface Rating {
    id: number;
    touristSpotXid: string;
    userId: number;
    userName?: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export interface RatingSummary {
    average: number;
    count: number;
}

export interface CreateRatingRequest {
    placeId: string;
    userId: number;
    userName: string;
    rating: number;
    comment?: string;
}

export class RatingService {
    
    static async getSummary(placeId: string): Promise<RatingSummary> {
        const [listRes, avgRes] = await Promise.all([
            api.get(`/api/ratings/spot`, { params: { xid: placeId } }),
            api.get(`/api/ratings/spot/average`, { params: { xid: placeId } }),
        ]);
        return {
            average: avgRes.data,
            count: listRes.data.length,
        };
    }

    static async getByPlace(placeId: string): Promise<Rating[]> {
        const response = await api.get(`/api/ratings/spot`, { params: { xid: placeId } });
        return response.data;
    }

    static async create(data: CreateRatingRequest): Promise<Rating> {
        const response = await api.post(`/api/ratings`, {
            placeId: data.placeId,
            userName: data.userName,
            userId: data.userId,
            rating: data.rating,
            comment: data.comment
        });
        return response.data;
    }

    static async update(
        id: number,
        data: { userId: number; rating: number; comment?: string }
    ): Promise<Rating> {
        const response = await api.put(`/api/ratings/${id}`, null, {
            params: { userId: data.userId, rating: data.rating, comment: data.comment }
        });
        return response.data;
    }

    static async delete(id: number, userId: number): Promise<void> {
        await api.delete(`/api/ratings/${id}`, { params: { userId } });
    }
}