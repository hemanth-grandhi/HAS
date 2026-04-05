package com.has.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "frequent_guests")
public class FrequentGuest {
    @Id
    private int frequentGuestId;

    @OneToOne
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    private String discountTier;
    private Integer rewardPoints;

    public int getFrequentGuestId() {
        return frequentGuestId;
    }

    public void setFrequentGuestId(int frequentGuestId) {
        this.frequentGuestId = frequentGuestId;
    }

    public Guest getGuest() {
        return guest;
    }

    public void setGuest(Guest guest) {
        this.guest = guest;
    }

    public String getDiscountTier() {
        return discountTier;
    }

    public void setDiscountTier(String discountTier) {
        this.discountTier = discountTier;
    }

    public Integer getRewardPoints() {
        return rewardPoints;
    }

    public void setRewardPoints(Integer rewardPoints) {
        this.rewardPoints = rewardPoints;
    }
}
