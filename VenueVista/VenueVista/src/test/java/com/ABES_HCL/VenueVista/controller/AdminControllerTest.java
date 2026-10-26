package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.UserDto;
import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AdminControllerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final AdminController adminController = new AdminController(userRepository, "admin");

    @Test
    void masterAdminPromotesUserAndPreservesExistingRoles() {
        User target = User.builder()
                .id(42L)
                .username("organizer")
                .email("organizer@example.com")
                .password("encoded")
                .role("ROLE_CREATOR")
                .roles(new HashSet<>(Set.of("ROLE_USER", "ROLE_CREATOR")))
                .build();
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("admin")
                .password("encoded")
                .authorities("ROLE_ADMIN")
                .build();
        when(userRepository.findById(42L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        UserDto response = adminController.promoteUser(42L, principal);

        assertEquals(Set.of("ROLE_USER", "ROLE_CREATOR", "ROLE_ADMIN"), response.roles());
        verify(userRepository).save(target);
    }

    @Test
    void nonMasterAdminReceivesForbiddenWithoutUpdatingTarget() {
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("another-admin")
                .password("encoded")
                .authorities("ROLE_ADMIN")
                .build();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminController.promoteUser(42L, principal)
        );

        assertEquals(403, exception.getStatusCode().value());
        verifyNoInteractions(userRepository);
    }

    @Test
    void missingPrincipalIsForbidden() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminController.promoteUser(42L, null)
        );

        assertEquals(403, exception.getStatusCode().value());
        verifyNoInteractions(userRepository);
    }
}
