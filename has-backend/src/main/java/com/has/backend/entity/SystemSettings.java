package com.has.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingId;

    private String discountTier;
    private Integer rewardPointThreshold;
    private Double occupancyThreshold;

    public Long getSettingId() {
        return settingId;
    }

    public void setSettingId(Long settingId) {
        this.settingId = settingId;
    }

    public String getDiscountTier() {
        return discountTier;
    }

    public void setDiscountTier(String discountTier) {
        this.discountTier = discountTier;
    }

    public Integer getRewardPointThreshold() {
        return rewardPointThreshold;
    }

    public void setRewardPointThreshold(Integer rewardPointThreshold) {
        this.rewardPointThreshold = rewardPointThreshold;
    }

    public Double getOccupancyThreshold() {
        return occupancyThreshold;
    }

    public void setOccupancyThreshold(Double occupancyThreshold) {
        this.occupancyThreshold = occupancyThreshold;
    }
}
