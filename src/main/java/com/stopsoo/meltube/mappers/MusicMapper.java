package com.stopsoo.meltube.mappers;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.vos.MusicVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicMapper {
    int insertMusic(MusicEntity music);

    MusicEntity selectMusicByIndex(@Param("index") int index,
                                   @Param("includeCover") boolean includeCover);

    MusicEntity selectMusicByYoutubeId(@Param("youtubeId") String youtubeId);

    MusicEntity[] selectMusics(@Param("includeCover") boolean includeCover);

    MusicEntity[] selectMusicsByUserEmail(@Param("userEmail") String userEmail);

    MusicVo selectMusicVoByUserEmailAndIndex(@Param("userEmail") String userEmail,
                                             @Param("index") int index);

    MusicVo[] selectMusicVosByUserEmailAndKeyword(@Param("userEmail") String userEmail,
                                                  @Param("keyword") String keyword);

    MusicVo[] selectLikedMusicVosByUserEmail(@Param("userEmail") String userEmail);

    int updateMusic(@Param("music") MusicEntity music,
                    @Param("includeCover") boolean includeCover);
}