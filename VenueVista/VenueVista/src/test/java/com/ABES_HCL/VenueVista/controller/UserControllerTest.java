package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.UserDto;
import com.ABES_HCL.VenueVista.dto.UserRoleUpdateRequest;
import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class UserControllerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserController userController = new UserController(userRepository, "master-admin");

    @Test
    void getUsersMarksConfiguredSuperAdmin() {
        User superAdmin = User.builder()
                .id(1L)
                .username("master-admin")
                .password("encoded")
                .role("ROLE_ADMIN")
                .roles(new HashSet<>(Set.of("ROLE_ADMIN")))
                .build();
        when(userRepository.findAll()).thenReturn(List.of(superAdmin));

        UserDto result = userController.getUsers().get(0);

        assertTrue(result.superAdmin());
    }

    @Test
    void updateRoleChangesLegacyRoleAndRolesCollection() {
        User user = User.builder()
                .id(12L)
                .username("member")
                .password("encoded")
                .role("ROLE_CREATOR")
                .roles(new HashSet<>(Set.of("ROLE_USER", "ROLE_CREATOR")))
                .build();
        when(userRepository.findById(12L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserDto result = userController.updateUserRole(
                12L,
                new UserRoleUpdateRequest("ROLE_ADMIN")
        ).getBody();

        assertEquals("ROLE_ADMIN", result.role());
        assertEquals(Set.of("ROLE_ADMIN"), result.roles());
        verify(userRepository).save(user);
    }

    @Test
    void updateRoleCannotModifySeededSuperAdmin() {
        User superAdmin = User.builder()
                .id(1L)
                .username("master-admin")
                .password("encoded")
                .role("ROLE_ADMIN")
                .roles(new HashSet<>(Set.of("ROLE_ADMIN")))
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(superAdmin));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userController.updateUserRole(1L, new UserRoleUpdateRequest("ROLE_USER"))
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals(Set.of("ROLE_ADMIN"), superAdmin.getRoles());
        verify(userRepository).findById(1L);
        verifyNoMoreInteractions(userRepository);
    }
}
