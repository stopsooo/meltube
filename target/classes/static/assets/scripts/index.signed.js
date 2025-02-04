class Player {
  static ytPlayer;
  /** @type {HTMLElement} */
  static $ytPlayer = document.getElementById('ytPlayer');
  /** @type {HTMLElement} */
  static $element = document.getElementById('player');
  /** @type {HTMLElement} */
  static $albumImage = Player.$element.querySelector(':scope > .album-wrapper > .image');
  /** @type {HTMLElement} */
  static $albumTitle = Player.$element.querySelector(':scope > .album-wrapper > .title');
  /** @type {HTMLElement} */
  static $albumArtist = Player.$element.querySelector(':scope > .album-wrapper > .artist');
  /** @type {HTMLElement} */
  static $controlWrapper = Player.$element.querySelector(':scope > .control-wrapper');
  /** @type {HTMLElement} */
  static $list = Player.$element.querySelector(':scope > .list');

  /** @type {Array<Object>} */
  static _musics = [];
  /** @type {number} */
  static _currentPlayingIndex = -1;
  /** @type {number|undefined} */
  static _updateControlInterval;
  /** @type {boolean} */
  static _loop = true;
  /** @type {boolean} */
  static _shuffle = false;

  static {
    YT.ready(() => Player.ytPlayer = new YT.Player('ytPlayer', {
      width: '100%',
      height: '100%',
      videoId: 'IDblGAmRDQQ',
      events: {
        'onReady': () => {
          Player.updateControl();
          if (typeof Player._updateControlInterval === 'number') {
            clearInterval(Player._updateControlInterval);
          }
          setInterval(() => Player.updateControl(), 1000);
        },
        'onStateChange': (e) => {
          if (e['data'] === 0) {
            Player.playNext();
          }
        },
      },
    }));

    const $bar = Player.$controlWrapper.querySelector(':scope > .bar');
    const $buttonContainer = Player.$controlWrapper.querySelector(':scope > .button-container');
    const $loopButton = $buttonContainer.querySelector('[name="loop"]');
    const $shuffleButton = $buttonContainer.querySelector('[name="shuffle"]');
    const $prevButton = $buttonContainer.querySelector('[name="prev"]');
    const $playButton = $buttonContainer.querySelector('[name="play"]');
    const $pauseButton = $buttonContainer.querySelector('[name="pause"]');
    const $nextButton = $buttonContainer.querySelector('[name="next"]');
    const $muteButton = $buttonContainer.querySelector('[name="mute"]');
    $bar.onclick = (e) => {
      if (Player.ytPlayer.getDuration() === 0) {
        return;
      }
      const rect = $bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      if (typeof percent === 'number' && isFinite(percent) && !isNaN(percent)) {
        Player.ytPlayer.seekTo(Math.floor(Player.ytPlayer.getDuration() * percent), true);
      }
    };
    $loopButton.onclick = () => {
      if ($loopButton.classList.contains('-toggled')) {
        $loopButton.classList.remove('-toggled');
        Player._loop = false;
      } else {
        $loopButton.classList.add('-toggled');
        Player._loop = true;
      }
    };
    $shuffleButton.onclick = () => {
      if ($shuffleButton.classList.contains('-toggled')) {
        $shuffleButton.classList.remove('-toggled');
        Player._shuffle = false;
      } else {
        $shuffleButton.classList.add('-toggled');
        Player._shuffle = true;
      }
    };
    $prevButton.onclick = () => Player.playPrev();
    $playButton.onclick = () => {
      $playButton.style.display = 'none';
      $pauseButton.style.display = 'block';
      Player.ytPlayer.playVideo();
    };
    $pauseButton.onclick = () => {
      $playButton.style.display = 'block';
      $pauseButton.style.display = 'none';
      Player.ytPlayer.pauseVideo();
    };
    $nextButton.onclick = () => Player.playNext();
    $muteButton.onclick = () => {
      if ($muteButton.classList.contains('-toggled')) {
        $muteButton.classList.remove('-toggled');
        Player.ytPlayer.unMute();
      } else {
        $muteButton.classList.add('-toggled');
        Player.ytPlayer.mute();
      }
    };
  }

  /**
   * @param {Object} music
   */
  static addMusic(music) {
    const $item = new DOMParser().parseFromString(`
        <li class="item" data-index="${music['index']}">
            <label class="check-wrapper">
                <input class="input" type="checkbox">
                <span class="box"></span>
            </label>
            <span class="title">${music['name']}</span>
            <span class="artist">${music['artist']}</span>
        </li>`, 'text/html').querySelector('li');
    $item.dataset['raw'] = JSON.stringify(music);
    $item.querySelector(':scope > .title').onclick = () => {
      if (!$item.classList.contains('-playing')) {
        Player.play(Player._musics.indexOf(music));
      }
    };
    Player._musics.push(music);
    Player.$list.append($item);
    if (getComputedStyle(Player.$element).display === 'none') {
      Player.$element.style.display = 'flex';
      Player.$controlWrapper.querySelector('[name="play"]').style.display = 'block';
      Player.$controlWrapper.querySelector('[name="pause"]').style.display = 'none';
      Player.play(0);
    }
  }

  /**
   * @param {Object} music
   */
  static applyAlbum(music) {
    Player.$albumImage.src = `/music/cover?index=${music['index']}`;
    Player.$albumTitle.innerText = music['name'];
    Player.$albumArtist.innerText = music['artist'];
  }

  /**
   * @param {Array<number>} indexes
   */
  static delete(indexes) {
    const $items = Array.from(Player.$list.querySelectorAll(':scope > .item'));
    indexes = indexes.sort((a, b) => b - a);
    for (const index of indexes) {
      Player._musics.splice(index, 1);
      $items[index].remove();
    }
    if (indexes.includes(Player._currentPlayingIndex)) {
      if (Player._musics.length > 0) {
        Player._currentPlayingIndex = Math.max(0, Math.min(...indexes) - 1);
        Player.playNext();
      }
    }
    if (Player._musics.length === 0) {
      Player.$element.style.display = 'none';
      Player.ytPlayer.stopVideo();
    }
  }

  /**
   * @param {number} index
   */
  static play(index) {
    const music = Player._musics[index];
    const $listItems = Array.from(Player.$list.querySelectorAll(':scope > .item'));
    $listItems.forEach(($item) => $item.classList.remove('-playing'));
    $listItems[index].classList.add('-playing');
    Player.applyAlbum(music);
    Player.$controlWrapper.querySelector('[name="play"]').dispatchEvent(new Event('click'));
    Player._currentPlayingIndex = index;
    Player.ytPlayer.loadVideoById(music['youtubeId']);

    const recentPlays = JSON.parse(localStorage.getItem('recent_plays') ?? '[]');
    if (recentPlays.indexOf(music['index']) > -1) {
      recentPlays.splice(recentPlays.indexOf(music['index']), 1);
    }
    recentPlays.unshift(music['index']);
    localStorage.setItem('recent_plays', JSON.stringify(recentPlays));
  }

  /**
   * @param {boolean} forced
   */
  static playNext(forced = false) {
    if (Player._shuffle === true) {
      let nextIndex;
      if (Player._musics.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * Player._musics.length);
        } while (nextIndex === Player._currentPlayingIndex);
      }
      Player._currentPlayingIndex = nextIndex;
    } else {
      Player._currentPlayingIndex++;
      if (Player._currentPlayingIndex >= Player._musics.length) {
        if (Player._loop === true) {
          Player._currentPlayingIndex = 0;
        } else {
          Player._currentPlayingIndex = -1;
        }
      }
    }
    if (Player._currentPlayingIndex <= -1) {
      if (forced === true && Player._musics.length > 0) {
        Player._currentPlayingIndex = 0;
      }
    }
    if (Player._currentPlayingIndex > -1) {
      Player.play(Player._currentPlayingIndex);
    }
  }

  static playPrev() {
    console.log(Player.ytPlayer.getCurrentTime());
    if (Player.ytPlayer.getCurrentTime() < 5) {
      Player._currentPlayingIndex--;
      if (Player._currentPlayingIndex < 0) {
        Player._currentPlayingIndex = Player._musics.length - 1;
      }
      Player.play(Player._currentPlayingIndex);
    } else {
      Player.ytPlayer.seekTo(0, true);
    }
  }

  static updateControl() {
    const $barValue = Player.$controlWrapper.querySelector(':scope > .bar > .value');
    const $currentTime = Player.$controlWrapper.querySelector(':scope > .time > .current');
    const $totalTime = Player.$controlWrapper.querySelector(':scope > .time > .total');
    if (Player.$ytPlayer == null) {
      $barValue.style.width = '0';
      $currentTime.innerText = '00:00';
      $totalTime.innerText = '00:00';
      return;
    }
    const currentSeconds = Player.ytPlayer.getCurrentTime();
    const totalSeconds = Player.ytPlayer.getDuration();
    $barValue.style.width = `${currentSeconds / totalSeconds * 100}%`;
    $currentTime.innerText = Math.floor(currentSeconds / 60).toString().padStart(2, '0') + ':' + Math.floor(currentSeconds % 60).toString().padStart(2, '0');
    $totalTime.innerText = Math.floor(totalSeconds / 60).toString().padStart(2, '0') + ':' + Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  }
}

const $nav = document.getElementById('nav');
const $navItems = Array.from($nav.querySelectorAll(':scope > .menu > .item[rel]'));
const $main = document.getElementById('main');
const $mainContents = Array.from($main.querySelectorAll(':scope > .content[rel]'));
const $player = document.getElementById('player');
const navActionMap = {
  'mymusic.playlist': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.playlist').querySelector(':scope > .split > .playlist > .button-container > [name="refresh"]').click(),
  'mymusic.like': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.like').querySelector(':scope > .button-container > [name="refresh"]').click(),
  'mymusic.register': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register').querySelector(':scope > form').reset(),
  'mymusic.register_history': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history').querySelector(':scope > .button-container > [name="refresh"]').click(),
  'admin.music': () => $mainContents.find((x) => x.getAttribute('rel') === 'admin.music').querySelector(':scope > .button-container > [name="refresh"]').click()
};

$navItems.forEach(($navItem) => {
  $navItem.onclick = () => {
    const rel = $navItem.getAttribute('rel');
    const action = navActionMap[rel];
    const $mainContent = $mainContents.find((x) => x.getAttribute('rel') === rel);
    if (typeof action === 'function') {
      action();
    }
    $navItems.forEach((x) => x.classList.remove('-selected'));
    $navItem.classList.add('-selected');
    $mainContents.forEach((x) => x.hide());
    $mainContent.show();
  };
});

//region 헤더 검색(home.search)
{
  const $header = $main.querySelector(':scope > .header');
  const $searchForm = $header.querySelector(':scope > .search-form');
  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'home.search');
  const $buttonContainer = $content.querySelector(':scope > .button-container');
  const $result = $content.querySelector(':scope > .result');
  const $tbody = $result.querySelector(':scope > tbody');
  $buttonContainer.querySelector(':scope > [name="selectAll"]').onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > [type="checkbox"]').forEach(($checkbox) => $checkbox.checked = true);
  $buttonContainer.querySelector(':scope > [name="unselectAll"]').onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > [type="checkbox"]').forEach(($checkbox) => $checkbox.checked = false);
  $buttonContainer.querySelector(':scope > [name="addToPlaylist"]').onclick = () => {
    const $checkedTrs = Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > [type="checkbox"]')?.checked ?? false);
    if ($checkedTrs.length === 0) {
      Dialog.defaultOk('플레이리스트에 추가', '플레이리스트에 추가할 음악을 한 개 이상 선택해 주세요.');
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      const playlists = JSON.parse(xhr.responseText);
      if (playlists.length === 0) {
        Dialog.defaultOk('플레이리스트에 추가', '사용 가능한 플레이리스트가 없습니다. 플레이리스트를 먼저 추가해 주세요.');
        return;
      }
      Dialog.show({
        title: '플레이리스트에 추가',
        content: `
          <form onsubmit="return false;" style="display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 0.5rem;">
            <span>선택한 음악을 저장할 플레이리스트를 선택해 주세요.</span>
            <label class="--obj-label">
              <span class="_text">플레이리스트</span>
              <select class="_field --obj-field -light" name="playlist">
                ${playlists.map((playlist) => `<option value="${playlist['index']}">${playlist['text']}</option>`)}
              </select>
            </label>
          </form>
      `,
        buttons: [
          {text: '취소', onclick: ($dialog) => Dialog.hide($dialog)},
          {
            text: '추가', onclick: ($dialog) => {
              const $form = $dialog.querySelector(':scope > ._content > form');
              const xhr = new XMLHttpRequest();
              const formData = new FormData();
              formData.append('playlistIndex', $form['playlist'].value);
              $checkedTrs.forEach(($tr) => formData.append('musicIndexes', $tr.dataset['index']));
              xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                  return;
                }
                Loading.hide();
                if (xhr.status < 200 || xhr.status >= 300) {
                  Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                  return;
                }
                const response = JSON.parse(xhr.responseText);
                if (response['result'] === 'success') {
                  Dialog.hide($dialog);
                  Dialog.defaultOk('플레이리스트에 추가', '선택한 곡을 플레이리스트에 성공적으로 추가하였습니다.');
                } else {
                  Dialog.defaultOk('플레이리스트에 추가', '알 수 없는 이유로 플레이리스트에 음악을 추가하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                }
              };
              xhr.open('POST', '/playlist/music');
              xhr.send(formData);
              Loading.show(0);
            }
          }
        ]
      })
    };
    xhr.open('GET', '/playlist/');
    xhr.send();
    Loading.show(0);
  };
  $buttonContainer.querySelector(':scope > [name="addToCurrentPlaylist"]').onclick = () => {
    const $checkedTrs = Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > [type="checkbox"]')?.checked ?? false);
    if ($checkedTrs.length === 0) {
      Dialog.defaultOk('현재 재생목록에 추가', '현재 재생목록에 추가할 음악을 한 개 이상 선택해 주세요.');
      return;
    }
    const musics = $checkedTrs.map(($tr) => JSON.parse($tr.dataset['raw']));
    for (const music of musics) {
      Player.addMusic(music);
    }
  };

  $searchForm.onsubmit = (e) => {
    e.preventDefault();
    if ($searchForm['keyword'].value === '') {
      return;
    }
    const xhr = new XMLHttpRequest();
    const url = new URL(location.href);
    url.pathname = '/music/search';
    url.searchParams.set('keyword', $searchForm['keyword'].value);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      const response = JSON.parse(xhr.responseText);
      $buttonContainer.style.display = 'flex';
      $result.style.display = 'table';
      $tbody.querySelector(':scope > tr.init').style.display = 'none';
      $tbody.querySelectorAll(':scope > tr').forEach(($tr) => {
        if (!$tr.classList.contains('message')) {
          $tr.remove();
        }
      });
      if (response.length === 0) {
        const $emptyTr = $tbody.querySelector(':scope > tr.empty');
        $emptyTr.style.display = 'table-row';
        $emptyTr.querySelector(':scope > td > .message > .keyword').innerText = $searchForm['keyword'].value;
      } else {
        $tbody.querySelector(':scope > tr.empty').style.display = 'none';
        for (const music of response) {
          const $tr = new DOMParser().parseFromString(`
            <table><tbody>
              <tr data-index="${music['index']}">
                <td class="-no-padding">
                    <label class="--obj-check-label -simple">
                        <input class="_input" name="check" type="checkbox">
                        <span class="_box"></span>
                    </label>
                </td>
                <td>
                    <span class="name-wrapper">
                        <img alt="" class="cover" src="/music/cover?index=${music['index']}">
                        <span class="name">${music['name']}</span>
                    </span>
                </td>
                <td>${music['artist']}</td>
                <td>${music['album']}</td>
                <td>
                    <span class="like-wrapper ${music['liked'] === true ? '-liked' : ''}" rel="like">
                        <i class="icon ${music['liked'] === true ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        <span class="count">${music['likeCount']}</span>
                    </span>
                </td>
              </tr>
            </tbody></table>`, 'text/html').querySelector('tr');
          const $like = $tr.querySelector(':scope > td > [rel="like"]');
          $like.onclick = () => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
              if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
              }
              if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
              }
              const response = JSON.parse(xhr.responseText);
              if (response['result'] === 'success') {
                const music = response['music'];
                const $icon = $like.querySelector(':scope > .icon');
                if (music['liked'] === true) {
                  $like.classList.add('-liked');
                  $icon.classList.add('fa-solid');
                  $icon.classList.remove('fa-regular');
                } else if (music['liked'] === false) {
                  $like.classList.remove('-liked');
                  $icon.classList.remove('fa-solid');
                  $icon.classList.add('fa-regular');
                }
                $like.querySelector(':scope > .count').innerText = music['likeCount'].toLocaleString();
              } else {
                const [content, onclick] = {
                  failure: ['알 수 없는 이유로 좋아요 상태를 변경하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                  failure_unsigned: ['세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', () => location.reload()]
                }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
                Dialog.defaultOk(content, onclick);
              }
            };
            xhr.open('PATCH', `/music/like?index=${music['index']}`);
            xhr.send();
          };
          $tr.dataset['raw'] = JSON.stringify(music);
          $tbody.append($tr);
        }
      }
    };
    xhr.open('GET', `/music/search?keyword=${$searchForm['keyword'].value}`);
    xhr.send();
    Loading.show(0);
    $navItems.find((x) => x.getAttribute('rel') === 'home.search').dispatchEvent(new Event('click'));
  };
  $tbody.querySelector(':scope > tr.init > td > .message > .link').onclick = () => $navItems.find((x) => x.getAttribute('rel') === 'mymusic.register').click();
  $tbody.querySelector(':scope > tr.empty > td > .message > .link').onclick = () => $navItems.find((x) => x.getAttribute('rel') === 'mymusic.register').click();
}
//endregion

//region 플레이리스트(mymusic.playlist)
{
  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.playlist');
  const listMusics = (playlistIndex) => {
    const $musicTable = $content.querySelector(':scope > .split > .music > .--obj-table');
    const $musicTbody = $musicTable.querySelector(':scope > tbody');
    const $musicTrs = $musicTbody.querySelectorAll(':scope > tr');
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      $musicTrs.forEach(($musicTr) => {
        if (!$musicTr.classList.contains('message')) {
          $musicTr.remove();
        }
      });
      $musicTbody.querySelector(':scope > .message.init').style.display = 'none';
      const musics = JSON.parse(xhr.responseText);
      if (musics.length === 0) {
        $musicTbody.querySelector(':scope > .message.empty').style.display = 'table-row';
      } else {
        $musicTable.dataset['playlistIndex'] = playlistIndex;
        $musicTbody.querySelector(':scope > .message.empty').style.display = 'none';
        for (const music of musics) {
          const $musicTr = new DOMParser().parseFromString(`
            <table><tbody>
              <tr data-index="${music['index']}">
                <td class="-no-padding">
                  <label class="--obj-check-label -simple">
                    <input class="_input" name="check" type="checkbox">
                    <span class="_box"></span>
                  </label>
                </td>
                <td>
                  <span class="name-wrapper">
                    <img alt="" class="cover" src="/music/cover?index=${music['index']}">
                    <span class="name">${music['name']}</span>
                  </span>
                </td>
                <td>${music['artist']}</td>
                <td>${music['album']}</td>
                <td>${music['genre']}</td>
              </tr>
            </tbody></table>`, 'text/html').querySelector('tr');
          $musicTbody.append($musicTr);
        }
      }
    };
    xhr.open('GET', `/playlist/music?index=${playlistIndex}`);
    xhr.send();
    Loading.show(0);
  };
  {
    const $playlist = $content.querySelector(':scope > .split > .playlist');
    const $selectAllButton = $playlist.querySelector(':scope > .button-container > [name="selectAll"]');
    const $unselectAllButton = $playlist.querySelector(':scope > .button-container > [name="unselectAll"]');
    const $createButton = $playlist.querySelector(':scope > .button-container > [name="create"]');
    const $deleteButton = $playlist.querySelector(':scope > .button-container > [name="delete"]');
    const $refreshButton = $playlist.querySelector(':scope > .button-container > [name="refresh"]');
    const $table = $playlist.querySelector(':scope > .--obj-table');
    const $tbody = $table.querySelector(':scope > tbody');
    $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > ._input').forEach(($input) => $input.checked = true);
    $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > ._input').forEach(($input) => $input.checked = false);
    $createButton.onclick = () => {
      Dialog.show({
        title: '플레이리스트 신규',
        content: `
          <div style="margin-bottom: 0.5rem;">새롭게 생성할 플레이리스트의 이름을 입력해 주세요.</div>
          <form novalidate onsubmit="return false;" style="display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 0.5rem;">
            <label class="--obj-label" data-id="text">
              <span class="_text">이름</span>
              <input required autocomplete="off" class="--obj-field _field" maxlength="50" minlength="1" name="text" spellcheck="false" type="text">
              <span class="_warning">올바른 이름을 입력해 주세요.</span>
            </label>          
          </form>
        `,
        buttons: [
          {text: '취소', onclick: ($dialog) => Dialog.hide($dialog)},
          {
            text: '만들기', onclick: ($dialog) => {
              const $form = $dialog.querySelector(':scope > ._content > form');
              const $textLabel = $form.findLabel('text');
              $textLabel.setValid($form['text'].value.length > 0);
              if (!$textLabel.isValid()) {
                return;
              }
              const xhr = new XMLHttpRequest();
              const formData = new FormData();
              formData.append('text', $form['text'].value);
              xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                  return;
                }
                Loading.hide();
                if (xhr.status < 200 || xhr.status >= 300) {
                  Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                  return;
                }
                const response = JSON.parse(xhr.responseText);
                if (response['result'] === 'success') {
                  Dialog.hide($dialog);
                  $refreshButton.click();
                } else {
                  Dialog.defaultOk('신규 플레이리스트', '알 수 없는 이유로 플레이리스트를 생성하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                }
              };
              xhr.open('POST', '/playlist/');
              xhr.send(formData);
              Loading.show(0);
            }
          }
        ]
      });
    };
    $deleteButton.onclick = () => {
      const $checkedTrs = Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > ._input')?.checked === true);
      if ($checkedTrs.length === 0) {
        Dialog.defaultOk('플레이리스트 삭제', '삭제할 플레이리스트를 한 개 이상 선택해 주세요.');
        return;
      }
      Dialog.defaultYesNo('플레이리스트 삭제', `정말로 선택한 플레이리스트 ${$checkedTrs.length.toLocaleString()}개를 삭제할까요?<br><br>플레이리스트에 등록된 음악은 함께 삭제되며 되돌릴 수 없습니다.`, () => {
        const indexes = $checkedTrs.map(($tr) => $tr.dataset['index']);
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        indexes.forEach((index) => formData.append('indexes', index));
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
          }
          Loading.hide();
          if (xhr.status < 200 || xhr.status >= 300) {
            Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
          }
          const response = JSON.parse(xhr.responseText);
          if (response['result'] === 'success') {
            $refreshButton.click();
          } else {
            Dialog.defaultOk('플레이리스트 삭제', '알 수 없는 이유로 플레이리스트를 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
          }
        };
        xhr.open('DELETE', '/playlist/');
        xhr.send(formData);
        Loading.show(0);
      });
    };
    $refreshButton.onclick = () => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        Loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
          Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
        $tbody.querySelectorAll(':scope > tr').forEach(($tr) => {
          if (!$tr.classList.contains('message')) {
            $tr.remove();
          }
        });
        const playlists = JSON.parse(xhr.responseText);
        if (playlists.length === 0) {
          $tbody.querySelector(':scope > .message.empty').style.display = 'table-row';
        } else {
          $tbody.querySelector(':scope > .message.empty').style.display = 'none';
          for (const playlist of playlists) {
            const $tr = new DOMParser().parseFromString(`
              <table><tbody>
                <tr data-index="${playlist['index']}">
                  <td class="-no-padding">
                    <label class="--obj-check-label -simple">
                      <input class="_input" name="check" type="checkbox">
                      <span class="_box"></span>
                    </label>
                  </td>
                  <td>${playlist['text']}</td>
                  <td>${playlist['musicCount'].toLocaleString()}</td>
                  <td>${playlist['createdAt'].replace('T', ' ')}</td>
                  <td>
                    <span class="button-container">
                      <button class="--obj-button -simple-candy -size-small" name="play" type="button">
                        <i class="_icon fa-solid fa-play"></i>
                        <span class="---tooltip">전체 재생</span>
                      </button>
                      <button class="--obj-button -simple-candy -size-small" name="modify" type="button">
                        <i class="_icon fa-solid fa-pen"></i>
                        <span class="---tooltip">수정</span>
                      </button>
                      <button class="--obj-button -simple-candy -size-small" name="list" type="button">
                        <i class="_icon fa-solid fa-list"></i>
                        <span class="---tooltip">목록 조회</span>
                      </button>
                    </span>
                  </td>
                </tr>
              </tbody></table>
          `, 'text/html').querySelector('tr');
            $tr.dataset['raw'] = JSON.stringify(playlist);
            const $playButton = $tr.querySelector(':scope > td > .button-container > [name="play"]');
            const $modifyButton = $tr.querySelector(':scope > td > .button-container > [name="modify"]');
            const $listButton = $tr.querySelector(':scope > td > .button-container > [name="list"]');
            $playButton.onclick = () => {
              const xhr = new XMLHttpRequest();
              xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                  return;
                }
                Loading.hide();
                if (xhr.status < 200 || xhr.status >= 300) {
                  Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                  return;
                }
                const musics = JSON.parse(xhr.responseText);
                if (musics.length === 0) {
                  Dialog.defaultOk('플레이리스트 전체 재생', `선택한 플레이리스트 <i>${playlist['text']}</i>에 등록된 노래가 없습니다.`);
                } else {
                  musics.forEach((music) => Player.addMusic(music));
                }
              };
              xhr.open('GET', `/playlist/music?index=${playlist['index']}`);
              xhr.send();
              Loading.show(0);
            };
            $modifyButton.onclick = () => {
              Dialog.show({
                title: '플레이리스트 수정',
                content: `
                  <div style="margin-bottom: 0.5rem;">변경할 플레이리스트의 이름을 입력해 주세요.</div>
                  <form novalidate onsubmit="return false;" style="display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 0.5rem;">
                    <input hidden name="index" type="hidden" value="${playlist['index']}">
                    <label class="--obj-label" data-id="text">
                      <span class="_text">기존 이름</span>
                      <input readonly required autocomplete="off" class="--obj-field _field" maxlength="50" minlength="1" spellcheck="false" type="text" value="${playlist['text']}">
                    </label>  
                    <label class="--obj-label" data-id="text">
                      <span class="_text">변경할 이름</span>
                      <input required autocomplete="off" class="--obj-field _field" maxlength="50" minlength="1" name="text" spellcheck="false" type="text">
                      <span class="_warning">올바른 이름을 입력해 주세요.</span>
                    </label>
                  </form>`,
                buttons: [
                  {text: '취소', onclick: ($dialog) => Dialog.hide($dialog)},
                  {
                    text: '수정하기', onclick: ($dialog) => {
                      const $form = $dialog.querySelector(':scope > ._content > form');
                      const $textLabel = $form.findLabel('text');
                      $textLabel.setValid($form['text'].value.length > 0);
                      if (!$textLabel.isValid()) {
                        return;
                      }
                      const xhr = new XMLHttpRequest();
                      const formData = new FormData();
                      formData.append('index', $form['index'].value);
                      formData.append('text', $form['text'].value);
                      xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                          return;
                        }
                        Loading.hide();
                        if (xhr.status < 200 || xhr.status >= 300) {
                          Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                          return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        if (response['result'] === 'success') {
                          Dialog.hide($dialog);
                          $refreshButton.click();
                        } else {
                          Dialog.defaultOk('플레이리스트 수정', '알 수 없는 이유로 플레이리스트를 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                      };
                      xhr.open('PATCH', '/playlist/');
                      xhr.send(formData);
                      Loading.show(0);
                    }
                  }
                ]
              });
            };
            $listButton.onclick = () => listMusics(playlist['index']);
            $tbody.append($tr);
          }
        }
      };
      xhr.open('GET', '/playlist/');
      xhr.send();
      Loading.show(0);
    };
  }
  {
    const $music = $content.querySelector(':scope > .split > .music');
    const $selectAllButton = $music.querySelector(':scope > .button-container > [name="selectAll"]');
    const $unselectAllButton = $music.querySelector(':scope > .button-container > [name="unselectAll"]');
    const $deleteButton = $music.querySelector(':scope > .button-container > [name="delete"]');
    const $table = $music.querySelector(':scope > .--obj-table');
    const $tbody = $table.querySelector(':scope > tbody');
    $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > ._input').forEach(($input) => $input.checked = true);
    $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > .--obj-check-label > ._input').forEach(($input) => $input.checked = false);
    $deleteButton.onclick = () => {
      const $checkedTrs = Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > ._input')?.checked === true);
      if ($checkedTrs.length === 0) {
        Dialog.defaultOk('음악 삭제', '삭제할 음악을 한 개 이상 선택해 주세요.');
        return;
      }
      Dialog.defaultYesNo('음악 삭제', `정말로 선택한 음악 ${$checkedTrs.length.toLocaleString()}개를 삭제할까요?`, () => {
        const indexes = $checkedTrs.map(($tr) => $tr.dataset['index']);
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('playlistIndex', $table.dataset['playlistIndex']);
        indexes.forEach((index) => formData.append('musicIndexes', index));
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
          }
          Loading.hide();
          if (xhr.status < 200 || xhr.status >= 300) {
            Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
          }
          const response = JSON.parse(xhr.responseText);
          if (response['result'] === 'success') {
            listMusics($table.dataset['playlistIndex']);
          } else {
            Dialog.defaultOk('음악 삭제', '알 수 없는 이유로 음악을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
          }
        };
        xhr.open('DELETE', '/playlist/music');
        xhr.send(formData);
        Loading.show(0);
      });
    };
  }
}
//endregion

//region 좋아요(mymusic.like)
{
  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.like');
  const $filterForm = $content.querySelector(':scope > .button-container > .filter-form');
  const $selectAllButton = $content.querySelector(':scope > .button-container > [name="selectAll"]');
  const $unselectAllButton = $content.querySelector(':scope > .button-container > [name="unselectAll"]');
  const $refreshButton = $content.querySelector(':scope > .button-container > [name="refresh"]');
  const $table = $content.querySelector(':scope > table');
  const $tbody = $table.querySelector(':scope > tbody');
  $filterForm.onsubmit = (e) => {
    e.preventDefault();
    if ($filterForm['keyword'].value === '') {
      return;
    }
    const $trs = Array.from($tbody.querySelectorAll(':scope > tr'));
    const $noResult = $tbody.querySelector(':scope > tr._message.no-result');
    const displays = $trs.map(($tr) => !$tr.classList.contains('_message') && $tr.innerText.includes($filterForm['keyword'].value));
    $tbody.querySelector(':scope > tr._message.empty').style.display = 'none';
    if (displays.every((b) => b === false)) {
      $noResult.querySelector(':scope > td > .keyword').innerText = $filterForm['keyword'].value;
      $noResult.style.display = 'table-row';
    } else {
      $noResult.style.display = 'none';
    }
    $trs.forEach(($tr, i) => {
      if (!$tr.classList.contains('_message')) {
        $tr.style.display = displays[i] === true ? 'table-row' : 'none';
      }
    });
  };
  $selectAllButton.onclick = () => Array.from($tbody.querySelectorAll(':scope > tr'))
      .filter(($tr) => getComputedStyle($tr).display === 'table-row')
      .map(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > ._input'))
      .filter(($input) => $input != null)
      .forEach(($input) => $input.checked = true);
  $unselectAllButton.onclick = () => Array.from($tbody.querySelectorAll(':scope > tr'))
      .filter(($tr) => getComputedStyle($tr).display === 'table-row')
      .map(($tr) => $tr.querySelector(':scope > td > .--obj-check-label > ._input'))
      .filter(($input) => $input != null)
      .forEach(($input) => $input.checked = false);
  $refreshButton.onclick = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      $filterForm['keyword'].value = '';
      $tbody.querySelector(':scope > tr._message.no-result').style.display = 'none';
      $tbody.querySelectorAll(':scope > tr').forEach(($tr) => {
        if (!$tr.classList.contains('_message')) {
          $tr.remove();
        }
      });
      const musics = JSON.parse(xhr.responseText);
      if (musics.length === 0) {
        $tbody.querySelector(':scope > tr._message.empty').style.display = 'table-row';
      } else {
        $tbody.querySelector(':scope > tr._message.empty').style.display = 'none';
        for (const music of musics) {
          const $tr = new DOMParser().parseFromString(`
            <table><tbody>
              <tr data-index="${music['index']}">
                <td class="-no-padding">
                    <label class="--obj-check-label -simple">
                        <input class="_input" name="check" type="checkbox">
                        <span class="_box"></span>
                    </label>
                </td>
                <td>${music['index']}</td>
                <td>
                    <span class="name-wrapper">
                        <img alt="" class="cover" src="/music/cover?index=${music['index']}">
                        <span class="name">${music['name']}</span>
                    </span>
                </td>
                <td>${music['artist']}</td>
                <td>${music['album']}</td>
                <td>${music['releaseDate']}</td>
                <td>${music['genre']}</td>
                <td>
                    <span class="like-wrapper ${music['liked'] === true ? '-liked' : ''}" rel="like">
                        <i class="icon ${music['liked'] === true ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        <span class="count">${music['likeCount']}</span>
                    </span>
                </td>
              </tr>
            </tbody></table>`, 'text/html').querySelector('tr');
          const $like = $tr.querySelector(':scope > td > .like-wrapper');
          $like.onclick = () => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
              if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
              }
              if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
              }
              const response = JSON.parse(xhr.responseText);
              if (response['result'] === 'success') {
                $tr.remove();
                if (Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => !$tr.classList.contains('_message')).length === 0) {
                  $tbody.querySelector(':scope > tr._message.empty').style.display = 'table-row';
                }
              } else {
                const [title, content, onclick] = {
                  failure: ['알 수 없는 이유로 좋아요 상태를 변경하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                  failure_unsigned: ['세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', () => location.reload()]
                }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
                Dialog.defaultOk(title, content, onclick);
              }
            };
            xhr.open('PATCH', `/music/like?index=${music['index']}`);
            xhr.send();
          };
          $tbody.append($tr);
        }
      }
    };
    xhr.open('GET', '/music/liked');
    xhr.send();
    Loading.show(0);
  };
}
//endregion

//region 음원 등록 신청(mymusic.register)
{
  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register');
  const $form = $content.querySelector(':scope > form');
  const $melonResultInit = $form.querySelector(':scope > .melon > .row > .result > .init');
  const $melonResultLoading = $form.querySelector(':scope > .melon > .row > .result > .loading');
  const $melonResultEmpty = $form.querySelector(':scope > .melon > .row > .result > .empty');
  const $melonResultError = $form.querySelector(':scope > .melon > .row > .result > .error');
  let melonSearchTimeout;
  let melonSearchLastKeyword;
  $form['melonKeyword'].addEventListener('keyup', () => {
    $form.querySelectorAll(':scope > .melon > .row > .result > .item').forEach((x) => x.remove()); // 기존 검색 결과 삭제
    $melonResultEmpty.style.display = 'none';
    $melonResultError.style.display = 'none';
    if ($form['melonKeyword'].value === '') {
      $melonResultInit.style.display = 'flex';
      $melonResultLoading.style.display = 'none';
    } else {
      $melonResultInit.style.display = 'none';
      $melonResultLoading.style.display = 'flex';
      if (typeof melonSearchTimeout === 'number') {
        clearTimeout(melonSearchTimeout);
      }
      melonSearchLastKeyword = $form['melonKeyword'].value;
      melonSearchTimeout = setTimeout(() => {
        if (melonSearchLastKeyword !== $form['melonKeyword'].value) {
          return;
        }
        const xhr = new XMLHttpRequest();
        const url = new URL(location.href);
        url.pathname = '/music/search-melon';
        url.searchParams.set('keyword', $form['melonKeyword'].value);
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
          }
          $melonResultLoading.style.display = 'none';
          if (xhr.status < 200 || xhr.status >= 300 || xhr.responseText.length === 0) {
            $melonResultError.style.display = 'flex';
            return;
          }
          const response = JSON.parse(xhr.responseText);
          if (response.length === 0) {
            $melonResultEmpty.style.display = 'flex';
          } else {
            const $result = $form.querySelector(':scope > .melon > .row > .result');
            for (const music of response) {
              const $item = document.createElement('span');
              $item.classList.add('item');
              const $image = document.createElement('img');
              $image.classList.add('image');
              $image.src = music['coverFileName'];
              const $column = document.createElement('span');
              $column.classList.add('column');
              const $name = document.createElement('span');
              $name.classList.add('name');
              $name.innerText = music['name'];
              const $artist = document.createElement('span');
              $artist.classList.add('artist');
              $artist.innerText = music['artist'];
              $column.append($name, $artist);
              $item.append($image, $column);
              $item.onmousedown = () => {
                $form['melonId'].value = music['youtubeId'];
                $form['melonCrawlButton'].click();
              };
              $result.append($item);
            }
          }
        };
        xhr.open('GET', url.toString());
        xhr.send();
      }, 1000);
    }
  });

  $form['melonCrawlButton'].onclick = () => {
    const $melonLabel = $form.findLabel('melon');
    $melonLabel.setValid($form['melonId'].value.length > 0);
    if (!$melonLabel.isValid()) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.show({
          title: '오류',
          content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
        return;
      }
      if (xhr.responseText.length === 0) {
        Dialog.show({
          title: '멜론 음원 검색',
          content: `입력하신 멜론 음원 식별자 <b>${$form['melonId'].value}</b>를 통해 음원을 검색할 수 없습니다.<br><br>멜론 음원 식별자를 다시 확인해 주세요.`,
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
        return;
      }
      const response = JSON.parse(xhr.responseText);
      const $coverPreviewText = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .text');
      const $coverPreviewImage = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image');
      $coverPreviewText.style.display = 'none';
      $coverPreviewImage.src = response['coverFileName'];
      $coverPreviewImage.style.display = 'block';
      if (response['youtubeId'] != null) {
        $form['youtubeId'].value = response['youtubeId'];
        $form['youtubeIdCheckButton'].click();
      } else {
        const $text = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .text');
        const $iframe = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe');
        $text.style.display = 'flex';
        $iframe.style.display = 'none';
        $form['youtubeId'].value = '';
      }
      $form['artist'].value = response['artist'];
      $form['album'].value = response['album'];
      $form['releaseDate'].value = response['releaseDate'];
      $form['genre'].value = response['genre'];
      $form['name'].value = response['name'];
      $form['lyrics'].value = response['lyrics'];
    };
    xhr.open('GET', `/music/crawl-melon?id=${$form['melonId'].value}`);
    xhr.send();
    Loading.show(0);
  };

  $form['_cover'].onchange = () => {
    const $text = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .text');
    const $image = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image');
    if (($form['_cover'].files?.length ?? 0) === 0) { // $form['_cover'].files == null || $form['_cover'].files.length === 0
      $text.style.display = 'flex';
      $image.style.display = 'none';
      $image.src = '';
      return;
    }
    $text.style.display = 'none';
    $image.style.display = 'block';
    $image.src = URL.createObjectURL($form['_cover'].files[0]);
  };

  $form['youtubeIdCheckButton'].onclick = () => {
    const youtubeId = $form['youtubeId'].value;
    if (youtubeId.length !== 11) {
      Dialog.show({
        title: '유튜브 식별자 확인',
        content: '올바른 유튜브 식별자를 입력해 주세요.',
        buttons: [{
          text: '확인', onclick: ($dialog) => {
            Dialog.hide($dialog);
            $form['youtubeId'].focus();
            $form['youtubeId'].select();
          }
        }]
      });
      return;
    }
    const $text = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .text');
    const $iframe = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe');
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.show({
          title: '오류',
          content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{
            text: '확인',
            onclick: ($dialog) => Dialog.hide($dialog)
          }]
        });
        return;
      }
      const response = JSON.parse(xhr.responseText);
      if (response['result'] === true) {
        $iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
        $iframe.style.display = 'block';
        $text.style.display = 'none';
      } else {
        Dialog.show({
          title: '유튜브 식별자 확인',
          content: `입력하신 식별자 <b>${youtubeId}</b>로 조회할 수 있는 영상이 확인되지 않습니다.<br><br>식별자를 다시 확인해 주세요.`,
          buttons: [{
            text: '확인', onclick: ($dialog) => {
              Dialog.hide($dialog);
              $form['youtubeId'].focus();
              $form['youtubeId'].select();
            }
          }]
        });
      }
    };
    xhr.open('GET', `/music/verify-youtube-id?id=${youtubeId}`);
    xhr.send();
    Loading.show(0);
    $iframe.style.display = 'none';
    $text.style.display = 'flex';
  };

  $form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const $previewImage = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image');
    if ($previewImage.getAttribute('src').startsWith('http://') || $previewImage.getAttribute('src').startsWith('https://')) {
      formData.append('coverFileName', $previewImage.getAttribute('src'));
    } else if ($previewImage.getAttribute('src').startsWith('blob:')) {
      formData.append('_cover', $form['_cover'].files[0]);
    } else {
      Dialog.show({
        title: '음원 등록 신청',
        content: '커버 이미지를 선택해 주세요.',
        buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
      });
      return;
    }
    const $youtubeIframe = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe');
    if ($form['youtubeId'].value.length !== 11 || $form['youtubeId'].value !== $youtubeIframe.getAttribute('src').split('/').at(-1)) {
      Dialog.show({
        title: '음원 등록 신청',
        content: '유튜브 식별자를 검증해 주세요.',
        buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
      });
      return;
    }
    formData.append('youtubeId', $form['youtubeId'].value);
    const $artistLabel = $form.findLabel('artist');
    const $albumLabel = $form.findLabel('album');
    const $releaseDateLabel = $form.findLabel('releaseDate');
    const $genreLabel = $form.findLabel('genre');
    const $nameLabel = $form.findLabel('name');
    $artistLabel.setValid($form['artist'].value.length >= 1 && $form['artist'].value.length <= 50);
    $albumLabel.setValid($form['album'].value.length >= 1 && $form['album'].value.length <= 50);
    $releaseDateLabel.setValid($form['releaseDate'].value !== '');
    $genreLabel.setValid($form['genre'].value.length >= 1 && $form['genre'].value.length <= 50);
    $nameLabel.setValid($form['name'].value.length >= 1 && $form['name'].value.length <= 50);
    if (!$artistLabel.isValid() || !$albumLabel.isValid() || !$releaseDateLabel.isValid() || !$genreLabel.isValid() || !$nameLabel.isValid()) {
      return;
    }
    formData.append('artist', $form['artist'].value);
    formData.append('album', $form['album'].value);
    formData.append('releaseDate', $form['releaseDate'].value);
    formData.append('genre', $form['genre'].value);
    formData.append('name', $form['name'].value);
    formData.append('lyrics', $form['lyrics'].value);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.show({
          title: '오류',
          content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
        return;
      }
      const response = JSON.parse(xhr.responseText);
      const [title, content, onclick] = {
        failure: ['음원 등록 신청', '알 수 없는 이유로 음원 등록 신청에 실패하였습니다. 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)],
        failure_duplicate_youtube_id: ['음원 등록 신청', `입력하신 유튜브 식별자 <b>${$form['youtubeId'].value}</b>는 이미 등록되어 있습니다.<br><br>다시 한 번 확인해 주세요.`, ($dialog) => Dialog.hide($dialog)],
        failure_unsigned: ['음원 등록 신청', '세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', ($dialog) => {
          Dialog.hide($dialog);
          location.reload();
        }],
        success: ['음원 등록 신청', '음원 등록 신청이 완료되었습니다.<br><br>심사 완료 후 신청한 음원이 공개 상태로 전환됩니다.<br><br>확인 버튼을 클릭하면 음원 등록 신청 내역 페이지로 이동합니다.', ($dialog) => {
          Dialog.hide($dialog);
          $navItems.find((x) => x.getAttribute('rel') === 'mymusic.register_history').click();
        }],
      }[response['result']] || ['오류', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)];
      Dialog.show({
        title: title,
        content: content,
        buttons: [{text: '확인', onclick: onclick}]
      });
    };
    xhr.open('POST', '/music/');
    xhr.send(formData);
    Loading.show(0);
  };
}
//endregion

//region 음원 등록 신청 내역(mymusic.register_history)
{
  /**
   * @param {Array<number>} indexArray
   */
  const withdraw = (indexArray) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    for (const index of indexArray) {
      formData.append('indexes', index.toString()); // [3, 2, 1]
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.show({
          title: '오류',
          content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
        return;
      }
      const response = JSON.parse(xhr.responseText);
      const [title, content, onclick] = {
        failure: ['음원 등록 신청 취소', '알 수 없는 이유로 음원 등록 신청 취소에 실패하였습니다. 잠시 후 다시 시도해 주세요.'],
        failure_unsigned: ['음원 등록 신청 취소', '세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', ($dialog) => {
          Dialog.hide($dialog);
          location.reload();
        }],
        success: ['음원 등록 신청 취소', '음원 등록 신청이 성공적으로 취소되었습니다.', ($dialog) => {
          Dialog.hide($dialog);
          $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history').querySelector(':scope > .button-container > [name="refresh"]').click();
        }]
      }[response['result']] || ['오류', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)];
      Dialog.show({
        title: title,
        content: content,
        buttons: [{text: '확인', onclick: onclick}]
      });
    };
    xhr.open('DELETE', '/music/');
    xhr.send(formData);
    Loading.show(0);
  };

  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history');
  const $selectAllButton = $content.querySelector(':scope > .button-container > [name="selectAll"]');
  const $unselectAllButton = $content.querySelector(':scope > .button-container > [name="unselectAll"]');
  const $withdrawButton = $content.querySelector(':scope > .button-container > [name="withdraw"]');
  const $refreshButton = $content.querySelector(':scope > .button-container > [name="refresh"]');
  const $table = $content.querySelector(':scope > table');
  const $tbody = $table.querySelector(':scope > tbody');

  $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = true);
  $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = false);
  $withdrawButton.onclick = () => {
    const $trs = $tbody.querySelectorAll(':scope > tr');
    const indexArray = [];
    let invalidTrIncluded = false;
    for (const $tr of $trs) {
      if ($tr.querySelector(':scope > td > label > input[name="check"]')?.checked ?? false) {
        indexArray.push($tr.dataset['index']);
        if ($tr.dataset['status'] !== 'PENDING') {
          invalidTrIncluded = true;
          break;
        }
      }
    }
    if (invalidTrIncluded === true) {
      Dialog.show({
        title: '선택 신청 취소',
        content: '상태가 <i>승인 대기 중</i>이 아닌 항목을 신청 취소할 수 없습니다.',
        buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
      });
      return;
    }
    if (indexArray.length === 0) {
      Dialog.show({
        title: '선택 신청 취소',
        content: '음원 등록 신청을 취소할 항목을 한 개 이상 체크해 주세요.',
        buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
      });
      return;
    }
    Dialog.show({
      title: '선택 신청 취소',
      content: `정말로 선택한 <b>${indexArray.length.toLocaleString()}</b>개의 음원 등록 신청을 취소할까요?<br><br>취소한 내역은 복구할 수 없습니다.`,
      buttons: [
        {text: '취소', onclick: ($dialog) => Dialog.hide($dialog)},
        {
          text: '계속',
          onclick: ($dialog) => {
            Dialog.hide($dialog);
            withdraw(indexArray);
          }
        }
      ]
    });
  };

  $refreshButton.onclick = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      Loading.hide();
      if (xhr.status < 200 || xhr.status >= 300) {
        Dialog.show({
          title: '오류',
          content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
        return;
      }
      const response = JSON.parse(xhr.responseText);
      if (response['result'] === 'failure') {
        Dialog.show({
          title: '음원 등록 신청 내역',
          content: '알 수 없는 이유로 음원 등록 신청 내역을 조회하지 못하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
      } else if (response['result'] === 'failure_unsigned') {
        Dialog.show({
          title: '음원 등록 신청 내역',
          content: '세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.',
          buttons: [{
            text: '확인', onclick: ($dialog) => {
              Dialog.hide($dialog);
              location.reload();
            }
          }]
        });
      } else if (response['result'] === 'success') {
        $tbody.innerHTML = '';
        for (const music of response['musics']) {
          const $tr = new DOMParser().parseFromString(`
            <table>
              <tbody>
                <tr data-index="${music['index']}" data-status="${music['status']}">
                  <td class="-no-padding">
                    ${music['status'] === 'PENDING' ? `
                    <label class="--obj-check-label -simple">
                        <input class="_input" name="check" type="checkbox">
                        <span class="_box"></span>
                    </label>
                    ` : ''}
                  </td>
                  <td class="-text-align-center">${music['index']}</td>
                  <td><img alt="" class="cover" src="/music/cover?index=${music['index']}"></td>
                  <td>${music['artist']}</td>
                  <td>${music['album']}</td>
                  <td class="-text-align-center">${music['releaseDate'].map((x, i) => i === 0 ? x : x.toString().padStart(2, '0')).join('-')}</td>
                  <td>${music['genre']}</td>
                  <td>${music['name']}</td>
                  <td>${music['youtubeId']}</td>
                  <td>${{ALLOWED: '승인', DENIED: '거절', PENDING: '승인 대기중'}[music['status']]}</td>
                  <td>
                    ${music['status'] === 'PENDING' ? `
                    <button class="--obj-button -simple-candy" name="withdraw" type="button">신청 취소</button>
                    ` : ''}
                  </td>
                </tr>              
              </tbody>
            </table>
          `, 'text/html').querySelector('tr');
          const $withdrawButton = $tr.querySelector(':scope > td > button[name="withdraw"]');
          if ($withdrawButton) {
            $withdrawButton.onclick = () => {
              if (music['status'] !== 'PENDING') {
                Dialog.show({
                  title: '선택 신청 취소',
                  content: '상태가 <i>승인 대기 중</i>이 아닌 항목을 신청 취소할 수 없습니다.',
                  buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
                });
                return;
              }
              Dialog.show({
                title: '선택 신청 취소',
                content: '정말로 해당 음원 등록 신청을 취소할까요?<br><br>취소한 내역은 복구할 수 없습니다.',
                buttons: [
                  {text: '취소', onclick: ($dialog) => Dialog.hide($dialog)},
                  {
                    text: '계속',
                    onclick: ($dialog) => {
                      Dialog.hide($dialog);
                      withdraw([music['index']]);
                    }
                  }
                ]
              });
            };
          }
          $tbody.append($tr);
        }
      } else {
        Dialog.show({
          title: '오류',
          content: '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.',
          buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
        });
      }
    };
    xhr.open('GET', '/music/inquiries');
    xhr.send();
    Loading.show(0);
  };
}
//endregion

//region 관리자 음원 관리(admin.music)
{
  const $content = $mainContents.find((x) => x.getAttribute('rel') === 'admin.music');
  if ($content) { /* $content != null */ /* $content !== null && $content !== undefined */
    const $selectAllButton = $content.querySelector(':scope > .button-container > [name="selectAll"]');
    const $unselectAllButton = $content.querySelector(':scope > .button-container > [name="unselectAll"]');
    const $filterForm = $content.querySelector(':scope > .button-container > .filter-form');
    const $allowButton = $content.querySelector(':scope > .button-container > [name="allow"]');
    const $denyButton = $content.querySelector(':scope > .button-container > [name="deny"]');
    const $deleteButton = $content.querySelector(':scope > .button-container > [name="delete"]');
    const $refreshButton = $content.querySelector(':scope > .button-container > [name="refresh"]');
    const $table = $content.querySelector(':scope > table');
    const $tbody = $table.querySelector(':scope > tbody');

    const getCheckedTrs = () => Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > label > input[name="check"]').checked);

    /**
     * @param {Array<number>} indexes
     * @param {boolean} status
     */
    const sendPatchStatusRequest = (indexes, status) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('status', status.toString());
      indexes.forEach((index) => formData.append('indexes', index.toString()));
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        Loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
          Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
        const response = JSON.parse(xhr.responseText);
        const title = status === true ? '음원 선택 승인' : '음원 선택 거절';
        const [content, onclick] = {
          failure: ['알 수 없는 이유로 음원 상태를 변경하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
          failure_unsigned: ['세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', () => location.reload()],
          success: ['음원 상태를 성공적으로 변경하였습니다.', () => $content.querySelector(':scope > .button-container > [name="refresh"]').click()],
        }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        Dialog.defaultOk(title, content, onclick);
      };
      xhr.open('PATCH', '/admin/music/status');
      xhr.send(formData);
      Loading.show(0);
    };

    /**
     * @param {Array<number>} indexes
     */
    const sendDeleteRequest = (indexes) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      indexes.forEach((index) => formData.append('indexes', index.toString()));
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        Loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
          Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
        const response = JSON.parse(xhr.responseText);
        const title = '음원 삭제';
        const [content, onclick] = {
          failure: ['알 수 없는 이유로 음원을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
          success: ['음원을 성공적으로 삭제하였습니다.', () => $content.querySelector(':scope > .button-container > [name="refresh"]').click()]
        }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        Dialog.defaultOk(title, content, onclick);
      };
      xhr.open('DELETE', '/admin/music/');
      xhr.send(formData);
      Loading.show(0);
    };

    $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = true);
    $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = false);

    $filterForm.onsubmit = (e) => {
      e.preventDefault();
      const $trs = Array.from($tbody.querySelectorAll(':scope > tr'));
      for (const $tr of $trs) {
        let visible = true;
        if ($filterForm['status'].value === 'allowed') {
          visible = $tr.dataset['status'] === 'ALLOWED' && $tr.dataset['deleted'] === 'false';
        } else if ($filterForm['status'].value === 'denied') {
          visible = $tr.dataset['status'] === 'DENIED' && $tr.dataset['deleted'] === 'false';
        } else if ($filterForm['status'].value === 'pending') {
          visible = $tr.dataset['status'] === 'PENDING' && $tr.dataset['deleted'] === 'false';
        } else if ($filterForm['status'].value === 'deleted') {
          visible = $tr.dataset['deleted'] === 'true';
        }
        if (visible === true) {
          const keyword = $filterForm['keyword'].value;
          const $tds = Array.from($tr.querySelectorAll(':scope > td'));
          visible =
              $tds[1].innerText.includes(keyword) ||
              $tds[2].innerText.includes(keyword) ||
              $tds[4].innerText.includes(keyword) ||
              $tds[5].innerText.includes(keyword) ||
              $tds[6].innerText.includes(keyword) ||
              $tds[7].innerText.includes(keyword) ||
              $tds[8].innerText.includes(keyword) ||
              $tds[9].innerText.includes(keyword);
        }
        $tr.style.display = visible === true ? 'table-row' : 'none';
      }
    };

    $filterForm['release'].onclick = () => {
      $filterForm.reset();
      $tbody.querySelectorAll(':scope > tr').forEach(($tr) => $tr.style.display = 'table-row');
    };

    $allowButton.onclick = () => {
      const $trs = getCheckedTrs();
      if ($trs.length === 0) {
        Dialog.defaultOk('선택 승인', '승인할 항목을 한 개 이상 선택해 주세요.');
        return;
      }
      if ($trs.some(($tr) => $tr.dataset['deleted'] === 'true' || $tr.dataset['status'] !== 'PENDING')) {
        Dialog.defaultOk('선택 승인', '이미 삭제되었거나 승인 대기 중이 아닌 항목이 선택되어 있습니다.<br><br>다시 한 번 확인해 주세요.');
        return;
      }
      Dialog.defaultYesNo('선택 승인', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 승인할까요?`, () => {
        const indexes = $trs.map(($tr) => parseInt($tr.dataset['index']));
        sendPatchStatusRequest(indexes, true);
      });
    };

    $denyButton.onclick = () => {
      const $trs = getCheckedTrs();
      if ($trs.length === 0) {
        Dialog.defaultOk('선택 거절', '거절할 항목을 한 개 이상 선택해 주세요.');
        return;
      }
      if ($trs.some(($tr) => $tr.dataset['deleted'] === 'true' || $tr.dataset['status'] !== 'PENDING')) {
        Dialog.defaultOk('선택 거절', '이미 삭제되었거나 승인 대기 중이 아닌 항목이 선택되어 있습니다.<br><br>다시 한 번 확인해 주세요.');
        return;
      }
      Dialog.defaultYesNo('선택 거절', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 거절할까요?`, () => {
        const indexes = $trs.map(($tr) => parseInt($tr.dataset['index']));
        sendPatchStatusRequest(indexes, false);
      });
    };

    $deleteButton.onclick = () => {
      const $trs = getCheckedTrs();
      if ($trs.length === 0) {
        Dialog.defaultOk('선택 삭제', '삭제할 항목을 한 개 이상 선택해 주세요.');
        return;
      }
      if ($trs.some(($tr) => $tr.dataset['deleted'] === 'true')) {
        Dialog.defaultOk('선택 삭제', '이미 삭제된 항목이 선택되어 있습니다.<br><br>다시 한 번 확인해 주세요.');
        return;
      }
      Dialog.defaultYesNo('선택 삭제', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 삭제할까요?`, () => {
        const indexes = $trs.map(($tr) => parseInt($tr.dataset['index']));
        sendDeleteRequest(indexes);
      });
    };

    $refreshButton.onclick = () => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        Loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
          Dialog.show({
            title: '오류',
            content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.',
            buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
          });
          return;
        }
        const response = JSON.parse(xhr.responseText);
        $filterForm['release'].click();
        $tbody.innerHTML = '';
        for (const music of response) {
          const $tr = new DOMParser().parseFromString(`
            <table><tbody>
                <tr data-index="${music['index']}" data-deleted="${music['deleted']}" data-status="${music['status']}">
                    <td class="-no-padding">
                        <label class="--obj-check-label -simple">
                            <input class="_input" name="check" type="checkbox">
                            <span class="_box"></span>
                        </label>
                    </td>
                    <td class="-text-align-center">${music['index']}</td>
                    <td>
                        <a class="user-email-anchor" href="#">${music['userEmail']}</a>                    
                    </td>
                    <td>
                        <a class="cover-anchor" href="/music/cover?index=${music['index']}" target="_blank">
                            <img alt="" class="cover" src="/music/cover?index=${music['index']}">                        
                        </a>
                    </td>
                    <td>
                        <a class="artist-anchor" href="#">${music['artist']}</a>                    
                    </td>
                    <td>
                        <a class="album-anchor" href="#">${music['album']}</a>
                    </td>
                    <td class="-text-align-center">${music['releaseDate']}</td>
                    <td>
                        <a class="genre-anchor" href="#">${music['genre']}</a>
                    </td>
                    <td>${music['name']}</td>
                    <td>
                        <a class="youtube-anchor" href="https://www.youtube.com/watch?v=${music['youtubeId']}" target="_blank"><i class="fa-solid fa-link"></i></a>
                        <code class="youtube-id">${music['youtubeId']}</code>
                    </td>
                    <td class="-status-${music['status'].toLowerCase()} ${music['deleted'] === true ? '-deleted' : ''}">
                        <i class="status-icon fa-solid ${music['deleted'] === true ? 'fa-trash' : {ALLOWED: 'fa-check', DENIED: 'fa-x', PENDING: 'fa-hourglass'}[music['status']]}"></i>
                        <span class="status-text">${music['deleted'] === true ? '삭제' : {ALLOWED: '승인', DENIED: '거절', PENDING: '승인 대기중'}[music['status']]}</span>
                    </td>
                    <td>
                        <button class="--obj-button -color-dim-gray -size-small" name="detail" type="button">자세히</button>
                        ${music['deleted'] === false && music['status'] === 'PENDING' ? `
                        <button class="--obj-button -color-primary -size-small" name="allow" type="button">승인</button>
                        <button class="--obj-button -color-red -size-small" name="deny" type="button">거절</button>` : ''}
                        ${music['deleted'] === false ? `
                        <button class="--obj-button -color-red -size-small" name="delete" type="button">삭제</button>` : ''}
                    </td>
                </tr>
            </tbody></table>
          `, 'text/html').querySelector('tr');
          $tr.querySelector(':scope > td > button[name="allow"]')?.addEventListener('click', () => {
            Dialog.defaultYesNo('승인', `정말로 선택한 음원을 승인할까요?`, () => sendPatchStatusRequest([music['index']], true));
          });
          $tr.querySelector(':scope > td > button[name="deny"]')?.addEventListener('click', () => {
            Dialog.defaultYesNo('거절', `정말로 선택한 음원을 거절할까요?`, () => sendPatchStatusRequest([music['index']], false));
          });
          $tr.querySelector(':scope > td > button[name="delete"]')?.addEventListener('click', () => {
            Dialog.defaultYesNo('삭제', `정말로 선택한 음원을 삭제할까요?`, () => sendDeleteRequest([music['index']]));
          });
          ['.user-email-anchor', '.artist-anchor', '.album-anchor', '.genre-anchor'].forEach((c) => {
            $tr.querySelector(`:scope > td > ${c}`)?.addEventListener('click', (e) => {
              e.preventDefault();
              $filterForm['status'].value = 'all';
              $filterForm['keyword'].value = e.target.innerText;
              $filterForm.dispatchEvent(new Event('submit'));
            });
          });
          $tbody.append($tr);
        }
      };
      xhr.open('GET', '/admin/music/');
      xhr.send();
      Loading.show(0);
    };
  }
}
//endregion

//region 플레이어
{
  const $selectAllButton = $player.querySelector(':scope > .list-button-container > [name="selectAll"]');
  const $unselectAllButton = $player.querySelector(':scope > .list-button-container > [name="unselectAll"]');
  const $saveButton = $player.querySelector(':scope > .list-button-container > [name="save"]');
  const $deleteButton = $player.querySelector(':scope > .list-button-container > [name="delete"]');
  const $list = $player.querySelector(':scope > .list');
  const getItems = () => Array.from($list.querySelectorAll(':scope > .item'));
  const getCheckedItems = () => getItems().filter(($item) => $item.querySelector(':scope > .check-wrapper > .input').checked === true);
  $selectAllButton.onclick = () => getItems().forEach(($item) => $item.querySelector(':scope > .check-wrapper > .input').checked = true);
  $unselectAllButton.onclick = () => getItems().forEach(($item) => $item.querySelector(':scope > .check-wrapper > .input').checked = false);
  $saveButton.onclick = () => {
    const $items = getCheckedItems();
    if ($items.length === 0) {
      Dialog.defaultOk('플레이리스트에 저장', '플레이리스트에 저장할 곡을 한 개 이상 선택해 주세요.');
      return;
    }
  };
  $deleteButton.onclick = () => {
    const $items = getItems();
    const indexes = [];
    for (let i = 0; i < $items.length; i++) {
      const $item = $items[i];
      if ($item.querySelector(':scope > .check-wrapper > .input').checked === true) {
        indexes.push(i);
      }
    }
    if (indexes.length === 0) {
      Dialog.defaultOk('삭제', '삭제할 곡을 한 개 이상 선택해 주세요.');
      return;
    }
    Player.delete(indexes);
  };
}
//endregion


















