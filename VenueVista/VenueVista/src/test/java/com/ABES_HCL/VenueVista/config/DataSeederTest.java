package com.ABES_HCL.VenueVista.config;

import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataSeederTest {

    @Test
    void transactionallyReplacesExistingUsersWithSuperAdmin() throws Exception {
        DataSeeder dataSeeder = new DataSeeder();
        ReflectionTestUtils.setField(dataSeeder, "adminUsername", "anant");
        ReflectionTestUtils.setField(dataSeeder, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(dataSeeder, "adminPassword", "a-secure-password-with-16-chars");

        UserRepository userRepository = mock(UserRepository.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        TransactionStatus transactionStatus = mock(TransactionStatus.class);
        when(transactionManager.getTransaction(any(TransactionDefinition.class))).thenReturn(transactionStatus);
        when(passwordEncoder.encode("a-secure-password-with-16-chars")).thenReturn("encoded-password");

        CommandLineRunner seeder = dataSeeder.seedUsers(
                userRepository,
                jdbcTemplate,
                passwordEncoder,
                transactionManager
        );
        seeder.run();

        var operations = inOrder(jdbcTemplate, userRepository);
        operations.verify(jdbcTemplate).update("DELETE FROM user_roles");
        operations.verify(jdbcTemplate).update("DELETE FROM users");
        operations.verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(user ->
                user.getUsername().equals("anant")
                        && user.getRole().equals("ROLE_ADMIN")
                        && user.getRoles().equals(Set.of("ROLE_ADMIN"))
                        && user.getPassword().equals("encoded-password")
        ));
        verify(passwordEncoder).encode("a-secure-password-with-16-chars");
        verify(transactionManager).commit(transactionStatus);
    }
}
