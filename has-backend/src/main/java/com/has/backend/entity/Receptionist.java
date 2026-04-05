package com.has.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("Receptionist")
public class Receptionist extends SystemUser {
}
