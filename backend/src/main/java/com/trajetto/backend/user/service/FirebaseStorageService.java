//package com.trajetto.backend.user.service;
//
//import com.google.cloud.storage.Blob;
//import com.google.cloud.storage.Bucket;
//import com.google.firebase.cloud.StorageClient;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.util.UUID;
//
//@Service
//public class FirebaseStorageService {
//
//    public String uploadImage(MultipartFile file) throws IOException {
//        if (file.isEmpty()) {
//            throw new IllegalStateException("Cannot upload empty file.");
//        }
//
//        Bucket bucket = StorageClient.getInstance().bucket();
//        String fileName = "profile_pictures/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
//
//        Blob blob = bucket.create(fileName, file.getInputStream(), file.getContentType());
//
//        final String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString());
//        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media", bucket.getName(), encodedFileName);
//    }
//}