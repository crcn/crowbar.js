var bindable = require("bindable"),
_            = require("underscore"),
qs           = require("querystring"),
outcome      = require("outcome");

function Location (routes, options) {
  bindable.Object.call(this, this);

  if (!options) options = {};

  this.query  = new bindable.Object();
  this.params = new bindable.Object();
  this.routes = routes;

  this.merge(options);

  this._rebuildUrl = _.bind(this._rebuildUrl, this);

  this.query.on("change", this._rebuildUrl);
  this.params.on("change", this._rebuildUrl);
  this.on("change", this._rebuildUrl);
}

bindable.Object.extend(Location, {

  /**
   */

  merge: function (options) {

    this.setProperties({ 
      options  : options,
      pathname : options.pathname,
      route    : options.route
    });

    this.params.context(options.params || {});
    this.mergeQuery(options.query);
    return this;
  },

  /**
   */

  redirect: function (path, options, next) {

    if (!options) options = {};

    if (typeof options === "function") {
      next = options;
      options = {};
    }

    if (!next) next = function () {};


    try {
      var ops     = this.routes.parsePath(path, options);
    } catch (e) {
      this.emit("error", e);
      return next(e);
    }

    var oldPathname = this.pathname,
    self            = this;

    this.merge(ops);

    // same path? don't re-enter
    if (ops.pathname === oldPathname) {
      return process.nextTick(function () {
        next(null, self);
      });
    }


    // new path? re-renter
    this.route.enter(this, outcome.e(next).s(function () {
      process.nextTick(function () {
        next(null, self);
      });
    }));
  },

  /**
   */

  mergeQuery: function (q) {
    for (var property in q) {
      // if (this.query.has(property)) continue;
      this.query.set(property, q[property]);
    }
  },

  /**
   */

  _rebuildUrl: function () {

    var url = this.get("pathname");

    if (this.query.keys().length) {
      url += "?" + qs.stringify(this.query.context());
    }

    this.set("url", url);
  }
});


module.exports = Location;
