package com.stopsoo.meltube.mappers;

import com.stopsoo.meltube.entities.MusicUserLikeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicUserLikeMapper {
    int deleteMusicUserLike(@Param("musicIndex") int musicIndex,
                            @Param("userEmail") String userEmail);

    int insertMusicUserLike(MusicUserLikeEntity musicUserLike);
}
