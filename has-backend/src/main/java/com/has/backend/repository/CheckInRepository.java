package com.has.backend.repository;

import com.has.backend.entity.CheckIn;

import java.util.Optional;

public interface CheckInRepository extends CrudRepository<CheckIn, Long> {
    Optional<CheckIn> findByTokenNumber(String tokenNumber);
}
