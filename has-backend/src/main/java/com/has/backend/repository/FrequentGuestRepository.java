package com.has.backend.repository;

import com.has.backend.entity.FrequentGuest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FrequentGuestRepository extends JpaRepository<FrequentGuest, String> {
}
