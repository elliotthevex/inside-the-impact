/* Story Mode — manifest.js
   The ordered list of Story Mode scripts (ARCHITECTURE.md §1), relative to the repo root.
   The lobby loader (game.js, window.__openStory) and the headless runner (story/dev/headless.js)
   both read this list, so the browser and the tests load exactly the same files in the same order.
   This file is a plain classic script: it runs before core.js, so it must not touch window.STORY. */
(function (root) {
  'use strict';

  const CHAPTERS = [];
  for (let n = 0; n <= 10; n++) CHAPTERS.push('story/chapters/c' + (n < 10 ? '0' : '') + n + '.js');

  // Load order matters: each file extends window.STORY created by core.js; main.js comes last.
  root.STORY_FILES = [
    'story/core.js',
    'story/art.js',
    'story/pieces.js',
    'story/world.js',
    'story/combat.js',
    'story/activities.js',
    'story/director.js',
    'story/ui.js',
    'story/chapters/cast.js',
    'story/chapters/places.js',
  ].concat(CHAPTERS, [
    'story/chapters/c99_sandbox.js',
    'story/main.js',
  ]);

  // Content files may be missing from a build (chapters are written separately). A loader should
  // skip these when they fail to load instead of failing Story Mode; the title then lists only the
  // chapters that registered. Engine files are required.
  root.STORY_OPTIONAL = ['story/chapters/cast.js', 'story/chapters/places.js'].concat(CHAPTERS, ['story/chapters/c99_sandbox.js']);

  root.STORY_CSS = 'story/story.css';
})(typeof window !== 'undefined' ? window : this);
