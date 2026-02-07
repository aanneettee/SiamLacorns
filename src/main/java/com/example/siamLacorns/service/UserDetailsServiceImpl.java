package com.example.siamLacorns.service;

import com.example.siamLacorns.exception.AuthenticationException;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // ✅ Теперь ищем по username, а не по email
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("Пользователь не найден: " + username));

        return new UserDetailsImpl(user);
    }
}