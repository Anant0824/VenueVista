package com.ABES_HCL.VenueVista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserRoleUpdateRequest(
        @NotBlank
        @Pattern(regexp = "ROLE_(USER|CREATOR|ADMIN)",
                message = "Role must be ROLE_USER, ROLE_CREATOR, or ROLE_ADMIN")
        String role
) {
}
