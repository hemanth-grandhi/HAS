package com.has.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CateringManager")
public class CateringManager extends SystemUser {
}
