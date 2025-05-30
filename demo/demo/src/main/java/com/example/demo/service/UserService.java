package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private EmailService emailService;

    @Autowired
    private TwilioService twilioService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail()) || userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone number already exists!");
        }

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found.");
        }
        userRepository.deleteById(id);
    }

    //dam update la tot in afara de parola
    public User updateUser(Long id, User updatedUser) {
        Optional<User> existingUserOpt = userRepository.findById(id);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            existingUser.setName(updatedUser.getName());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            existingUser.setIsAdmin(updatedUser.getIsAdmin());
            existingUser.setIsBanned(updatedUser.getIsBanned());
            existingUser.setScore(updatedUser.getScore());
            return userRepository.save(existingUser);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Verificăm dacă utilizatorul este banat
            if (user.getIsBanned()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is banned and cannot log in.");
            }

            System.out.println("Stored Hashed Password: " + user.getPassword());
            System.out.println("Password Match Result: " + passwordEncoder.matches(password, user.getPassword()));

            if (passwordEncoder.matches(password, user.getPassword())) {
                return user; // Login reușit
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getIsBanned()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already banned");
        }

        user.setIsBanned(true);
        User savedUser = userRepository.save(user);

        // Send ban email
        emailService.sendBanNotification(user.getEmail(), user.getName());

        // Send ban SMS (if phone number is available)
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            String message = "Hi " + user.getName() + ", your account has been banned due to a violation of the platform rules.";
            twilioService.sendSms(user.getPhoneNumber(), message);
        }

        return savedUser;
    }

    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getIsBanned()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not banned");
        }

        user.setIsBanned(false);
        return userRepository.save(user);
    }


}
