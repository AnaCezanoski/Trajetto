//package com.trajetto.backend.config;
//
//import com.google.auth.oauth2.GoogleCredentials;
//import com.google.firebase.FirebaseApp;
//import com.google.firebase.FirebaseOptions;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.stereotype.Service;
//
//import javax.annotation.PostConstruct;
//import java.io.IOException;
//import java.io.InputStream;
//import java.io.UncheckedIOException;
//
//@Service
//public class FirebaseConfig {
//
//    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);
//
//    @Value("${firebase.storage.bucket}")
//    private String storageBucket;
//
//    @PostConstruct
//    public void initialize() {
//        try {
//            if (FirebaseApp.getApps().isEmpty()) {
//                InputStream serviceAccountStream = new ClassPathResource("serviceAccountKey.json").getInputStream();
//
//                FirebaseOptions options = FirebaseOptions.builder()
//                        .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
//                        .setStorageBucket(storageBucket)
//                        .build();
//
//                FirebaseApp.initializeApp(options);
//                log.info("Firebase foi inicializado com sucesso!");
//            }
//        } catch (IOException e) {
//            log.error("Falha ao inicializar o Firebase", e);
//            throw new UncheckedIOException("Falha ao ler o arquivo de credenciais do Firebase (serviceAccountKey.json). Verifique se o arquivo está em src/main/resources.", e);
//        }
//    }
//}