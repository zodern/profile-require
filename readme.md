# zodern:profile-require

A simple package to measure how long it takes to import modules on the client. Useful for improving the initial load performance and identifying modules that might be worth using nested imports with.

Compatible with Meteor 1.7 and newer.

After the page loads, it logs in the browser's client:

- A tree showing when each module is first imported, and how long it takes
- The total time spent executing modules
- A list of modules it thinks are worth looking at to improve
- General suggestions on how to improve them

## Use

Run your app with `meteor --extra-packages zodern:profile-require`.

If you want to profile the Meteor packages your app uses, add `zodern:profile-require` to the top of your app's `.meteor/packages` file. Just remember to remove it before deploying. Please note it only works with packages that use modules.

Most modules execute within a millisecond or two. To simplify the output, by default it only shows modules in the tree that took at least 2ms. To configure this, set `window.__zodernProfileRequireMinDuration` to the minimum milliseconds you want to see. To see all imports, set it to `0`.

Execution time can have a large impact on load performance on mobile devices. To simulate it on your computer, Chrome has an option to [throttle the CPU](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference#cpu-throttle).

Some npm modules and Meteor packages are faster in production builds. Running `meteor --production` might give you results closer to what your users see.
