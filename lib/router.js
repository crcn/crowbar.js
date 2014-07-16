var protoclass = require("protoclass"),
bindable       = require("bindable"),
Location       = require("./location"),
Routes         = require("./routes"),
async          = require("async"),
_              = require("underscore");

function Router (options) {

  bindable.Object.call(this, this);

  this.location = this._createLocation();
  var self = this;
  this.location.on("error", function (err) {
    self.emit("error", err);
  })

  this.use(require("./plugins/param"));
}

bindable.Object.extend(Router, {

  /**
   */

  use: function () {
    for (var i = arguments.length; i--;) {
      arguments[i](this);
    }
    return this;
  },

  /**
   */

  middleware: function (req, res, next) {
    var loc = this._createLocation();
    // loc.redirect()
    console.log(req);
  },


  /**
   */

  init: function () {
    this.emit("init");
  },

  /**
   */

  redirect: function (path, options, next) {
    this.location.redirect.apply(this.location, arguments);
  },

  /**
   */

  add: function (routes) {
    this.routes.add(routes);
    return this;
  },

  /**
   */

  _createLocation: function () {
    return new Location(this.routes = new Routes(this));
  }
});


module.exports = Router;
