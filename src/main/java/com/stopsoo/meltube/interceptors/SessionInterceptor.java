package com.stopsoo.meltube.interceptors;

import com.stopsoo.meltube.entities.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.servlet.HandlerInterceptor;

public class SessionInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("SessionInterceptor.preHandle 실행 됨!");
        HttpSession session = request.getSession();
        Object userObj = session.getAttribute("user");
        if (userObj == null || !(userObj instanceof UserEntity)) {
            response.setStatus(404);
            return false;
        }
        UserEntity user = (UserEntity) userObj;
        if (!user.isAdmin()) {
            response.setStatus(404);
            return false;
        }
        return true;
    }
}