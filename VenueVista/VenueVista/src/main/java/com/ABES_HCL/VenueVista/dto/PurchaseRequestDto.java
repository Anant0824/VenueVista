package com.ABES_HCL.VenueVista.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestDto {
    @NotNull
    private Long eventId;
    @Min(1)
    @Max(10)
    private int quantity;
    @NotBlank
    private String ticketType;
}