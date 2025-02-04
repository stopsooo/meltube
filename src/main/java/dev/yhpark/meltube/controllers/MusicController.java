package com.stopsoo.meltube.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.entities.UserEntity;
import com.stopsoo.meltube.results.CommonResult;
import com.stopsoo.meltube.results.Result;
import com.stopsoo.meltube.services.MusicService;
import com.stopsoo.meltube.vos.MusicVo;
import com.stopsoo.meltube.vos.ResultVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping(value = "/music")
public class MusicController {
    private final MusicService musicService;

    @Autowired
    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "user", required = false) UserEntity user,
                              @RequestParam(value = "indexes", required = false) int[] indexes) {
        Result result = this.musicService.withdrawInquiries(user, indexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute(value = "user", required = false) UserEntity user,
                            @RequestParam(value = "_cover", required = false) MultipartFile _cover,
                            MusicEntity music) throws IOException, InterruptedException {
        Result result = this.musicService.addMusic(user, music, _cover);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/cover", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<byte[]> getCover(@RequestParam(value = "index", required = false) Integer index) {
        MusicEntity music = this.musicService.getMusicByIndex(index, true);
        if (music == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(music.getCoverContentType()))
                .contentLength(music.getCoverData().length)
                .body(music.getCoverData());
    }

    @RequestMapping(value = "/crawl-melon", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity getCrawlMelon(@RequestParam(value = "id", required = false) String id) throws IOException {
        return this.musicService.crawlMelon(id);
    }

    @RequestMapping(value = "/inquiries", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getInquiries(@SessionAttribute(value = "user", required = false) UserEntity user) throws JsonProcessingException {
        ResultVo<Result, MusicEntity[]> result = this.musicService.getMusicInquiriesByUser(user);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.getResult().nameToLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            JSONArray musics = new JSONArray();
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            for (MusicEntity music : result.getPayload()) {
                String musicString = objectMapper.writeValueAsString(music);
                JSONObject musicObject = new JSONObject(musicString);
                musics.put(musicObject);
            }
            response.put("musics", musics);
        }
        return response.toString();
    }

    @RequestMapping(value = "/like", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchLike(@SessionAttribute(value = "user", required = false) UserEntity user,
                            @RequestParam(value = "index", required = false) Integer index) throws JsonProcessingException {
        ResultVo<Result, MusicVo> result = this.musicService.toggleLike(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put(Result.NAME, result.getResult().nameToLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            responseObject.put("music", new JSONObject(objectMapper.writeValueAsString(result.getPayload())));
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "/liked", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicVo[] getSearch(@SessionAttribute(value = "user", required = false) UserEntity user) {
        return this.musicService.getLikedMusics(user);
    }

    @RequestMapping(value = "/search", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicVo[] getSearch(@SessionAttribute(value = "user", required = false) UserEntity user,
                               @RequestParam(value = "keyword", required = false) String keyword) {
        return this.musicService.searchMusic(user, keyword);
    }

    @RequestMapping(value = "/search-melon", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity[] getSearchMelon(@RequestParam(value = "keyword", required = false) String keyword) throws IOException, InterruptedException {
        return this.musicService.searchMelon(keyword);
    }

    @RequestMapping(value = "/verify-youtube-id", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getVerifyYoutubeId(@RequestParam(value = "id", required = false) String id) throws IOException, InterruptedException {
        boolean result = this.musicService.verifyYoutubeId(id);
        JSONObject response = new JSONObject();
        response.put("result", result);
        return response.toString();
    }
}











