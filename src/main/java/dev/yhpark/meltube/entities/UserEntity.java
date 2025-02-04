package com.stopsoo.meltube.entities;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = {"email"})
public class UserEntity {
    private String email;
    private String password;
    private String nickname;
    private String contact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private boolean isAdmin;
    private boolean isSuspended;
    private boolean isVerified;
}