package com.example.siamLacorns.controller;

import com.example.siamLacorns.repository.UserRepository;
import com.example.siamLacorns.dto.CollectionDTO;
import com.example.siamLacorns.dto.RegisterRequestDTO;
import com.example.siamLacorns.dto.UserDTO;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String username = authentication.getName();

            UserDTO user = userService.getUserByUsernameWithCollections(username);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        try {
            UserDTO user = userService.getUserByUsername(username);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> createUser(@RequestBody com.example.siamLacorns.dto.RegisterRequestDTO registerRequest) {
        try {
            User user = new User(
                    registerRequest.getUsername(),
                    registerRequest.getEmail(),
                    registerRequest.getBirthDate(),
                    registerRequest.getPassword()
            );

            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Получение пользователя по ID - ТЕПЕРЬ С ПРОВЕРКОЙ
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Получение всех пользователей - ТОЛЬКО АДМИН
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() ")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDetails) {
        try {
            User user = new User();
            user.setId(id);
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());

            if (userDetails.getBirthDate() != null) {
                user.setBirthDate(userDetails.getBirthDate());
            } else {
                // Если дата null, оставляем текущее значение
                User existingUser = userRepository.findById(id).orElseThrow();
                user.setBirthDate(existingUser.getBirthDate());
            }

            user.setAvatar(userDetails.getAvatar());

            UserDTO updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не выбран");
            }

            String username = authentication.getName();

            // 📁 Папка для сохранения аватаров (можно изменить путь)
            String uploadDir = "D:\\3 курс\\ЖЦРПО\\code\\SiamLacorns\\src\\main\\resources\\static\\uploads\\avatars";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // 🧾 Создаём уникальное имя файла
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String newFileName = username + "_" + System.currentTimeMillis() + fileExtension;

            java.nio.file.Path filePath = uploadPath.resolve(newFileName);
            file.transferTo(filePath.toFile());

            // 🔗 Сохраняем путь к файлу в БД
            String avatarUrl = "/uploads/avatars/" + newFileName;
            userService.updateAvatar(username, avatarUrl);

            return ResponseEntity.ok(Map.of("message", "Аватар успешно загружен", "avatarUrl", avatarUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при загрузке аватара: " + e.getMessage());
        }
    }


    // Удаление пользователя - ТЕПЕРЬ С ПРОВЕРКОЙ
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated() ")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Добавление сериала в коллекцию - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @PostMapping("/{userId}/collections/{collectionName}/series/{seriesId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.id")
    public ResponseEntity<String> addSeriesToCollection(
            @PathVariable Long userId,
            @PathVariable String collectionName,
            @PathVariable Long seriesId) {
        userService.addLacornToCollection(userId, collectionName, seriesId);
        return ResponseEntity.ok("Сериал добавлен в коллекцию " + collectionName);
    }

    // Удаление сериала из коллекции - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @DeleteMapping("/{userId}/collections/{collectionName}/series/{seriesId}")
    @PreAuthorize("isAuthenticated() ")
    public ResponseEntity<String> removeSeriesFromCollection(
            @PathVariable Long userId,
            @PathVariable String collectionName,
            @PathVariable Long seriesId) {
        userService.removeLacornFromCollection(userId, collectionName, seriesId);
        return ResponseEntity.ok("Сериал удален из коллекции " + collectionName);
    }

    // Получение всех коллекций пользователя - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @GetMapping("/{userId}/collections")
    @PreAuthorize("isAuthenticated() ")
    public ResponseEntity<List<CollectionDTO>> getUserCollections(@PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user.getCollections());
    }
}