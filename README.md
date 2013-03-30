ircjsbot-plugins
================

Plugins for [ircjsbot](https://github.com/nlogax/ircjsbot).

## Writing a plugin

Plugins have a basic interface of exports that should come at the end of the plugin file.

* `name` : string that represents the name of the plugin. ex: "Google"
* `help` : string that represents the help text for the plugin.
* `load` : function that runs at the start of the plugin's execution.
* `unload` : function that runs at the end of the plugin's execution.

ex:

```javascript
    exports.name = "My Plugin";
    exports.help = "Here's a basic example of how my plugin works";
    exports.load = load;
    exports.unload = unload;
```
