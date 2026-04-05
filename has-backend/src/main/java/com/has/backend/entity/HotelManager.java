package com.has.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("HotelManager")
public class HotelManager extends SystemUser {
}
