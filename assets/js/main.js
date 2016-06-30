var Auth = Auth || {};

Auth.Facebook = {
  getUserProfile: function(response) {
    FB.api('/me', { fields: 'id, name, email' }, function(profile) {
      this.saveUserProfile(response, profile);
    }.bind(this));
  },

  saveUserProfile: function(response, profile) {
    var data = {
      id: profile.id,
      email: profile.email,
      fullname: profile.name,
      token: response.authResponse.accessToken,
      expired: response.authResponse.expiresIn,
      source: 'facebook'
    };

    $.ajax({
      url: '/social_register',
      method: 'POST',
      dataType: 'json',
      data: data
    }).done(function(response) {
      if (response.status === 'success') {
        window.location.href = '/edit';
      }
    }).fail(function(error) {
      console.log(error);
    });
  },

  register: function() {
    FB.login(function(response) {
      if (response.status === 'connected') {
        this.getUserProfile(response);
      } else if (response.status === 'not_authorized') {
        alert('User not authorized app');
      } else {
        console.log('Error');
      }
    }.bind(this), { scope: 'public_profile, email' });
  },

  loginBySocial: function(id) {
    $.ajax({
      url: '/social_login',
      method: 'POST',
      dataType: 'json',
      data: {
        id: id,
        socialSource: 'facebook'
      }
    }).done(function(response) {
      if (response.status === 'success') {
        return window.location.href = '/welcome';
      }

      alert(response.message);
    }).fail(function(error) {
      console.log(error);
    });
  },

  login: function() {
    FB.login(function(response) {
      if (response.status === 'connected') {
        this.loginBySocial(response.authResponse.userID);
      } else if (response.status === 'not_authorized') {
        alert('User not authorized app');
      } else {
        console.log('Error');
      }
    }.bind(this), { scope: 'public_profile, email' });
  }
};
