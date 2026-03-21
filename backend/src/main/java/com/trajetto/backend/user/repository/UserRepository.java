package com.trajetto.backend.user.repository;

import com.trajetto.backend.user.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserRepository extends JpaRepository<UserModel,Long> {

    UserModel findByEmail(String email);

    boolean existsByEmail(String email);

    //boolean existsByCpf(String cpf);
    
    List<UserModel> findByIsAdmin(Boolean isAdmin);

    long countByIsAdmin(boolean isAdmin);

    @Transactional
    @Modifying
    @Query("UPDATE UserModel u SET u.isAdmin = :isAdmin WHERE u.id = :id")
    void updateUserRole(@Param("id") Long id, @Param("isAdmin") boolean isAdmin);
}
