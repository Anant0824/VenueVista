package com.ABES_HCL.VenueVista.dto;

import com.ABES_HCL.VenueVista.entity.User;

public record UserDto(Long id, String username, String email, String role) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
