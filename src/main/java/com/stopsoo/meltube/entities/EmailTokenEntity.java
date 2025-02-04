package com.stopsoo.meltube.entities;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = {"userEmail", "key"})
public class EmailTokenEntity {
    private String userEmail;
    private String key;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isUsed;
}