package com.stopsoo.meltube.controllers;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.entities.PlaylistEntity;
import com.stopsoo.meltube.entities.PlaylistMusicEntity;
import com.stopsoo.meltube.entities.UserEntity;
import com.stopsoo.meltube.results.Result;
import com.stopsoo.meltube.services.PlaylistService;
import com.stopsoo.meltube.vos.PlaylistVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/playlist")
public class PlaylistController {
    private final PlaylistService playlistService;

    @Autowired
    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deletePlaylist(@SessionAttribute(value = "user", required = false) UserEntity user,
                                 @RequestParam(value = "indexes", required = false) Integer[] indexes) {
        Result result = this.playlistService.deletePlaylists(user, indexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public PlaylistVo[] getPlaylist(@SessionAttribute(value = "user", required = false) UserEntity user) {
        return this.playlistService.getPlaylists(user);
    }

    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchPlaylist(@SessionAttribute(value = "user", required = false) UserEntity user,
                                @RequestParam(value = "index", required = false) Integer index,
                                @RequestParam(value = "text", required = false) String text) {
        Result result = this.playlistService.modifyPlaylist(user, index, text);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPlaylist(@SessionAttribute(value = "user", required = false) UserEntity user,
                               @RequestParam(value = "text", required = false) String text) {
        Result result = this.playlistService.addPlaylist(user, text);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/music", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteMusic(@SessionAttribute(value = "user", required = false) UserEntity user,
                              @RequestParam(value = "playlistIndex", required = false) Integer playlistIndex,
                              @RequestParam(value = "musicIndexes", required = false) int[] musicIndexes) {
        Result result = this.playlistService.deleteMusicsFromPlaylist(user, playlistIndex, musicIndexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/music", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity[] getMusic(@SessionAttribute(value = "user", required = false) UserEntity user,
                                  @RequestParam(value = "index", required = false) Integer index) {
        return this.playlistService.getMusics(user, index);
    }

    @RequestMapping(value = "/music", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postMusic(@SessionAttribute(value = "user", required = false) UserEntity user,
                            @RequestParam(value = "playlistIndex", required = false) Integer playlistIndex,
                            @RequestParam(value = "musicIndexes", required = false) int[] musicIndexes) {
        Result result = this.playlistService.addMusicsToPlaylist(user, playlistIndex, musicIndexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }
}