```javascript
var crowbar = require("crowbar"),
router  = crowbar.router();


router.on({
  
  //setup the main application on enter
  "/": {
    enter: function(route) {
      route.target = new BackboneView();
      route.target.render();
    },
    route: {
      "/students/:student": {
        enter: function(route) {
          route.target = new StudentsView({ el: route.target.$("#content") })
          route.target.render();
        },
        exit: function(route) {
          
          //target is still the backbone view
          route.target.$("#content").html();
        }
      }
    }
  }
});

//reflect the browser url in the router
router.reflect(new crowbard.reflectors.HttpReflector());
```
