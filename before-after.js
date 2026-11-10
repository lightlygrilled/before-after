(function ($) {
  "use strict";

  var DEFAULT_SPLIT = 50;
  var STEP_KEYBOARD = 2;
  var MIN = 0;
  var MAX = 100;
  var TOUCH_INTENT_PX = 10;
  var TAP_MOVE_PX = 12;

  function getInitialSplit($box) {
    var raw = $box.attr("data-showcase-initial");
    if (raw === undefined || raw === null || raw === "") {
      return DEFAULT_SPLIT;
    }
    var n = parseFloat(raw);
    if (isNaN(n)) {
      return DEFAULT_SPLIT;
    }
    return clamp(n, MIN, MAX);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundSplit(value) {
    return Math.round(value * 10) / 10;
  }

  function initBox(box) {
    var $box = $(box);
    var $before = $box.find('[data-showcase="before"]');
    var $after = $box.find('[data-showcase="after"]');
    var $slider = $box.find('[data-showcase="slider"]');

    if (!$before.length || !$after.length || !$slider.length) {
      return;
    }

    var split = getInitialSplit($box);
    var dragging = false;
    var touchPointerId = null;
    var touchStartX = 0;
    var touchStartY = 0;
    var touchPending = false;

    function setSplit(next, options) {
      var opts = options || {};
      split = roundSplit(clamp(next, MIN, MAX));
      box.style.setProperty("--showcase-split", String(split));
      $slider.attr("aria-valuenow", String(Math.round(split)));
      if (opts.silent !== true) {
        $box.trigger("showcase:change", [split]);
      }
    }

    $slider.attr({
      role: "slider",
      tabindex: "0",
      "aria-label": $slider.attr("aria-label") || "Compare before and after",
      "aria-valuemin": String(MIN),
      "aria-valuemax": String(MAX),
      "aria-valuenow": String(Math.round(split)),
    });

    setSplit(split, { silent: true });

    function splitFromClientX(clientX) {
      var rect = box.getBoundingClientRect();
      if (!rect.width) {
        return split;
      }
      var ratio = (clientX - rect.left) / rect.width;
      return ratio * 100;
    }

    function onPointerMove(clientX) {
      setSplit(splitFromClientX(clientX));
    }

    function endDrag() {
      dragging = false;
      $box.removeClass("is-showcase-dragging");
      $(document).off(".showcase");
    }

    function endTouchSession() {
      touchPending = false;
      touchPointerId = null;
      $(document).off(".showcaseTouch");
    }

    function beginHorizontalDrag(clientX) {
      dragging = true;
      touchPending = false;
      $box.addClass("is-showcase-dragging");
      onPointerMove(clientX);
    }

    function findActiveTouch(event, pointerId) {
      var touches = event.touches;
      if (touches && touches.length) {
        for (var i = 0; i < touches.length; i++) {
          if (touches[i].identifier === pointerId) {
            return touches[i];
          }
        }
      }
      return null;
    }

    function findEndedTouch(event, pointerId) {
      var changed = event.changedTouches;
      if (!changed) {
        return null;
      }
      for (var i = 0; i < changed.length; i++) {
        if (changed[i].identifier === pointerId) {
          return changed[i];
        }
      }
      return null;
    }

    function startMouseDrag(clientX) {
      beginHorizontalDrag(clientX);

      $(document)
        .on("mousemove.showcase", function (e) {
          if (!dragging) return;
          e.preventDefault();
          onPointerMove(e.clientX);
        })
        .on("mouseup.showcase", function () {
          endDrag();
        });
    }

    function onDocumentTouchMove(e) {
      if (touchPointerId === null) {
        return;
      }

      var touch = findActiveTouch(e.originalEvent, touchPointerId);
      if (!touch) {
        return;
      }

      if (dragging) {
        e.preventDefault();
        onPointerMove(touch.clientX);
        return;
      }

      if (!touchPending) {
        return;
      }

      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      var adx = Math.abs(dx);
      var ady = Math.abs(dy);

      if (adx < TOUCH_INTENT_PX && ady < TOUCH_INTENT_PX) {
        return;
      }

      if (ady > adx) {
        endTouchSession();
        return;
      }

      beginHorizontalDrag(touch.clientX);
      e.preventDefault();
    }

    function onDocumentTouchEnd(e) {
      if (touchPointerId === null) {
        return;
      }
      if (!findEndedTouch(e.originalEvent, touchPointerId)) {
        return;
      }

      var touch = findEndedTouch(e.originalEvent, touchPointerId);

      if (dragging) {
        endDrag();
        endTouchSession();
        return;
      }

      if (touchPending && touch) {
        var dx = touch.clientX - touchStartX;
        var dy = touch.clientY - touchStartY;
        if (Math.abs(dx) <= TAP_MOVE_PX && Math.abs(dy) <= TAP_MOVE_PX) {
          setSplit(splitFromClientX(touch.clientX));
        }
      }

      endTouchSession();
    }

    $box.on("mousedown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      startMouseDrag(e.clientX);
    });

    $box.on("touchstart", function (e) {
      if (touchPointerId !== null || dragging) {
        return;
      }
      var touch = e.originalEvent.touches[0];
      if (!touch) {
        return;
      }
      touchPointerId = touch.identifier;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchPending = true;

      $(document)
        .on("touchmove.showcaseTouch", onDocumentTouchMove)
        .on("touchend.showcaseTouch touchcancel.showcaseTouch", onDocumentTouchEnd);
    });

    $slider.on("keydown", function (e) {
      var key = e.key;
      var delta = 0;
      if (key === "ArrowLeft" || key === "ArrowDown") {
        delta = -STEP_KEYBOARD;
      } else if (key === "ArrowRight" || key === "ArrowUp") {
        delta = STEP_KEYBOARD;
      } else if (key === "Home") {
        setSplit(MIN);
        e.preventDefault();
        return;
      } else if (key === "End") {
        setSplit(MAX);
        e.preventDefault();
        return;
      } else {
        return;
      }
      e.preventDefault();
      setSplit(split + delta);
    });
  }

  function init() {
    $('[data-showcase="box"]').each(function () {
      initBox(this);
    });
  }

  $(init);
})(window.jQuery);
