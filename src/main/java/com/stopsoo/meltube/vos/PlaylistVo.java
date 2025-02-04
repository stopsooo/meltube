package com.stopsoo.meltube.vos;

import com.stopsoo.meltube.entities.PlaylistEntity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaylistVo extends PlaylistEntity {
    private int musicCount;
}