package com.ABES_HCL.VenueVista.dto;

import com.ABES_HCL.VenueVista.entity.User;

import java.util.Set;

public record UserDto(Long id, String username, String email, String role, Set<String> roles) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), Set.copyOf(user.getRoles()));
    }
}
