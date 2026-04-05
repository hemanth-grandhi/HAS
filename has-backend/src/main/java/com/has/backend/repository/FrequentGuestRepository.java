package com.has.backend.repository;

import com.has.backend.entity.FrequentGuest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FrequentGuestRepository extends JpaRepository<FrequentGuest, String> {
    Optional<FrequentGuest> findByGuest_GuestId(Long guestId);
}
