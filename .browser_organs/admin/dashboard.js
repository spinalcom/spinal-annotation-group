console.log("TEST");
var admin = {

  save_user_local: function (user, password, port) {
    var u = {
      user: user,
      password: password
    };
    // if (parseInt(port) == parseInt(config.port)) {
    // localStorage.setItem('spinal_user_connect', JSON.stringify(u));
    // } else {
    window.localStorage.setItem("spinalhome_cfg", btoa(JSON.stringify(u)));
    // }
  },

  get_user_local: function () {
    var user_str;
    // if (parseInt(window.location.port) == parseInt(config.port)) {
    //   user_str = localStorage.getItem('spinal_user_connect');
    // } else {
    user_str = window.localStorage.getItem("spinalhome_cfg");
    // }
    if (user_str) {
      var user = JSON.parse(atob(user_str));
      config.user = user.user;
      config.password = user.password;
    }
  },

  launch_organ: function () {
    admin.get_user_local();
    if (!config.user || !config.password) {
      window.location = "login.html";
    } else {
      SpinalUserManager.get_admin_id("http://" + config.host + ":" + config.port + "/", config.user, config.password,
        function (response) {
          config.user_id = parseInt(response);
          conn = spinalCore.connect("http://" + config.user_id + ":" + config.password + "@" + config.host + ":" + config.port + "/");
          document.getElementById("span-username").innerHTML = "Dashboard - " + config.user;
          launch_spinal_admin();
        },
        function (err) {
          // SpinalUserManager.get_user_id("http://" + config.host + ":" + config.user_port + "/", config.user, config.password,
          //   function (response) {
          //     config.user_id = parseInt(response);
          //     conn = spinalCore.connect("http://" + config.user_id + ":" + config.password + "@" + config.host + ":" + config.user_port + "/");
          //     document.getElementById("span-username").innerHTML = "Dashboard - " + config.user;
          //     launch_spinal_dasboard();
          //   },
          //   function (err) {
          admin.disconnect();
          //   });
        });
    }
  },

  disconnect: function (error) {
    if (config.user)
      delete config.user;
    if (config.password)
      delete config.password;
    localStorage.removeItem('spinal_user_connect');
    if (error)
      window.location = "login.html#error";
    else {
      window.location = "login.html";
    }
  },

  try_connect: function () {
    var user = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (user == "" || password == "")
      return false;
    SpinalUserManager.get_admin_id("http://" + config.host + ":" + config.port + "/", user, password, function (response) {
      admin.save_user_local(user, password, config.port);
      // if (parseInt(window.location.port) != parseInt(config.port)) {
      // window.location.port = config.port;
      // return;
      // }
      window.location = "index.html";
    }, function (err) {
      // SpinalUserManager.get_user_id("http://" + config.host + ":" + config.user_port + "/", user, password, function (response) {
      //   admin.save_user_local(user, password, config.user_port);
      //   if (parseInt(window.location.port) != parseInt(config.user_port)) {
      //     window.location.port = config.user_port;
      //     return;
      //   }
      //   window.location = window.location.protocol + '/' + '/' + window.location.hostname + ":" + config.user_port + "/html/admin.html";
      // }, function (err) {
      console.log("Error connect");
      admin.error_connect();
      admin.disconnect(true);
      // });
    });

  },
  error_connect: function () {
    $.gritter.add({
      title: 'Incorrect user ID or password',
      text: 'Type the correct user ID and password, and try again.'
    });
  }
};