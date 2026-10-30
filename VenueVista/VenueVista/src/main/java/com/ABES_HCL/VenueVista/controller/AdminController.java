package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.UserDto;
import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String ADMIN_ROLE = "ROLE_ADMIN";

    private final UserRepository userRepository;
    private final String masterAdminUsername;

    public AdminController(
            UserRepository userRepository,
            @Value("${venuevista.admin.username:anant}") String masterAdminUsername
    ) {
        this.userRepository = userRepository;
        this.masterAdminUsername = masterAdminUsername;
    }

    @PostMapping("/promote/{userId}")
    public UserDto promoteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        if (principal == null || !masterAdminUsername.equals(principal.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the master admin can promote users.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        user.getRoles().add(ADMIN_ROLE);
        userRepository.save(user);
        return UserDto.from(user, masterAdminUsername);
    }
}
