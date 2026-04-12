import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services/routeService';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const PIN_COLORS = [
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', 
    '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'
];

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
    const [points, setPoints] = useState<any[]>([]);


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
            setPoints(sortedPlaces);


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
                    <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#000000" />
                )}

                {points.map((point, index) => {
                    const isOrigin = point.orderIndex === 0;
                    const currentColor = PIN_COLORS[index % PIN_COLORS.length];

                    return (
                        <Marker
                            key={`${point.name}-${index}`}
                            coordinate={point}
                            anchor={isOrigin ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 1 }}
                            tracksViewChanges={true}
                        >
                            {isOrigin ? (
                                <View style={styles.originDot} />
                            ) : (
                                <View style={styles.pinoContainer}>
                                    <MaterialIcons name="location-on" size={40} color={currentColor} />

                                    <View style={styles.pinoNumeroContainer}>
                                        <Text style={styles.pinoNumeroText}>
                                            {index}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Marker>
                    );
                })}
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
    originDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1068b5',
        borderWidth: 3,
        borderColor: '#ffffff',
        elevation: 5,
        zIndex: 99,
    },

    pinoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
    },
    pinoNumeroContainer: {
        position: 'absolute',
        top: 12,
        width: 15,
        height: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    pinoNumeroText: {
        color: '#023665',
        fontWeight: 'bold',
        fontSize: 12,
    },
});