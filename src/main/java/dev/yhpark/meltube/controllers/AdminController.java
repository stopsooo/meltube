package com.stopsoo.meltube.controllers;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.results.Result;
import com.stopsoo.meltube.services.AdminService;
import com.stopsoo.meltube.services.MusicService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/admin")
public class AdminController {
    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    //region Music
    @RequestMapping(value = "/music/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity[] getMusicIndex() {
        return this.adminService.getMusics();
    }

    @RequestMapping(value = "/music/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteMusicIndex(@RequestParam(value = "indexes", required = false) int[] indexes) {
        Result result = this.adminService.deleteMusics(indexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/music/status", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchMusicStatus(@RequestParam(value = "status", required = false) Boolean status,
                                   @RequestParam(value = "indexes", required = false) int[] indexes) {
        Result result = this.adminService.modifyMusicStatuses(status, indexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameToLower());
        return response.toString();
    }
    //endregion
}


























