package com.trajetto.backend;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * BE02.3 — as regras de negócio que passaram a ser garantidas pelo banco.
 *
 * <p>Cada uma delas continua sendo conferida pela aplicação; o que este teste
 * verifica é que o banco também recusa a violação, para o caso de a conferência
 * do Java ser contornada — carga direta, script de manutenção, endpoint novo
 * que esqueça a anotação, ou simplesmente duas requisições simultâneas passando
 * pela checagem antes de qualquer uma gravar.</p>
 *
 * <p>Uma violação por método de propósito: a exceção deixa a sessão do
 * Hibernate inutilizável, então cada caso precisa da sua própria transação.
 * Todas são revertidas no fim — o teste não deixa nada no banco.</p>
 */
@SpringBootTest
@Transactional
class SchemaRulesTest {

    private static final long USUARIO = 990_001L;
    private static final long ROTEIRO = 990_001L;

    @Autowired
    private EntityManager em;

    private void sql(String comando) {
        em.createNativeQuery(comando).executeUpdate();
    }

    private long conta(String consulta) {
        return ((Number) em.createNativeQuery(consulta).getSingleResult()).longValue();
    }

    /** Verifica que o banco recusou o comando, e que recusou pelo motivo esperado. */
    private void recusa(String restricaoEsperada, String comando) {
        Exception erro = assertThrows(Exception.class, () -> {
            sql(comando);
            em.flush();
        });

        Throwable raiz = erro;
        while (raiz.getCause() != null) {
            raiz = raiz.getCause();
        }
        String mensagem = String.valueOf(raiz.getMessage());
        assertTrue(mensagem.contains(restricaoEsperada),
                "esperava recusa por '" + restricaoEsperada + "', veio: " + mensagem);
    }

    @BeforeEach
    void seed() {
        sql("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin) "
                + "VALUES (" + USUARIO + ", 'Regra', 'Teste', 'regra.teste@trajetto.local', 'x', 1, 0)");
        sql("INSERT INTO itineraries (id, user_id, start_date, end_date, is_active) "
                + "VALUES (" + ROTEIRO + ", " + USUARIO + ", '2026-03-01', '2026-03-05', 1)");
        sql("INSERT INTO places (itinerary_id, name, order_index, latitude, longitude) "
                + "VALUES (" + ROTEIRO + ", 'Coliseu', 0, 41.89, 12.49)");
        em.flush();
    }

    @Test
    @DisplayName("Avaliação não pode apontar para um usuário que não existe")
    void avaliacaoPrecisaDeAutorReal() {
        recusa("fk_rating_user",
                "INSERT INTO RatingModel (userId, touristSpotXid, rating, createdAt) "
                        + "VALUES (99999999, 'osm_x', 5, NOW())");
    }

    @Test
    @DisplayName("Nota de avaliação fica na escala de 1 a 5")
    void notaDaAvaliacaoRespeitaAEscala() {
        recusa("ck_rating_valor",
                "INSERT INTO RatingModel (userId, touristSpotXid, rating, createdAt) "
                        + "VALUES (" + USUARIO + ", 'osm_x', 9, NOW())");
    }

    @Test
    @DisplayName("Um usuário avalia o mesmo local uma vez só")
    void umaAvaliacaoPorUsuarioEmCadaLocal() {
        sql("INSERT INTO RatingModel (userId, touristSpotXid, rating, createdAt) "
                + "VALUES (" + USUARIO + ", 'osm_x', 4, NOW())");
        em.flush();

        recusa("uk_rating_spot_user",
                "INSERT INTO RatingModel (userId, touristSpotXid, rating, createdAt) "
                        + "VALUES (" + USUARIO + ", 'osm_x', 2, NOW())");
    }

    @Test
    @DisplayName("Roteiro não pode terminar antes de começar")
    void roteiroNaoTerminaAntesDeComecar() {
        recusa("ck_itineraries_periodo",
                "UPDATE itineraries SET end_date = '2026-01-01' WHERE id = " + ROTEIRO);
    }

    @Test
    @DisplayName("Um usuário tem no máximo um roteiro ativo")
    void umRoteiroAtivoPorUsuario() {
        recusa("uk_itineraries_active_per_user",
                "INSERT INTO itineraries (user_id, start_date, is_active) "
                        + "VALUES (" + USUARIO + ", '2026-04-01', 1)");
    }

    @Test
    @DisplayName("Cada posição do roteiro é ocupada por um local só")
    void umaParadaPorPosicao() {
        recusa("uk_places_itinerary_order",
                "INSERT INTO places (itinerary_id, name, order_index) "
                        + "VALUES (" + ROTEIRO + ", 'Forum', 0)");
    }

    @Test
    @DisplayName("Parada precisa pertencer a um roteiro")
    void paradaPrecisaDeRoteiro() {
        recusa("itinerary_id",
                "INSERT INTO places (itinerary_id, name, order_index) VALUES (NULL, 'Solto', 0)");
    }

    @Test
    @DisplayName("Coordenada fora do globo é recusada")
    void coordenadaPrecisaExistirNoGlobo() {
        recusa("ck_places_coordenadas",
                "INSERT INTO places (itinerary_id, name, order_index, latitude, longitude) "
                        + "VALUES (" + ROTEIRO + ", 'Impossivel', 1, 999, 999)");
    }

    @Test
    @DisplayName("Apagar o usuário leva junto roteiros, paradas e avaliações")
    void apagarUsuarioLevaOQueEDele() {
        sql("INSERT INTO RatingModel (userId, touristSpotXid, rating, createdAt) "
                + "VALUES (" + USUARIO + ", 'osm_x', 4, NOW())");
        em.flush();

        assertEquals(1, conta("SELECT COUNT(*) FROM itineraries WHERE user_id = " + USUARIO));
        assertEquals(1, conta("SELECT COUNT(*) FROM places WHERE itinerary_id = " + ROTEIRO));
        assertEquals(1, conta("SELECT COUNT(*) FROM RatingModel WHERE userId = " + USUARIO));

        // É exatamente o que DefaultUserService.deleteUser dispara, e que antes
        // desta migração falhava com erro de integridade para qualquer usuário
        // que já tivesse gerado um roteiro.
        sql("DELETE FROM users WHERE code = " + USUARIO);
        em.flush();

        assertEquals(0, conta("SELECT COUNT(*) FROM itineraries WHERE user_id = " + USUARIO));
        assertEquals(0, conta("SELECT COUNT(*) FROM places WHERE itinerary_id = " + ROTEIRO));
        assertEquals(0, conta("SELECT COUNT(*) FROM RatingModel WHERE userId = " + USUARIO));
    }
}
