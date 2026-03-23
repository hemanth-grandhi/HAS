package com.has.backend.repository;

import com.has.backend.entity.CateringOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CateringOrderRepository extends JpaRepository<CateringOrder, Long> {
    List<CateringOrder> findByCheckIn_TokenNumber(String tokenNumber);
}
