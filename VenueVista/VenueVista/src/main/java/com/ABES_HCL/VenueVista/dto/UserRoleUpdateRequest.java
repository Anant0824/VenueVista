package com.ABES_HCL.VenueVista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserRoleUpdateRequest(
        @NotBlank
        @Pattern(regexp = "ROLE_(USER|CREATOR)", message = "Role must be ROLE_USER or ROLE_CREATOR")
        String role
) {
}
