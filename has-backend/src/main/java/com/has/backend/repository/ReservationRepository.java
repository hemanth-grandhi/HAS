package com.has.backend.repository;

import com.has.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByTokenNumber(String tokenNumber);

    @Query("SELECT r FROM Reservation r WHERE r.room.roomId = :roomId " +
           "AND r.startDate < :endDate AND r.endDate > :startDate")
    List<Reservation> findOverlappingReservations(
        @Param("roomId") Long roomId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    List<Reservation> findByGuest_NameAndGuest_ContactNumber(String name, String contactNumber);
}
