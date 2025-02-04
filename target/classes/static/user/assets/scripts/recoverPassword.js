const $recoverForm = document.getElementById('recoverForm');

$recoverForm.onsubmit = (e) => {
  e.preventDefault();
  const $passwordLabel = $recoverForm.findLabel('password');
  $passwordLabel.setValid($recoverForm['password'].value.length >= 6 && $recoverForm['password'].value.length <= 50, '올바른 비밀번호를 입력해 주세요.');
  if ($passwordLabel.isValid()) {
    $passwordLabel.setValid($recoverForm['password'].value === $recoverForm['passwordCheck'].value, '비밀번호가 서로 일치하지 않습니다.');
  }
  if (!$passwordLabel.isValid()) {
    return;
  }
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append('userEmail', $recoverForm['userEmail'].value);
  formData.append('key', $recoverForm['key'].value);
  formData.append('password', $recoverForm['password'].value);
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
    const [title, content, onclick] = {
      failure: ['비밀번호 재설정', '비밀번호를 재설정할 수 없습니다. 링크가 올바르지 않거나 링크가 손상되었을 수 있습니다.<br><br>동일한 문제가 반복된다면 비밀번호 재설정 링크를 다시 생성해 주세요.', ($dialog) => Dialog.hide($dialog)],
      failure_expired: ['비밀번호 재설정', '비밀번호를 재설정할 수 없습니다. 해당 링크는 더 이상 유효하지 않습니다. 멜튜브에서 인증 링크를 다시 받을 수 있습니다.'],
      success: ['비밀번호 재설정', '비밀번호를 성공적으로 재설정하였습니다. 확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', () => location.href = '/'],
    }[response['result']] || ['오류', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)];
    Dialog.show({
      title: title,
      content: content,
      buttons: [{
        text: '확인', onclick: onclick
      }]
    });
  };
  xhr.open('PATCH', './recover-password');
  xhr.send(formData);
  Loading.show(0);
};











