import { RouteService } from '@/services/routeService';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const Mapa = () => {
    const [region, setRegion] = useState<Region | null>(null);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [points, setPoints] = useState<{ latitude: number; longitude: number }[]>([]);

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('Permissão de localização negada');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            console.log('pegou location');

            await fecthRoute(newRegion);

        }

        getLocation();
    }, [])

    const defaultRegion = {
        latitude: -14.2350,
        longitude: -51.9253,
        latitudeDelta: 10,
        longitudeDelta: 10,
    };

    const fecthRoute = async (region: Region) => {
        if (!region) return;

        const origin = {
            latitude: region.latitude,
            longitude: region.longitude,
        };

        const destination = {
            latitude: -25.4300,
            longitude: -49.2700,
        };

        const waypoints = [
            { latitude: -25.4400, longitude: -49.2800 },
            { latitude: -25.4500, longitude: -49.2900 },
        ];

        const toAPI = (point: { latitude: number; longitude: number }) => ({
            lat: point.latitude,
            lng: point.longitude,
        });

        try {
            const data = await RouteService.getRoute({
                origin: toAPI(origin),
                destination: toAPI(destination),
                waypoints: waypoints.map(toAPI),
            });

            const decoded = polyline.decode(data.geometry);

            const coords = decoded.map(([lat, lng]: number[]) => ({
                latitude: lat,
                longitude: lng,
            }));

            setRouteCoords(coords);
            setPoints([origin, ...waypoints, destination])
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        console.log('routeCoords: ', routeCoords);
    }, [routeCoords])


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={
                    region ?? defaultRegion
                }
            >
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                    />
                )}

                {points.map((points, index) => (
                    <Marker key={index} coordinate={points}>
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>
                                {index + 1}
                            </Text>
                        </View>

                    </Marker>
                ))}




            </MapView>
        </View>
    );
}

export default Mapa


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    marker: {
        backgroundColor: 'black',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerText: {
        color: 'white',
        fontWeight: 'bold',
    },
});