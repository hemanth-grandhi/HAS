package com.has.backend.repository;

import com.has.backend.entity.CateringOrder;

import java.util.List;

public interface CateringOrderRepository extends CrudRepository<CateringOrder, Long> {
    List<CateringOrder> findByCheckInTokenNumber(String tokenNumber);
}
