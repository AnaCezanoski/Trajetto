package com.trajetto.backend.user;

import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;
    private final RatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (itineraryRepository.count() > 0) return;
        log.info("Seeding demo data...");
        seed();
        log.info("Demo data seeded.");
    }

    private void seed() {
        String pwd = passwordEncoder.encode("senha123");

        // ─── Usuários ──────────────────────────────────────────────────────────
        UserModel u0 = user("Ana",      "Silva",      "ana.silva@email.com",       pwd, "Brasil",    "Aventureiro",  LocalDate.of(1995,  3, 15));
        UserModel u1 = user("Carlos",   "Ferreira",   "carlos.f@email.com",        pwd, "Portugal",  "Cultural",     LocalDate.of(1988,  7, 22));
        UserModel u2 = user("Maria",    "Santos",     "maria.santos@email.com",    pwd, "Brasil",    "Relaxante",    LocalDate.of(2000, 11,  5));
        UserModel u3 = user("João",     "Oliveira",   "joao.oliveira@email.com",   pwd, "Brasil",    "Histórico",    LocalDate.of(1975,  4, 18));
        UserModel u4 = user("Laura",    "Martin",     "laura.martin@email.com",    pwd, "Espanha",   "Gastronômico", LocalDate.of(1992,  9, 30));
        UserModel u5 = user("Pedro",    "Costa",      "pedro.costa@email.com",     pwd, "Portugal",  "Aventureiro",  LocalDate.of(1985,  6, 12));
        UserModel u6 = user("Sofia",    "Rodrigues",  "sofia.r@email.com",         pwd, "Brasil",    "Cultural",     LocalDate.of(2001,  2, 28));
        UserModel u7 = user("Miguel",   "Alves",      "miguel.alves@email.com",    pwd, "Argentina", "Histórico",    LocalDate.of(1968, 12,  3));
        UserModel u8 = user("Isabella", "Greco",      "isabella.g@email.com",      pwd, "Itália",    "Gastronômico", LocalDate.of(1998,  8, 17));
        UserModel u9 = user("Lucas",    "Teixeira",   "lucas.teixeira@email.com",  pwd, "Brasil",    "Relaxante",    LocalDate.of(1990,  1, 25));

        userRepository.saveAll(List.of(u0, u1, u2, u3, u4, u5, u6, u7, u8, u9));

        // ─── Itinerários ───────────────────────────────────────────────────────
        // Coordenadas de Roma: 41.9028, 12.4964

        // Ana: 2 roteiros
        ItineraryModel a1 = itinerary(u0, LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 13), 5,
                "Roma histórica incrível, superou todas as expectativas!");
        addPlace(a1, "osm_colosseum",    "Colosseum",    "Piazza del Colosseo, Roma",          41.8902, 12.4922, "historic",  "yes", 0);
        addPlace(a1, "osm_roman_forum",  "Roman Forum",  "Via Sacra, Roma",                    41.8925, 12.4853, "historic",  "yes", 1);
        addPlace(a1, "osm_circus",       "Circus Maximus","Via del Circo Massimo, Roma",        41.8858, 12.4852, "historic",  "no",  2);

        ItineraryModel a2 = itinerary(u0, LocalDate.of(2026, 3, 5), LocalDate.of(2026, 3, 9), 4,
                "Fontes e praças maravilhosas, Roma tem um charme único.");
        addPlace(a2, "osm_trevi_fountain", "Trevi Fountain",  "Piazza di Trevi, Roma",          41.9009, 12.4833, "tourism",   "no",  0);
        addPlace(a2, "osm_piazza_navona",  "Piazza Navona",   "Piazza Navona, Roma",            41.8992, 12.4731, "tourism",   "no",  1);
        addPlace(a2, "osm_spanish_steps",  "Spanish Steps",   "Piazza di Spagna, Roma",         41.9058, 12.4823, "tourism",   "no",  2);
        addPlace(a2, "osm_campo_de_fiori", "Campo de' Fiori", "Campo de' Fiori, Roma",          41.8955, 12.4722, "market",    "no",  3);

        // Carlos: 2 roteiros
        ItineraryModel b1 = itinerary(u1, LocalDate.of(2026, 1, 20), LocalDate.of(2026, 1, 25), 5,
                "O Vaticano é uma experiência espiritual e cultural única.");
        addPlace(b1, "osm_vatican_museums",  "Vatican Museums",      "Viale Vaticano, Roma",      41.9065, 12.4536, "museums",   "yes", 0);
        addPlace(b1, "osm_st_peters",        "St. Peter's Basilica", "Piazza San Pietro, Vaticano", 41.9022, 12.4539, "religious", "no",  1);
        addPlace(b1, "osm_castel",           "Castel Sant'Angelo",   "Lungotevere Castello, Roma", 41.9031, 12.4663, "museums",   "yes", 2);

        ItineraryModel b2 = itinerary(u1, LocalDate.of(2026, 2, 14), LocalDate.of(2026, 2, 17), 4,
                "O Pantheon impressionou muito, conservação histórica incrível.");
        addPlace(b2, "osm_pantheon",        "Pantheon",         "Piazza della Rotonda, Roma",     41.8986, 12.4769, "historic",  "no",  0);
        addPlace(b2, "osm_trevi_fountain",  "Trevi Fountain",   "Piazza di Trevi, Roma",          41.9009, 12.4833, "tourism",   "no",  1);
        addPlace(b2, "osm_piazza_venezia",  "Piazza Venezia",   "Piazza Venezia, Roma",           41.8959, 12.4820, "tourism",   "no",  2);

        // Maria: 2 roteiros
        ItineraryModel c1 = itinerary(u2, LocalDate.of(2026, 2, 20), LocalDate.of(2026, 2, 24), 3,
                "Bom roteiro mas corrido demais. Precisava de mais dias.");
        addPlace(c1, "osm_borghese",       "Borghese Gallery",  "Piazzale Scipione Borghese, Roma", 41.9139, 12.4925, "museums",  "yes", 0);
        addPlace(c1, "osm_spanish_steps",  "Spanish Steps",     "Piazza di Spagna, Roma",           41.9058, 12.4823, "tourism",  "no",  1);
        addPlace(c1, "osm_piazza_navona",  "Piazza Navona",     "Piazza Navona, Roma",              41.8992, 12.4731, "tourism",  "no",  2);

        ItineraryModel c2 = itinerary(u2, LocalDate.of(2026, 4, 3), LocalDate.of(2026, 4, 6), 5,
                "Segunda visita a Roma foi perfeita. Campo de' Fiori é obrigatório!");
        addPlace(c2, "osm_campo_de_fiori", "Campo de' Fiori", "Campo de' Fiori, Roma",          41.8955, 12.4722, "market",    "no",  0);
        addPlace(c2, "osm_piazza_venezia", "Piazza Venezia",  "Piazza Venezia, Roma",            41.8959, 12.4820, "tourism",   "no",  1);
        addPlace(c2, "osm_pantheon",       "Pantheon",        "Piazza della Rotonda, Roma",      41.8986, 12.4769, "historic",  "no",  2);

        // João: 2 roteiros
        ItineraryModel d1 = itinerary(u3, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 6), 5,
                "Roteiro histórico perfeito. Coliseu + Fórum Romano é a combinação ideal.");
        addPlace(d1, "osm_colosseum",   "Colosseum",    "Piazza del Colosseo, Roma",          41.8902, 12.4922, "historic", "yes", 0);
        addPlace(d1, "osm_roman_forum", "Roman Forum",  "Via Sacra, Roma",                    41.8925, 12.4853, "historic", "yes", 1);
        addPlace(d1, "osm_pantheon",    "Pantheon",     "Piazza della Rotonda, Roma",         41.8986, 12.4769, "historic", "no",  2);
        addPlace(d1, "osm_circus",      "Circus Maximus","Via del Circo Massimo, Roma",        41.8858, 12.4852, "historic", "no",  3);

        ItineraryModel d2 = itinerary(u3, LocalDate.of(2026, 5, 8), LocalDate.of(2026, 5, 11), 4,
                "Vaticano e Castel Sant Angelo completaram minha imersão histórica em Roma.");
        addPlace(d2, "osm_vatican_museums", "Vatican Museums",    "Viale Vaticano, Roma",          41.9065, 12.4536, "museums",  "yes", 0);
        addPlace(d2, "osm_castel",          "Castel Sant'Angelo", "Lungotevere Castello, Roma",    41.9031, 12.4663, "museums",  "yes", 1);

        // Laura: 2 roteiros
        ItineraryModel e1 = itinerary(u4, LocalDate.of(2026, 3, 12), LocalDate.of(2026, 3, 16), 4,
                "Trastevere e Campo de' Fiori são perfeitos para quem ama gastronomia.");
        addPlace(e1, "osm_campo_de_fiori", "Campo de' Fiori", "Campo de' Fiori, Roma",          41.8955, 12.4722, "market",  "no",  0);
        addPlace(e1, "osm_piazza_navona",  "Piazza Navona",   "Piazza Navona, Roma",             41.8992, 12.4731, "tourism", "no",  1);
        addPlace(e1, "osm_trastevere",     "Trastevere",      "Piazza di Santa Maria in Trastevere", 41.8889, 12.4690, "tourism", "no", 2);

        ItineraryModel e2 = itinerary(u4, LocalDate.of(2026, 4, 20), LocalDate.of(2026, 4, 23), 5,
                "A Fontana di Trevi ao pôr do sol é mágica. Vale cada segundo!");
        addPlace(e2, "osm_trevi_fountain", "Trevi Fountain", "Piazza di Trevi, Roma",           41.9009, 12.4833, "tourism", "no", 0);
        addPlace(e2, "osm_spanish_steps",  "Spanish Steps",  "Piazza di Spagna, Roma",          41.9058, 12.4823, "tourism", "no", 1);

        // Pedro: 2 roteiros
        ItineraryModel f1 = itinerary(u5, LocalDate.of(2026, 3, 18), LocalDate.of(2026, 3, 21), 4,
                "Coliseu ainda impressiona após tantas fotos. É preciso ver pessoalmente.");
        addPlace(f1, "osm_colosseum",   "Colosseum",     "Piazza del Colosseo, Roma",         41.8902, 12.4922, "historic", "yes", 0);
        addPlace(f1, "osm_circus",      "Circus Maximus","Via del Circo Massimo, Roma",        41.8858, 12.4852, "historic", "no",  1);
        addPlace(f1, "osm_roman_forum", "Roman Forum",   "Via Sacra, Roma",                   41.8925, 12.4853, "historic", "yes", 2);

        ItineraryModel f2 = itinerary(u5, LocalDate.of(2026, 5, 2), LocalDate.of(2026, 5, 6), 3,
                "Galeria Borghese exige reserva antecipada, mas vale demais.");
        addPlace(f2, "osm_borghese",      "Borghese Gallery", "Piazzale Scipione Borghese, Roma", 41.9139, 12.4925, "museums",  "yes", 0);
        addPlace(f2, "osm_spanish_steps", "Spanish Steps",    "Piazza di Spagna, Roma",           41.9058, 12.4823, "tourism",  "no",  1);
        addPlace(f2, "osm_piazza_navona", "Piazza Navona",    "Piazza Navona, Roma",              41.8992, 12.4731, "tourism",  "no",  2);

        // Sofia: 2 roteiros
        ItineraryModel g1 = itinerary(u6, LocalDate.of(2026, 4, 14), LocalDate.of(2026, 4, 19), 5,
                "Roteiro cultural completo. A Capela Sistina é inesquecível.");
        addPlace(g1, "osm_vatican_museums", "Vatican Museums",      "Viale Vaticano, Roma",         41.9065, 12.4536, "museums",   "yes", 0);
        addPlace(g1, "osm_castel",          "Castel Sant'Angelo",   "Lungotevere Castello, Roma",   41.9031, 12.4663, "museums",   "yes", 1);
        addPlace(g1, "osm_pantheon",        "Pantheon",             "Piazza della Rotonda, Roma",   41.8986, 12.4769, "historic",  "no",  2);

        ItineraryModel g2 = itinerary(u6, LocalDate.of(2026, 5, 22), LocalDate.of(2026, 5, 25), 4,
                "Trevi Fountain à meia-noite: impossível esquecer.");
        addPlace(g2, "osm_trevi_fountain", "Trevi Fountain", "Piazza di Trevi, Roma",             41.9009, 12.4833, "tourism", "no", 0);
        addPlace(g2, "osm_piazza_venezia", "Piazza Venezia", "Piazza Venezia, Roma",              41.8959, 12.4820, "tourism", "no", 1);

        // Miguel: 2 roteiros
        ItineraryModel h1 = itinerary(u7, LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 9), 5,
                "Roteiro histórico fantástico. Como argentino, me sinto em casa nessa grandiosidade.");
        addPlace(h1, "osm_colosseum",   "Colosseum",    "Piazza del Colosseo, Roma",          41.8902, 12.4922, "historic", "yes", 0);
        addPlace(h1, "osm_roman_forum", "Roman Forum",  "Via Sacra, Roma",                    41.8925, 12.4853, "historic", "yes", 1);
        addPlace(h1, "osm_pantheon",    "Pantheon",     "Piazza della Rotonda, Roma",         41.8986, 12.4769, "historic", "no",  2);
        addPlace(h1, "osm_piazza_venezia","Piazza Venezia","Piazza Venezia, Roma",             41.8959, 12.4820, "tourism",  "no",  3);

        ItineraryModel h2 = itinerary(u7, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 13), 3,
                "Campo de' Fiori é uma das mais animadas. Ótimo para gastronomia.");
        addPlace(h2, "osm_circus",         "Circus Maximus",  "Via del Circo Massimo, Roma",   41.8858, 12.4852, "historic", "no", 0);
        addPlace(h2, "osm_campo_de_fiori", "Campo de' Fiori", "Campo de' Fiori, Roma",         41.8955, 12.4722, "market",   "no", 1);

        // Isabella: 2 roteiros
        ItineraryModel i1 = itinerary(u8, LocalDate.of(2026, 5, 15), LocalDate.of(2026, 5, 18), 5,
                "Como italiana, Roma me emociona sempre. A Trevi Fountain é inesquecível.");
        addPlace(i1, "osm_trevi_fountain", "Trevi Fountain",  "Piazza di Trevi, Roma",         41.9009, 12.4833, "tourism", "no", 0);
        addPlace(i1, "osm_piazza_navona",  "Piazza Navona",   "Piazza Navona, Roma",           41.8992, 12.4731, "tourism", "no", 1);
        addPlace(i1, "osm_campo_de_fiori", "Campo de' Fiori", "Campo de' Fiori, Roma",         41.8955, 12.4722, "market",  "no", 2);

        ItineraryModel i2 = itinerary(u8, LocalDate.of(2026, 6, 2), LocalDate.of(2026, 6, 6), 4,
                "Coliseu sempre impressiona, mesmo para quem já foi várias vezes.");
        addPlace(i2, "osm_colosseum",   "Colosseum",     "Piazza del Colosseo, Roma",         41.8902, 12.4922, "historic", "yes", 0);
        addPlace(i2, "osm_roman_forum", "Roman Forum",   "Via Sacra, Roma",                   41.8925, 12.4853, "historic", "yes", 1);
        addPlace(i2, "osm_circus",      "Circus Maximus","Via del Circo Massimo, Roma",        41.8858, 12.4852, "historic", "no",  2);

        // u9 (Lucas) fica sem itinerário → demonstra "usuários sem roteiro"

        itineraryRepository.saveAll(List.of(a1, a2, b1, b2, c1, c2, d1, d2, e1, e2, f1, f2, g1, g2, h1, h2, i1, i2));

        // ─── Avaliações de locais (RatingModel) ────────────────────────────────

        // Colosseum: 5 avaliações (média ≈ 4.6)
        ratingRepository.saveAll(List.of(
            rating(u0.getId(), "osm_colosseum", 5, "Incrível, vale cada centavo! Uma das maiores obras da humanidade."),
            rating(u3.getId(), "osm_colosseum", 5, "Fantástico, história viva! Combine com o Fórum Romano."),
            rating(u5.getId(), "osm_colosseum", 4, "Impressionante mas muito cheio. Chegue bem cedo."),
            rating(u7.getId(), "osm_colosseum", 5, "O melhor de Roma sem dúvida. Obrigatório!"),
            rating(u8.getId(), "osm_colosseum", 4, "Lindo mas chegue cedo para evitar as filas enormes.")
        ));

        // Trevi Fountain: 5 avaliações (média ≈ 4.8)
        ratingRepository.saveAll(List.of(
            rating(u0.getId(), "osm_trevi_fountain", 5, "Maravilhosa! Joguei minha moeda e já quero voltar!"),
            rating(u1.getId(), "osm_trevi_fountain", 5, "Simplesmente perfeita. Melhor à noite com a iluminação."),
            rating(u4.getId(), "osm_trevi_fountain", 5, "Melhor ponto turístico de Roma, sem dúvida."),
            rating(u6.getId(), "osm_trevi_fountain", 4, "Muito lotada mas vale demais! Vista de tirar o fôlego."),
            rating(u8.getId(), "osm_trevi_fountain", 5, "Como italiana me orgulho desta obra. É deslumbrante.")
        ));

        // Pantheon: 4 avaliações (média ≈ 4.25)
        ratingRepository.saveAll(List.of(
            rating(u1.getId(), "osm_pantheon", 4, "Arquitetura impressionante para 2000 anos de idade."),
            rating(u2.getId(), "osm_pantheon", 5, "Muito melhor do que esperava! O óculo é fascinante."),
            rating(u3.getId(), "osm_pantheon", 5, "Incrível conservação histórica. Entrada gratuita é um bônus."),
            rating(u7.getId(), "osm_pantheon", 3, "Bom mas muito turístico. Difícil apreciar com tanta gente.")
        ));

        // Vatican Museums: 4 avaliações (média ≈ 4.5)
        ratingRepository.saveAll(List.of(
            rating(u1.getId(), "osm_vatican_museums", 5, "A Capela Sistina é inesquecível. Reserve com antecedência!"),
            rating(u3.getId(), "osm_vatican_museums", 4, "Enorme acervo, precisaria de 2 dias para ver tudo."),
            rating(u6.getId(), "osm_vatican_museums", 5, "Patrimônio da humanidade com razão. Absolutamente imperdível."),
            rating(u7.getId(), "osm_vatican_museums", 4, "Muito grande, planeje bem o tempo. Vale cada euro.")
        ));

        // Piazza Navona: 4 avaliações (média = 4.0)
        ratingRepository.saveAll(List.of(
            rating(u0.getId(), "osm_piazza_navona", 4, "Ótima para passear à noite com as fontes iluminadas."),
            rating(u2.getId(), "osm_piazza_navona", 4, "Fontes lindíssimas, especialmente a Fonte dos Quatro Rios."),
            rating(u4.getId(), "osm_piazza_navona", 5, "Animada e cheia de vida! Perfeita para jantares ao ar livre."),
            rating(u5.getId(), "osm_piazza_navona", 3, "Bonita mas os preços dos restaurantes são exagerados.")
        ));

        // Borghese Gallery: 3 avaliações (média ≈ 4.0)
        ratingRepository.saveAll(List.of(
            rating(u2.getId(), "osm_borghese", 3, "Bom mas precisava de mais tempo, apenas 2h permitidas."),
            rating(u5.getId(), "osm_borghese", 4, "Bernini é impressionante ao vivo. Vale a reserva obrigatória."),
            rating(u6.getId(), "osm_borghese", 5, "Uma das melhores galerias que já visitei no mundo.")
        ));

        // Spanish Steps: 3 avaliações (média ≈ 4.33)
        ratingRepository.saveAll(List.of(
            rating(u2.getId(), "osm_spanish_steps", 4, "Vista linda de cima! Ótimo ao entardecer."),
            rating(u4.getId(), "osm_spanish_steps", 5, "Perfeito ao pôr do sol. Um dos momentos mais bonitos de Roma."),
            rating(u5.getId(), "osm_spanish_steps", 4, "Ótimo ponto para descansar e observar a movimentação.")
        ));

        // Castel Sant'Angelo: 3 avaliações (média ≈ 4.33)
        ratingRepository.saveAll(List.of(
            rating(u1.getId(), "osm_castel", 4, "Vista incrível do Rio Tibre e da cidade lá de cima."),
            rating(u3.getId(), "osm_castel", 4, "Vale a pena subir até o topo. Exposições muito ricas."),
            rating(u6.getId(), "osm_castel", 5, "Perfeito, história e vista juntos. Um dos melhores de Roma.")
        ));

        // Roman Forum: 2 avaliações (média = 4.0)
        ratingRepository.saveAll(List.of(
            rating(u3.getId(), "osm_roman_forum", 4, "Muito rico historicamente. Combine com o Coliseu."),
            rating(u7.getId(), "osm_roman_forum", 4, "Fascinante ver onde o Império Romano foi construído.")
        ));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private UserModel user(String first, String last, String email, String pwd,
                           String country, String profile, LocalDate birth) {
        UserModel u = new UserModel();
        u.setFirstName(first);
        u.setLastName(last);
        u.setEmail(email);
        u.setPassword(pwd);
        u.setCountry(country);
        u.setTravelerProfile(profile);
        u.setBirthDate(birth);
        u.setIsAdmin(false);
        u.setVerified(true);
        return u;
    }

    private ItineraryModel itinerary(UserModel user, LocalDate start, LocalDate end,
                                     Integer rating, String ratingDesc) {
        ItineraryModel m = new ItineraryModel();
        m.setUser(user);
        m.setStartDate(start);
        m.setEndDate(end);
        m.setActive(false);
        m.setOriginLatitude(41.9028);
        m.setOriginLongitude(12.4964);
        m.setRating(rating);
        m.setRatingDescription(ratingDesc);
        return m;
    }

    private void addPlace(ItineraryModel itin, String xid, String name, String address,
                          double lat, double lng, String category, String fee, int order) {
        PlaceModel p = new PlaceModel();
        p.setXid(xid);
        p.setName(name);
        p.setAddress(address);
        p.setLatitude(lat);
        p.setLongitude(lng);
        p.setCategory(category);
        p.setFee(fee);
        p.setOrderIndex(order);
        p.setEstimatedVisitTime(LocalTime.of(9 + (order * 2), 0));
        p.setItinerary(itin);
        if (itin.getPlaces() == null) itin.setPlaces(new java.util.ArrayList<>());
        itin.getPlaces().add(p);
    }

    private RatingModel rating(Long userId, String xid, int stars, String comment) {
        RatingModel r = new RatingModel();
        r.setUserId(userId);
        r.setTouristSpotXid(xid);
        r.setRating(stars);
        r.setComment(comment);
        r.setCreatedAt(LocalDateTime.now().minusDays((long)(Math.random() * 150)));
        return r;
    }
}
