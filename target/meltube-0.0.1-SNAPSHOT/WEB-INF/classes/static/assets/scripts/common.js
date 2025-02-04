HTMLElement.prototype.hide = function () {
  this.classList.remove('-visible');
  return this;
}

HTMLElement.prototype.show = function () {
  this.classList.add('-visible');
  return this;
}

/**
 * @param {string} dataId
 * @returns {HTMLLabelElement}
 */
HTMLFormElement.prototype.findLabel = function (dataId) {
  return this.querySelector(`label.--obj-label[data-id="${dataId}"]`);
}

/**
 * @param {boolean} b
 * @param {string|undefined} warningText
 * @returns {HTMLLabelElement}
 */
HTMLLabelElement.prototype.setValid = function (b, warningText = undefined) {
  if (b === true) {
    this.classList.remove('-invalid');
  } else if (b === false) {
    this.classList.add('-invalid');
    if (typeof warningText === 'string') {
      this.querySelector(':scope > ._warning').innerText = warningText;
    }
  }
  return this;
}

/**
 * @returns {boolean}
 */
HTMLLabelElement.prototype.isValid = function () {
  return !this.classList.contains('-invalid');
}

class Dialog {
  /** @type {HTMLElement} */
  static $cover;
  /** @type {Array<HTMLElement>} */
  static $dialogArray = [];
  /** @type {number} */

  /**
   * @param {string} content
   * @param {function(HTMLElement)|undefined} onclick
   */
  static defaultOk(content, onclick = undefined) {
    Dialog.show({
      content: content,
      buttons: [{
        text: '확인', onclick: ($dialog) => {
          Dialog.hide($dialog);
          if (typeof onclick === 'function') {
            onclick($dialog);
          }
        }
      }]
    });
  }

  /**
   * @param {string} content
   * @param {function(HTMLElement)|undefined} onYes
   * @param {function(HTMLElement)|undefined} onNo
   */
  static defaultYesNo(content, onYes = undefined, onNo = undefined) {
    Dialog.show({
      content: content,
      buttons: [
        {
          text: '네', onclick: ($dialog) => {
            Dialog.hide($dialog);
            if (typeof onYes === 'function') {
              onYes($dialog);
            }
          }
        },
        {
          text: '아니요', onclick: ($dialog) => {
            Dialog.hide($dialog);
            if (typeof onNo === 'function') {
              onNo($dialog);
            }
          },
        }
      ],
    });
  }

  /**
   * @param {HTMLElement} $dialog
   */
  static hide($dialog) {
    Dialog.$dialogArray.splice(Dialog.$dialogArray.indexOf($dialog), 1);
    if (Dialog.$dialogArray.length === 0) {
      Dialog.$cover.hide();
    }
    $dialog.hide();
    setTimeout(() => $dialog.remove(), 1000);
  }

  /**
   * @param {Object} args
   * @param {string} args.content
   * @param {Array<{text: string, onclick: function}>|undefined} args.buttons
   * @param {number} delay
   * @returns {HTMLElement}
   */
  static show(args, delay = 50) {
    const $dialog = document.createElement('div');
    $dialog.classList.add('---dialog');
    const $content = document.createElement('div');
    $content.classList.add('_content');
    $content.innerHTML = args.content;
    $dialog.append($content);
    if (args.buttons != null && args.buttons.length > 0) {
      const $buttonContainer = document.createElement('div');
      $buttonContainer.classList.add('_button-container');
      for (const button of args.buttons) {
        const $button = document.createElement('button');
        $button.classList.add('_button');
        $button.setAttribute('type', 'button');
        $button.innerText = button.text;
        if (typeof button.onclick === 'function') {
          $button.onclick = () => button.onclick($dialog);
        }
        $buttonContainer.append($button);
      }
      $dialog.append($buttonContainer);
    }
    document.body.append($dialog);
    Dialog.$dialogArray.push($dialog);
    if (Dialog.$cover == null) {
      const $cover = document.createElement('div');
      $cover.classList.add('---dialog-cover');
      document.body.prepend($cover);
      Dialog.$cover = $cover;
    }
    setTimeout(() => {
      $dialog.show();
      Dialog.$cover.show();
    }, delay);
    return $dialog;
  }
}

class Loading {
  /** @type {HTMLElement} */
  static $element;

  static hide() {
    Loading.$element?.hide();
  }

  /**
   * @param {number} delay
   */
  static show(delay = 50) {
    if (Loading.$element == null) {
      const $element = document.createElement('div');
      $element.classList.add('---loading');
      const $icon = document.createElement('img');
      $icon.classList.add('_icon');
      $icon.setAttribute('alt', '');
      $icon.setAttribute('src', 'data:image/png;base64,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');
      const $text = document.createElement('span');
      $text.classList.add('_text');
      $text.innerText = '잠시만 기다려 주세요.';
      $element.append($icon, $text);
      document.body.prepend($element);
      Loading.$element = $element;
    }
    setTimeout(() => Loading.$element.show(), delay);
  }
}




















