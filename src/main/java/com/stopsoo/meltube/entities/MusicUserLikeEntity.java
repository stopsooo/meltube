package com.stopsoo.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@EqualsAndHashCode(of = {"musicIndex", "userEmail"})
@AllArgsConstructor
@NoArgsConstructor
public class MusicUserLikeEntity {
    private int musicIndex;
    private String userEmail;
    private LocalDateTime createdAt;
}