  $(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    var $window = $(window);
    var $usernameInput = $('#username');
    var $messages = $('.messages');
    var $message = $('#message');
    var $users = $('#users');

    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $messageArea = $('#messageArea');
    var username;
    var connected = false;
    var typing = false;


    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    var socket = io();


    const setUsername = () => {
      username = cleanInput($usernameInput.val().trim());

      if (username) {
        $userFormArea.hide();
        $messageArea.show();
        $userFormArea.off('click');
        $currentInput = $message.focus();
        socket.emit('add user', username);
      }
    }

    const sendMessage = () => {
      var message = $message.val();
      message = cleanInput(message);
      if (message && connected) {
        $message.val('');
        addChatMessage({
          username: username,
          message: message
        });
        socket.emit('new message', message);
      }
    }

    const log = (message, options) => {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }

    const addChatMessage = (data, options) => {
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }

      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<div class="msg_cotainermessage">')
        .text(data.message);

      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>').data('username', data.username).addClass(typingClass).append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);
    }


    const addMessageElement = (el, options) => {
      var $el = $(el);

      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }

      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    const cleanInput = (input) => {
      return $('<div/>').text(input).html();
    }

    const getTypingMessages = (data) => {
      return $('.typing.message').filter(function(i) {
        return $(this).data('username') === data.username;
      });
    }

    const getUsernameColor = (username) => {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }

    $window.keydown(event => {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });

    $message.on('input', () => {
      updateTyping();
    });

    socket.on('login', (data) => {
      connected = true;
      var html = '';
      for (var i = 0; i < data.length; i++) {
        // html += '<li class="list-group-item">' + data[i] + '</li>';
        html += '<li><div class="d-flex bd-highlight"><div class="user_info"><span>' + data[i] + '</span></div></div></li>';
      }
      $users.html(html);
    });

    socket.on('new message', (data) => {
      addChatMessage(data);
    });


  }); <
