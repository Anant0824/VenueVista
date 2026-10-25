package com.ABES_HCL.VenueVista.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDto {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String eventDate;
    private String eventVenue;
    private String ticketType;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}