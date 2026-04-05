package com.has.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingId;

    private String discountTier;
    private Double discountPercentage;
    private Integer rewardPointsPerStay;
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

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Integer getRewardPointsPerStay() {
        return rewardPointsPerStay;
    }

    public void setRewardPointsPerStay(Integer rewardPointsPerStay) {
        this.rewardPointsPerStay = rewardPointsPerStay;
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
