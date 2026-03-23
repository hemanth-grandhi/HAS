package com.has.backend.repository;

import com.has.backend.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByTokenNumber(String tokenNumber);
}
