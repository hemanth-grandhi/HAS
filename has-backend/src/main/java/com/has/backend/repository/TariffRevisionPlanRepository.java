package com.has.backend.repository;

import com.has.backend.entity.TariffRevisionPlan;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TariffRevisionPlanRepository extends JpaRepository<TariffRevisionPlan, Long> {
    List<TariffRevisionPlan> findByAppliedFalseAndEffectiveFromLessThanEqual(LocalDate date);
}
