// This file should work in legacy browsers

var SLOW_REQUIRE = 30;

var oldRequire = meteorInstall.Module.prototype.require;
var trees = [];

var parent = null;
var importedModules = [];
meteorInstall.Module.prototype.require = function (path) {
  var resolvedPath = this.resolve(path);

  if(importedModules.indexOf(resolvedPath) > -1) {
    // The module was already evaluated
    return oldRequire.call(this, path);
  }

  var current = { name: resolvedPath, children: [], start: performance.now(), parent: parent };
  parent = current;

  var result = oldRequire.call(this, path);

  current.end = performance.now();
  parent = current.parent;
  importedModules.push(resolvedPath);

  if (current.parent === null) {
    trees.push(current);
  } else {
    current.parent.children.push(current);
  }

  return result;
}

function requireDuration(item) {
  return Math.floor((item.end - item.start) * 100) / 100;
}

function logTree(tree, minDuration) {
  var text = '';

  function addRequire(item, depth) {
    var diff = requireDuration(item);

    if (diff < minDuration) {
      return;
    }

    for (var i = 0; i < depth; i++) {
      text += ' ';
    }

    text += '- ' + item.name + ' ' + diff + 'ms\n';

    for (var i = 0; i < item.children.length; i++) {
      addRequire(item.children[i], depth + 2);
    }
  }

  addRequire(tree, 0);
  if (text.length > 0) {
    console.log(text);
  }
}

function sumRequires(entries) {
  var result = 0;
  for(let i = 0; i < entries.length; i++) {
    result += requireDuration(entries[i]);
  }

  return result;
}

function checkForSlowRequire (requires, min) {
  for (var i = 0; i < requires.length; i++) {
    if (requireDuration(requires[i]) > min) {
      return true;
    }
  }

  return false;
}

function createSuggestions () {
  var suggestions = [];

  function findSlowRequires (tree, minDiff) {
    var treeTotal = requireDuration(tree);
    if (treeTotal > minDiff) {
      var childrenTotal = sumRequires(tree.children);
      var slowChildThreshold = Math.max(treeTotal * 0.80, minDiff);
      var hasSlowChild = checkForSlowRequire(tree.children, slowChildThreshold);

      if (!hasSlowChild || treeTotal - childrenTotal > minDiff) {
        suggestions.push(tree.name + ' ' + treeTotal + 'ms');
      }

      if (hasSlowChild) {
        for (let i = 0; i < tree.children.length; i++) {
          findSlowRequires(tree.children[i], slowChildThreshold);
        }
      }
    }
  }

  for (var i = 0; i < trees.length; i++) {
    findSlowRequires(trees[i], SLOW_REQUIRE);
  }

  return suggestions
}

Meteor.startup(function () {
  var minDuration = window.__zodernProfileRequireMinDuration;
  if (typeof minDuration === 'undefined') {
    minDuration = 2;
  }

  for (var i = 0; i < trees.length; i++) {
    logTree(trees[i], minDuration);
  }

  var total = sumRequires(trees);
  console.log('Total time spent executing modules:', total);

  var suggestions = createSuggestions();
  if (suggestions.length > 0) {
    console.log('Suggestions:')
    for (var i = 0; i < suggestions.length; i++) {
      console.log(' - ' + suggestions[i]);
    }
    console.log('To improve them, consider:');
    console.log(' - Removing the import or dynamically importing it');
    console.log(' - Use a nested import to delay executing the module until it is needed');
    console.log(' - Taking a CPU profile to check for ways to make the module execute faster');
  }
});
