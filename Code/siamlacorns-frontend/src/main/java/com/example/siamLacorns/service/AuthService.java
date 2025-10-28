package com.example.siamLacorns.service;

import com.example.siamLacorns.config.JwtUtil;
import com.example.siamLacorns.dto.AuthRequestDTO;
import com.example.siamLacorns.dto.AuthResponseDTO;
import com.example.siamLacorns.exception.AuthenticationException;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public AuthResponseDTO authenticate(AuthRequestDTO authRequest) {


        try {
            // Проверяем существует ли пользователь
            User user = userRepository.findByUsername(authRequest.getUsername())
                    .orElseThrow(() -> {
                        logger.error("❌ User not found: {}", authRequest.getUsername());
                        return new AuthenticationException("Пользователь не найден");
                    });


            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );


            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Используем UserDetails из authentication или загружаем заново
            UserDetails userDetails;
            if (authentication.getPrincipal() instanceof UserDetails) {
                userDetails = (UserDetails) authentication.getPrincipal();
            } else {
                userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
            }

            String jwt = jwtUtil.generateToken(userDetails);


            // Получаем роль из UserDetails или из объекта User
            String role;
            if (userDetails instanceof UserDetailsImpl) {
                role = ((UserDetailsImpl) userDetails).getRole();
            } else {
                // Если role в User - это String, просто используем его
                role = user.getRole(); // УБРАН .name() - так как это String
            }

            // Получаем ID пользователя
            Long userId;
            if (userDetails instanceof UserDetailsImpl) {
                userId = ((UserDetailsImpl) userDetails).getId();
            } else {
                userId = user.getId();
            }

            return new AuthResponseDTO(
                    jwt,
                    userDetails.getUsername(),
                    role,
                    userId
            );

        } catch (BadCredentialsException e) {
           throw new AuthenticationException("Неверное имя пользователя или пароль");
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new AuthenticationException("Ошибка аутентификации: " + e.getMessage());
        }
    }
}