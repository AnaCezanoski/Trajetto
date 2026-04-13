package com.trajetto.backend.itinerary.data;

import java.util.List;

public class RomePlacesData {

    public record RomePlace(
            String name,
            String address,
            double latitude,
            double longitude,
            List<String> profiles
    ) {}

    public static final List<RomePlace> PLACES = List.of(
            new RomePlace("Colosseum",
                    "Piazza del Colosseo, 1, Roma",
                    41.8902, 12.4922,
                    List.of("CULTURAL", "AVENTUREIRO")),

            new RomePlace("Roman Forum",
                    "Via Sacra, Roma",
                    41.8925, 12.4853,
                    List.of("CULTURAL", "SOLITARIO")),

            new RomePlace("Vatican Museums",
                    "Viale Vaticano, Roma",
                    41.9065, 12.4536,
                    List.of("CULTURAL", "LUXO")),

            new RomePlace("Pantheon",
                    "Piazza della Rotonda, Roma",
                    41.8986, 12.4769,
                    List.of("CULTURAL", "SOLITARIO")),

            new RomePlace("Trevi Fountain",
                    "Piazza di Trevi, Roma",
                    41.9009, 12.4833,
                    List.of("SOCIAL", "RELAXAMENTO")),

            new RomePlace("Spanish Steps",
                    "Piazza di Spagna, Roma",
                    41.9058, 12.4823,
                    List.of("SOCIAL", "LUXO")),

            new RomePlace("Borghese Gallery",
                    "Piazzale Scipione Borghese, 5, Roma",
                    41.9138, 12.4923,
                    List.of("CULTURAL", "LUXO")),

            new RomePlace("Villa Borghese Gardens",
                    "Viale del Museo Borghese, Roma",
                    41.9136, 12.4938,
                    List.of("NATUREZA", "RELAXAMENTO")),

            new RomePlace("Piazza Navona",
                    "Piazza Navona, Roma",
                    41.8992, 12.4730,
                    List.of("SOCIAL", "MOCHILEIRO")),

            new RomePlace("Campo de' Fiori",
                    "Campo de' Fiori, Roma",
                    41.8955, 12.4722,
                    List.of("SOCIAL", "MOCHILEIRO")),

            new RomePlace("Trastevere",
                    "Piazza di Santa Maria in Trastevere, Roma",
                    41.8896, 12.4686,
                    List.of("MOCHILEIRO", "SOCIAL")),

            new RomePlace("Castel Sant'Angelo",
                    "Lungotevere Castello, 50, Roma",
                    41.9031, 12.4663,
                    List.of("AVENTUREIRO", "CULTURAL")),

            new RomePlace("Palatine Hill",
                    "Via Sacra, Roma",
                    41.8876, 12.4877,
                    List.of("AVENTUREIRO", "CULTURAL")),

            new RomePlace("Aventine Hill Garden",
                    "Piazza Pietro d'Illiria, Roma",
                    41.8833, 12.4795,
                    List.of("NATUREZA", "SOLITARIO")),

            new RomePlace("Circus Maximus",
                    "Via del Circo Massimo, Roma",
                    41.8861, 12.4851,
                    List.of("AVENTUREIRO", "CULTURAL")),

            new RomePlace("Piazza del Popolo",
                    "Piazza del Popolo, Roma",
                    41.9107, 12.4762,
                    List.of("SOCIAL", "RELAXAMENTO")),

            new RomePlace("Capitoline Museums",
                    "Piazza del Campidoglio, 1, Roma",
                    41.8935, 12.4829,
                    List.of("CULTURAL", "LUXO")),

            new RomePlace("Testaccio Market",
                    "Via Aldo Manuzio, Roma",
                    41.8791, 12.4756,
                    List.of("MOCHILEIRO", "SOCIAL")),

            new RomePlace("Bioparco di Roma",
                    "Viale del Giardino Zoologico, 1, Roma",
                    41.9215, 12.4859,
                    List.of("NATUREZA", "AVENTUREIRO")),

            new RomePlace("Giardino degli Aranci",
                    "Via di Santa Sabina, Roma",
                    41.8830, 12.4804,
                    List.of("NATUREZA", "SOLITARIO", "RELAXAMENTO"))
    );
}
