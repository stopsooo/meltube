package com.stopsoo.meltube.controllers;

import com.stopsoo.meltube.entities.UserEntity;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/")
public class HomeController {
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getIndex(@SessionAttribute(value = "user", required = false) UserEntity user) {
        ModelAndView modelAndView = new ModelAndView();
        if (user == null) {
            modelAndView.setViewName("home/index.unsigned");
        } else {
            modelAndView.setViewName("home/index.signed");
        }
        return modelAndView;
    }

    @RequestMapping(value = "/logout", method = RequestMethod.GET)
    public String getLogout(HttpSession session) {
        session.setAttribute("user", null);
        return "redirect:/";
    }
}