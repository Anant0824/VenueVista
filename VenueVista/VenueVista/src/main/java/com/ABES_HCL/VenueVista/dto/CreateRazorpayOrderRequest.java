package com.ABES_HCL.VenueVista.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRazorpayOrderRequest(
        @NotNull Long eventId,
        @NotBlank String ticketType,
        @Min(1) @Max(10) int quantity
) {
}
