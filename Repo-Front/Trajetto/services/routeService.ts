import { api } from './api';

type Route = {
    origin: any,
    destination: any,
    waypoints?: any[],
}
export class RouteService {
    static async getRoute(route: Route) {
        const response = await api.post('/route', route)

        return response.data;
    }

}