import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
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
    const { user } = useAuth();
    const { itinerary, fetchItinerary } = useItineraryStore();
    const [region, setRegion] = useState<Region | undefined>(undefined);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [points, setPoints] = useState<{ latitude: number; longitude: number }[]>([]);


    useEffect(() => {
        if (user?.id) {
            fetchItinerary(user.id);
        }
    }, [user]);


    useEffect(() => {
        const setupMap = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permissão negada');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const currentRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(currentRegion);
        };

        setupMap();
    }, []);


    const fetchRouteFromItinerary = async () => {
        if (!itinerary || itinerary.places.length === 0) return;

        const sortedPlaces = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

        const origin = { latitude: sortedPlaces[0].latitude, longitude: sortedPlaces[0].longitude };
        const destination = { latitude: sortedPlaces[sortedPlaces.length - 1].latitude, longitude: sortedPlaces[sortedPlaces.length - 1].longitude };


        const waypoints = sortedPlaces.slice(1, -1).map(p => ({
            lat: p.latitude,
            lng: p.longitude,
        }));

        try {
            const data = await RouteService.getRoute({
                origin: { lat: origin.latitude, lng: origin.longitude },
                destination: { lat: destination.latitude, lng: destination.longitude },
                waypoints: waypoints,
            });

            const decoded = polyline.decode(data.geometry);
            const coords = decoded.map(([lat, lng]: number[]) => ({
                latitude: lat,
                longitude: lng,
            }));

            setRouteCoords(coords);
            setPoints(sortedPlaces.map(p => ({ latitude: p.latitude, longitude: p.longitude })));


            setRegion((prev) => {
                if (!prev) return {
                    latitude: origin.latitude,
                    longitude: origin.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                };

                return {
                    ...prev,
                    latitude: origin.latitude,
                    longitude: origin.longitude,
                };
            });

        } catch (error) {
            console.error("Erro na rota:", error);
        }
    };

    useEffect(() => {
        if (itinerary) {
            fetchRouteFromItinerary();
        }
    }, [itinerary]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation={true}
            >
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
                )}

                {points.map((point, index) => (
                    <Marker key={index} coordinate={point}>
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>{index + 1}</Text>
                        </View>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
};

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