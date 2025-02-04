package com.stopsoo.meltube;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@SpringBootTest
class MeltubeApplicationTests {

    @Test
    void contextLoads() throws IOException, InterruptedException {
//        String id = "37463572";
//        String url = String.format("https://www.melon.com/song/detail.htm?songId=%s", id);
//        Document document = Jsoup.connect(url).get();
//        Elements $name = document.select(".song_name");
//        if ($name.isEmpty()) {
//            System.out.println("No elements found.");
//            return;
//        }
//        $name.select(".none").remove();
//        Elements $artist = document.select(".artist_name > span:first-child");
//        Elements $list = document.select("dl.list");
//        Elements $album = $list.select("dd:nth-child(2)");
//        Elements $release = $list.select("dd:nth-child(4)");
//        Elements $genre = $list.select("dd:nth-child(6)");
//        Elements $lyrics = document.select(".lyric");
//        Elements $cover = document.select("img[src^=\"https://cdnimg.melon.co.kr/cm2/album/images/\"]");
//        System.out.printf("%s - %s\n", $artist.text(), $name.text());

        String searchQuery = URLEncoder.encode(String.format("%s site:www.youtube.com", "aoiu3rhjf8043fjiod"), StandardCharsets.UTF_8);
        Document googleSearchResult = Jsoup.connect(String.format("https://www.google.com/search?q=%s", searchQuery)).get();
        String youtubeId = null;
        Element $firstH3 = googleSearchResult.selectFirst("h3");
        if ($firstH3 != null) {
            Element $anchor = $firstH3.parent();
            if ($anchor != null) {
                String href = $anchor.attr("href");
                youtubeId = href.split("=")[1];
            }
        }
        System.out.println(youtubeId);
    }

}
