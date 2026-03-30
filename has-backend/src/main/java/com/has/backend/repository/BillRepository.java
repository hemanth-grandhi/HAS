package com.has.backend.repository;

import com.has.backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByCheckIn_TokenNumber(String tokenNumber);
}
