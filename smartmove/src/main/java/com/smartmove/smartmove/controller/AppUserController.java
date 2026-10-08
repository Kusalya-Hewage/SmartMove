package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.dto.LoginRequest;
import com.smartmove.smartmove.dto.LoginResponse;
import com.smartmove.smartmove.dto.RegisterRequest;
import com.smartmove.smartmove.entity.AppUser;
import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.repository.AppUserRepository;
import com.smartmove.smartmove.repository.PassengerRepository;
import com.smartmove.smartmove.service.AppUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class AppUserController {


    private final AppUserService appUserService;

    private final AppUserRepository appUserRepository;

    private final PassengerRepository passengerRepository;

    private final PasswordEncoder passwordEncoder;


    public AppUserController(
            AppUserService appUserService,
            AppUserRepository appUserRepository,
            PassengerRepository passengerRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.appUserService =
                appUserService;

        this.appUserRepository =
                appUserRepository;

        this.passengerRepository =
                passengerRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    /* =====================================================
       GET ALL USERS
       ===================================================== */

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {

        return ResponseEntity.ok(
                appUserService.getAllUsers()
        );

    }


    /* =====================================================
       GET USER BY ID
       ===================================================== */

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<AppUser> getUserById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                appUserService.getUserById(id)
        );

    }


    /* =====================================================
       GET USER BY USERNAME
       ===================================================== */

    @GetMapping("/username/{username}")
    public ResponseEntity<AppUser> getUserByUsername(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                appUserService.getUserByUsername(
                        username
                )
        );

    }


    /* =====================================================
       CREATE USER
       ===================================================== */

    @PostMapping
    public ResponseEntity<AppUser> createUser(
            @RequestBody AppUser user
    ) {

        return ResponseEntity.ok(
                appUserService.createUser(user)
        );

    }


    /* =====================================================
       UPDATE USER
       ===================================================== */

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<AppUser> updateUser(
            @PathVariable Long id,
            @RequestBody AppUser user
    ) {

        return ResponseEntity.ok(
                appUserService.updateUser(
                        id,
                        user
                )
        );

    }


    /* =====================================================
       UPDATE STATUS
       ===================================================== */

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<AppUser> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                appUserService.updateStatus(
                        id,
                        status
                )
        );

    }


    /* =====================================================
       DELETE USER
       ===================================================== */

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id
    ) {

        appUserService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully."
        );

    }


    /* =====================================================
       REGISTER
       ===================================================== */

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Registration data is required."
                                )
                        );

            }


            String role =
                    request.getRole() == null
                            ? ""
                            : request.getRole()
                            .trim()
                            .toUpperCase();


            /* =============================================
               CHECK ROLE
               ============================================= */

            if (
                    !role.equals("ADMIN") &&
                            !role.equals("PASSENGER")
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Please select a valid role."
                                )
                        );

            }


            /* =============================================
               CHECK PASSWORD
               ============================================= */

            if (
                    request.getPassword() == null ||
                            request.getPassword().isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Password is required."
                                )
                        );

            }


            if (
                    request.getPassword()
                            .length() < 6
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Password must contain at least 6 characters."
                                )
                        );

            }


            /* =============================================
               ADMIN REGISTRATION
               ============================================= */

            if (
                    role.equals("ADMIN")
            ) {

                return registerAdmin(
                        request
                );

            }


            /* =============================================
               PASSENGER REGISTRATION
               ============================================= */

            return registerPassenger(
                    request
            );

        }
        catch (Exception error) {

            error.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Registration failed: " +
                                            (
                                                    error.getMessage() != null
                                                            ? error.getMessage()
                                                            : "Unknown error"
                                            )
                            )
                    );

        }

    }


    /* =====================================================
       ADMIN REGISTRATION
       ===================================================== */

    private ResponseEntity<?> registerAdmin(
            RegisterRequest request
    ) {

        String username =
                request.getUsername() == null
                        ? ""
                        : request.getUsername()
                        .trim();


        if (username.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Admin username is required."
                            )
                    );

        }


        /* Check existing admin username */

        Optional<AppUser> existingUser =
                appUserRepository
                        .findByUsername(
                                username
                        );


        if (existingUser.isPresent()) {

            return ResponseEntity
                    .status(
                            HttpStatus.CONFLICT
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Username already exists."
                            )
                    );

        }


        /* Create admin */

        AppUser user =
                new AppUser();


        user.setUsername(
                username
        );


        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        user.setRole(
                "ADMIN"
        );


        user.setStatus(
                "ACTIVE"
        );


        AppUser savedUser =
                appUserRepository.save(
                        user
                );


        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        Map.of(
                                "success",
                                true,

                                "message",
                                "Admin registration successful.",

                                "userId",
                                savedUser.getUserId(),

                                "username",
                                savedUser.getUsername(),

                                "role",
                                savedUser.getRole()
                        )
                );

    }


    /* =====================================================
       PASSENGER REGISTRATION
       ===================================================== */

    private ResponseEntity<?> registerPassenger(
            RegisterRequest request
    ) {

        String fullName =
                request.getFullName() == null
                        ? ""
                        : request.getFullName()
                        .trim();


        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                        .trim();


        String phone =
                request.getPhone() == null
                        ? ""
                        : request.getPhone()
                        .trim();


        String address =
                request.getAddress() == null
                        ? ""
                        : request.getAddress()
                        .trim();


        if (fullName.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Full name is required."
                            )
                    );

        }


        if (email.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email is required."
                            )
                    );

        }


        if (phone.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Phone number is required."
                            )
                    );

        }


        /* =============================================
           CHECK DUPLICATE EMAIL
           ============================================= */

        Optional<Passenger> existingPassenger =
                passengerRepository
                        .findByEmailIgnoreCase(
                                email
                        );


        if (existingPassenger.isPresent()) {

            return ResponseEntity
                    .status(
                            HttpStatus.CONFLICT
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "A passenger account with this email already exists."
                            )
                    );

        }


        /* =============================================
           CREATE PASSENGER
           ============================================= */

        Passenger passenger =
                new Passenger();


        passenger.setFullName(
                fullName
        );


        passenger.setEmail(
                email
        );


        passenger.setPhone(
                phone
        );


        passenger.setAddress(
                address
        );


        passenger.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        /* =============================================
           SET REQUIRED DATABASE VALUES
           ============================================= */

        passenger.setRegistrationDate(
                LocalDate.now()
        );


        passenger.setStatus(
                "ACTIVE"
        );


        /* =============================================
           SAVE PASSENGER
           ============================================= */

        Passenger savedPassenger =
                passengerRepository.save(
                        passenger
                );


        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        Map.of(
                                "success",
                                true,

                                "message",
                                "Passenger registration successful.",

                                "userId",
                                savedPassenger.getPassengerId(),

                                "username",
                                savedPassenger.getEmail(),

                                "role",
                                "PASSENGER"
                        )
                );

    }


    /* =====================================================
       LOGIN
       ===================================================== */

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session
    ) {


        if (
                request.getUsername() == null ||
                        request.getUsername().isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Username or email is required."
                    );

        }


        if (
                request.getPassword() == null ||
                        request.getPassword().isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Password is required."
                    );

        }


        if (
                request.getRole() == null ||
                        request.getRole().isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Please select a role."
                    );

        }


        String selectedRole =
                request.getRole()
                        .trim()
                        .toUpperCase();


        if (
                "PASSENGER".equals(
                        selectedRole
                )
        ) {

            return passengerLogin(
                    request,
                    session
            );

        }


        if (
                "ADMIN".equals(
                        selectedRole
                )
        ) {

            return adminLogin(
                    request,
                    session
            );

        }


        return ResponseEntity
                .badRequest()
                .body(
                        "Invalid role selected."
                );

    }


    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    private ResponseEntity<?> adminLogin(
            LoginRequest request,
            HttpSession session
    ) {

        AppUser user;


        try {

            user =
                    appUserService
                            .getUserByUsername(
                                    request.getUsername()
                                            .trim()
                            );

        }
        catch (RuntimeException exception) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid admin username or password."
                    );

        }


        if (user == null) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid admin username or password."
                    );

        }


        if (
                user.getRole() == null ||
                        !"ADMIN".equalsIgnoreCase(
                                user.getRole()
                        )
        ) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "This account is not an ADMIN account."
                    );

        }


        if (
                user.getPassword() == null ||
                        user.getPassword().isBlank()
        ) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid admin username or password."
                    );

        }


        boolean passwordCorrect =
                checkPassword(
                        request.getPassword(),
                        user.getPassword()
                );


        if (!passwordCorrect) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid admin username or password."
                    );

        }


        if (
                user.getStatus() != null &&
                        !"ACTIVE".equalsIgnoreCase(
                                user.getStatus()
                        )
        ) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "Admin account is not active."
                    );

        }


        session.setAttribute(
                "userId",
                user.getUserId()
        );


        session.setAttribute(
                "username",
                user.getUsername()
        );


        session.setAttribute(
                "role",
                "ADMIN"
        );


        session.setAttribute(
                "accountType",
                "ADMIN"
        );


        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "Admin login successful.",
                        user.getUserId(),
                        user.getUsername(),
                        "ADMIN"
                )
        );

    }


    /* =====================================================
       PASSENGER LOGIN
       ===================================================== */

    private ResponseEntity<?> passengerLogin(
            LoginRequest request,
            HttpSession session
    ) {

        String email =
                request.getUsername()
                        .trim();


        Optional<Passenger> result =
                passengerRepository
                        .findByEmailIgnoreCase(
                                email
                        );


        if (result.isEmpty()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid passenger email or password."
                    );

        }


        Passenger passenger =
                result.get();


        if (
                passenger.getPassword() == null ||
                        passenger.getPassword().isBlank()
        ) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid passenger email or password."
                    );

        }


        boolean passwordCorrect =
                checkPassword(
                        request.getPassword(),
                        passenger.getPassword()
                );


        if (!passwordCorrect) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid passenger email or password."
                    );

        }


        if (
                passenger.getStatus() != null &&
                        !"ACTIVE".equalsIgnoreCase(
                                passenger.getStatus()
                        )
        ) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "Passenger account is not active."
                    );

        }


        session.setAttribute(
                "userId",
                passenger.getPassengerId()
        );


        session.setAttribute(
                "passengerId",
                passenger.getPassengerId()
        );


        session.setAttribute(
                "username",
                passenger.getEmail()
        );


        session.setAttribute(
                "passengerName",
                passenger.getFullName()
        );


        session.setAttribute(
                "role",
                "PASSENGER"
        );


        session.setAttribute(
                "accountType",
                "PASSENGER"
        );


        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "Passenger login successful.",
                        passenger.getPassengerId(),
                        passenger.getEmail(),
                        "PASSENGER"
                )
        );

    }


    /* =====================================================
       PASSWORD CHECK
       ===================================================== */

    private boolean checkPassword(
            String rawPassword,
            String storedPassword
    ) {

        if (
                storedPassword.startsWith("$2a$") ||
                        storedPassword.startsWith("$2b$") ||
                        storedPassword.startsWith("$2y$")
        ) {

            try {

                return passwordEncoder.matches(
                        rawPassword,
                        storedPassword
                );

            }
            catch (Exception exception) {

                return false;

            }

        }


        return storedPassword.equals(
                rawPassword
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpSession session
    ) {

        session.invalidate();

        return ResponseEntity.ok(
                "Logout successful."
        );

    }


    /* =====================================================
       CURRENT USER
       ===================================================== */

    @GetMapping("/current-user")
    public ResponseEntity<?> currentUser(
            HttpSession session
    ) {

        Object userId =
                session.getAttribute(
                        "userId"
                );


        Object username =
                session.getAttribute(
                        "username"
                );


        Object role =
                session.getAttribute(
                        "role"
                );


        if (
                userId == null ||
                        username == null ||
                        role == null
        ) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "No user is currently logged in."
                    );

        }


        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "Current user retrieved.",
                        (Long) userId,
                        (String) username,
                        (String) role
                )
        );

    }

}