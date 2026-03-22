package com.has.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "frequent_guests")
public class FrequentGuest {
    @Id
    private String frequentGuestId;

    @OneToOne
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    private String discountTier;
    private Integer rewardPoints;
}
