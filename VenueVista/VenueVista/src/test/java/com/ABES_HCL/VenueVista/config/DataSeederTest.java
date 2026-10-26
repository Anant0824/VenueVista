package com.ABES_HCL.VenueVista.config;

import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataSeederTest {

    @Test
    void skipsAdminSeedWhenDefaultUsernameAlreadyExists() throws Exception {
        DataSeeder dataSeeder = new DataSeeder();
        ReflectionTestUtils.setField(dataSeeder, "seedAdmin", true);
        ReflectionTestUtils.setField(dataSeeder, "adminUsername", "anant");

        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        when(userRepository.existsByUsername("anant")).thenReturn(true);

        CommandLineRunner seeder = dataSeeder.seedUsers(userRepository, passwordEncoder, transactionManager);
        seeder.run();

        verify(userRepository).existsByUsername("anant");
        verify(userRepository, never()).save(any());
        verify(userRepository, never()).deleteAll();
        verify(passwordEncoder, never()).encode(any());
    }
}
