var protoclass = require("protoclass"),
bindable       = require("bindable"),
Request        = require("./request"),
Routes         = require("./routes"),
Url            = require("url"),
async          = require("async"),
comerr         = require("comerr"),
_              = require("underscore"),
Location       = require("./location");

function Router (options) {

  bindable.Object.call(this, this);

  this.routes   = new Routes(this);
  this.location = new Location();

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

  init: function () {
    this.emit("init");
  },

  /**
   */

  getRequest: function (path, options) {

    if (!options) options = { };

    // parse route ~ /path/to/route?query=value
    var pathParts = Url.parse(path, true);

    // find based on the path
    var route   = this.routes.find(pathParts);

    // return if 404
    if (!route) {
      throw comerr.notFound("path " + path + " not found");
      
    }


    // if the route name matches the pathname, then
    // rebuild the REAL path
    if (route.options.name === pathParts.pathname) {

      // rebuild the path, and parse it
      pathParts = Url.parse(route.getPathnameWithParams(options.params));

      // pass the query and params
      pathParts.query  = options.query;
      pathParts.params = options.params;
    } else {

      // otherwise, fetch the params from the route path
      pathParts.params = route.getParams(pathParts.pathname);
    }

    pathParts.router = this;
    newRequest      = new Request(pathParts);


    newRequest.setProperties({
      route           : route
    });

    return newRequest;
  },

  /**
   */

  redirect: function (path, options, next) {

    if (typeof options === "function") {
      next     = options;
      options  = { };
    }

    if (!next) next = function () { };

    try {
      var newRequest = this.getRequest(path, options),
      prevRequest    = this._location,
      self           = this;
    } catch (e) {
      this.emit("error", e);
      return next(e);
    }


    if (prevRequest) {
      if (prevRequest.equals(newRequest)) {
        prevRequest.query.setProperties(newRequest.options.query);
        return next(null, prevRequest);
      } else {
        newRequest.mergeQuery(prevRequest.query);
      }
    }

    this.set("_location", newRequest);

    // bind the location. This follows any redirects
    this.bind("location", { max: 1, to: function (location) {
      process.nextTick(function () {
        next(null, location);
      });
    }});

    async.waterfall([

      // exit from the previous route. Might have something like a transition
      function exit (next) {
        if (!prevRequest) return next();
        prevRequest.route.exit(newRequest, next);
      },

      // enter the new route
      function enter (next) {
        newRequest.route.enter(newRequest, next);
      },

      // set the location if there are no errors
      function () {
        self.set("location", newRequest);
      }
    ]);
  },

  /**
   */

  add: function (routes) {
    this.routes.add(routes);
    return this;
  }
});


module.exports = Router;
