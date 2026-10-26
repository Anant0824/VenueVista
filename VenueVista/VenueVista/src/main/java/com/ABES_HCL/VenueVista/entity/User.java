package com.ABES_HCL.VenueVista.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 254)
    private String email;

    @Column(nullable = false)
    private String role;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false)
    private Set<String> roles = new HashSet<>();

    @PostLoad
    private void populateRolesFromLegacyRole() {
        if (roles.isEmpty() && role != null && !role.isBlank()) {
            roles.add(role);
        }
    }

    @PrePersist
    @PreUpdate
    private void synchronizeLegacyRole() {
        if (roles.isEmpty() && role != null && !role.isBlank()) {
            roles.add(role);
        }
        if (!roles.isEmpty()) {
            role = roles.contains("ROLE_ADMIN") ? "ROLE_ADMIN"
                    : roles.contains("ROLE_CREATOR") ? "ROLE_CREATOR"
                    : roles.iterator().next();
        }
    }

    public void setRole(String role) {
        this.role = role;
        this.roles = role == null || role.isBlank() ? new HashSet<>() : new HashSet<>(Set.of(role));
    }
}