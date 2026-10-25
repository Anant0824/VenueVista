package com.ABES_HCL.VenueVista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate; // Import LocalDate

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    @Column(nullable = false)
    private String genre;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date; // Changed from String to LocalDate

    @Column(nullable = false)
    private String time;

    @NotBlank(message = "Venue is required")
    @Column(nullable = false)
    private String venue;

    @Column(nullable = false)
    private String city;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Base price cannot be negative")
    @Column(nullable = false)
    private BigDecimal basePrice;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer soldCount = 0;

    @Column(nullable = false, length = 1000)
    private String image;
}