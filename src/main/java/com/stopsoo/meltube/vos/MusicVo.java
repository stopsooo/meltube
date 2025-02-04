package com.stopsoo.meltube.vos;

import com.stopsoo.meltube.entities.MusicEntity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MusicVo extends MusicEntity {
    private int likeCount;
    private boolean isLiked;
}