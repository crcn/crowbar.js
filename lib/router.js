var protoclass = require("protoclass"),
bindable       = require("bindable"),
Location       = require("./location"),
Routes         = require("./routes"),
async          = require("async"),
_              = require("underscore");

function Router (options) {

  bindable.Object.call(this, this);

  this.routes = new Routes(this);
  this.location = this._createLocation();
  this.middleware = _.bind(this.middleware, this);
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
    loc.redirect(req.url, function (err, result) {
      if (err) return next(err);
      req.location = loc;
      next();
    });
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
    return this;
  },

  /**
   */

  route: function (route) {
    this.routes.add(route);
    return this;
  },

  /**
   * DEPRECATED
   */

  add: function (route) {
    return this.route(route);
  },

  /**
   */

  _createLocation: function () {
    return new Location(this.routes);
  }
});


module.exports = Router;
