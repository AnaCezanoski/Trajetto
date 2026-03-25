import { api } from './api';

export class RouteService {
    static async getRoute(origin: any, destination: any) {
        const response = await api.post('/route', {
            origin,
            destination,
        })

        return response.data;
    }

}