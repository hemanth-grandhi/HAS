package com.has.backend.repository;

import com.has.backend.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    Optional<SystemSettings> findFirstByOrderBySettingIdAsc();
    Optional<SystemSettings> findByDiscountTier(String discountTier);
}
