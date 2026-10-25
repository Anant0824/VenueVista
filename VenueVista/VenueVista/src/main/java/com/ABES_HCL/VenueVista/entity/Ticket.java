package com.ABES_HCL.VenueVista.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId; // Links back to the purchased event

    private String razorpayOrderId;

    private String razorpayPaymentId;

    @Column(name = "buyer_username")
    private String buyerUsername;

    @Column(nullable = false)
    private String eventTitle;

    @Column(nullable = false)
    private String eventDate;

    @Column(nullable = false)
    private String eventVenue;

    @Column(nullable = false)
    private String ticketType; // "GA" or "VIP"

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal totalPrice;
}