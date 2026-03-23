package com.has.backend.repository;

import com.has.backend.entity.OccupancyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OccupancyRecordRepository extends JpaRepository<OccupancyRecord, Long> {
}
