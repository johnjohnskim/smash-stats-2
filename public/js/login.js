$(document).ready(function() {
  var errorMsg = '';
  var $error = $('#error');

  function login() {
    $.post('/login', {username: $("input[name='username']").val(), password: $("input[name='password']").val()}, function(d) {
      if (d == 'ok') {
        window.location.replace('/');
      } else {
        errorMsg = d;
        $error.text(d);
      }
    });
  }
  $("#submit").click(login);
  $('input').keypress(function(e) {
    if (e.keyCode == 13) {
      login();
    } else if (errorMsg) {
      errorMsg = '';
      $error.text('');
    }
  });
});
