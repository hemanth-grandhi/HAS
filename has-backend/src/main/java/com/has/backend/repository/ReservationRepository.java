package com.has.backend.repository;

import com.has.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByTokenNumber(String tokenNumber);
}
