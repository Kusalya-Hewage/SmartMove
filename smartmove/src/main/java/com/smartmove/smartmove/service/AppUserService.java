package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.AppUser;
import com.smartmove.smartmove.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {

        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AppUser> getAllUsers() {

        return appUserRepository.findAll();
    }


    public AppUser getUserById(Long id) {

        return appUserRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + id));
    }


    public AppUser getUserByUsername(String username) {

        return appUserRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with username: "
                                        + username));
    }

    public AppUser createUser(AppUser user) {

        if (user.getUsername() == null
                || user.getUsername().isBlank()) {

            throw new RuntimeException(
                    "Username is required.");
        }

        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required.");
        }

        String username = user.getUsername().trim();

        if (appUserRepository.existsByUsername(username)) {

            throw new RuntimeException(
                    "Username already exists.");
        }

        user.setUsername(username);


        if (user.getRole() == null
                || user.getRole().isBlank()) {

            user.setRole("PASSENGER");
        }

        user.setRole(
                user.getRole().trim().toUpperCase()
        );

        if (!user.getRole().equals("ADMIN")
                && !user.getRole().equals("PASSENGER")) {

            throw new RuntimeException(
                    "Role must be ADMIN or PASSENGER.");
        }


        if (user.getStatus() == null
                || user.getStatus().isBlank()) {

            user.setStatus("ACTIVE");
        }

        user.setStatus(
                user.getStatus().trim().toUpperCase()
        );

        if (!user.getStatus().equals("ACTIVE")
                && !user.getStatus().equals("INACTIVE")) {

            throw new RuntimeException(
                    "Status must be ACTIVE or INACTIVE.");
        }


        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return appUserRepository.save(user);
    }


    public AppUser updateUser(
            Long id,
            AppUser updatedUser) {

        AppUser existingUser = getUserById(id);


        if (updatedUser.getUsername() != null
                && !updatedUser.getUsername().isBlank()) {

            String newUsername =
                    updatedUser.getUsername().trim();

            if (!newUsername.equals(
                    existingUser.getUsername())
                    && appUserRepository
                    .existsByUsername(newUsername)) {

                throw new RuntimeException(
                        "Username already exists.");
            }

            existingUser.setUsername(newUsername);
        }



        if (updatedUser.getPassword() != null
                && !updatedUser.getPassword().isBlank()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            updatedUser.getPassword()
                    )
            );
        }


        if (updatedUser.getRole() != null
                && !updatedUser.getRole().isBlank()) {

            String newRole =
                    updatedUser.getRole()
                            .trim()
                            .toUpperCase();

            if (!newRole.equals("ADMIN")
                    && !newRole.equals("PASSENGER")) {

                throw new RuntimeException(
                        "Role must be ADMIN or PASSENGER.");
            }

            existingUser.setRole(newRole);
        }


        if (updatedUser.getStatus() != null
                && !updatedUser.getStatus().isBlank()) {

            String newStatus =
                    updatedUser.getStatus()
                            .trim()
                            .toUpperCase();

            if (!newStatus.equals("ACTIVE")
                    && !newStatus.equals("INACTIVE")) {

                throw new RuntimeException(
                        "Status must be ACTIVE or INACTIVE.");
            }

            existingUser.setStatus(newStatus);
        }

        return appUserRepository.save(existingUser);
    }


    public AppUser updateStatus(
            Long id,
            String status) {

        AppUser user = getUserById(id);

        if (status == null
                || status.isBlank()) {

            throw new RuntimeException(
                    "Status is required.");
        }

        status = status.trim().toUpperCase();

        if (!status.equals("ACTIVE")
                && !status.equals("INACTIVE")) {

            throw new RuntimeException(
                    "Status must be ACTIVE or INACTIVE.");
        }

        user.setStatus(status);

        return appUserRepository.save(user);
    }



    public AppUser saveUser(AppUser user) {

        return appUserRepository.save(user);
    }



    public void deleteUser(Long id) {

        AppUser user = getUserById(id);

        appUserRepository.delete(user);
    }
}