package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.UserDto;
import com.ABES_HCL.VenueVista.dto.UserRoleUpdateRequest;
import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final String superAdminUsername;

    public UserController(
            UserRepository userRepository,
            @Value("${venuevista.admin.username:anant}") String superAdminUsername
    ) {
        this.userRepository = userRepository;
        this.superAdminUsername = superAdminUsername.trim();
    }

    @GetMapping
    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserDto.from(user, superAdminUsername))
                .toList();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        return userRepository.findById(id)
                .map(user -> {
                    if (superAdminUsername.equals(user.getUsername())) {
                        throw new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "The seeded super admin role cannot be changed."
                        );
                    }
                    user.setRole(request.role());
                    return userRepository.save(user);
                })
                .map(user -> UserDto.from(user, superAdminUsername))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
