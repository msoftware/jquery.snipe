(function() {
  var $, Bounds, Snipe, defaults, forcedCss;

  $ = jQuery;

  defaults = {
    "class": 'snipe-lens',
    size: 200,
    animation: null,
    image: null,
    cursor: 'none',
    bounds: [],
    css: {
      borderRadius: 200,
      width: 200,
      height: 200,
      border: '2px solid white',
      backgroundColor: 'white',
      boxShadow: '0 0 10px #777, 0 0 8px black inset, 0 0 80px white inset'
    },
    zoomin: function(lens) {},
    zoomout: function(lens) {},
    zoommoved: function(lend) {}
  };

  forcedCss = {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundRepeat: 'no-repeat'
  };

  Bounds = (function() {

    function Bounds(top, right, bottom, left) {
      this.top = top;
      this.right = right;
      this.bottom = bottom;
      this.left = left;
      return this;
    }

    Bounds.prototype.contains = function(x, y) {
      return (this.left < x && x < this.right) && (this.top < y && y < this.bottom);
    };

    return Bounds;

  })();

  Snipe = (function() {

    function Snipe(el, settings) {
      var _this = this;
      this.el = el;
      if (settings == null) {
        settings = {};
      }
      this.body = $('body');
      this.settings = this.makeSettings(settings);
      this.el.one('load', function() {
        _this.offset = _this.el.position();
        return _this.bounds = _this.makeBounds();
      }).each(function() {
        if (this.complete) {
          return $(this).load();
        }
      });
      this.lens = $('<div>').addClass(this.settings["class"]).css('display', 'none').appendTo('body');
      this.ratioX = 1;
      this.ratioY = 1;
      this.ratioEl = $('<img>').load(function() {
        return _this.calculateRatio(_this);
      }).attr('src', this.settings.image).css('display', 'none').appendTo(this.el.parent());
      this.el.bind('mousemove', function(e) {
        return _this.onMouseMove(e);
      });
      return this.el;
    }

    Snipe.prototype.makeSettings = function(settings) {
      var img;
      if (this.el.is('a')) {
        img = this.el.find('img:first');
        defaults.image = settings.image || this.el.attr('href');
      } else {
        img = this.el.is('img') ? this.el : this.el.find('img:first');
        defaults.image = settings.image || this.el.data('zoom') || this.el.attr('src');
      }
      this.el = img;
      defaults.css.backgroundImage = "url(" + defaults.image + ")";
      defaults.css.cursor = settings.cursor || defaults.cursor;
      defaults.css = $.extend({}, defaults.css, settings && settings.css, forcedCss);
      return $.extend({}, defaults, settings);
    };

    Snipe.prototype.makeBounds = function() {
      return new Bounds(this.offset.top, this.offset.left + this.el.width(), this.offset.top + this.el.height(), this.offset.left);
    };

    Snipe.prototype.run = function() {
      return this.hide();
    };

    Snipe.prototype.calculateRatio = function(o) {
      o.ratioX = o.ratioEl.width() / o.el.width();
      o.ratioY = o.ratioEl.height() / o.el.height();
      o.ratioEl.remove();
      o.lens.css(o.settings.css);
      o.run();
      return o;
    };

    Snipe.prototype.onMouseMove = function(e) {
      var backgroundX, backgroundY;
      if (!(this.bounds != null) && this.lens.not(':animated')) {
        return;
      } else {
        if (!this.bounds.contains(e.pageX, e.pageY)) {
          this.hide();
        }
      }
      backgroundX = -((e.pageX - this.offset.left) * this.ratioX - this.settings.size * .5);
      backgroundY = -((e.pageY - this.offset.top) * this.ratioY - this.settings.size * .5);
      return this.lens.css({
        left: e.pageX - this.settings.size * .5,
        top: e.pageY - this.settings.size * .5,
        backgroundPosition: backgroundX + 'px ' + backgroundY + 'px'
      });
    };

    /* 
    	API Methods
    */


    Snipe.prototype.show = function(animation) {
      var _this = this;
      if (animation == null) {
        animation = true;
      }
      this.el.unbind('mousemove');
      this.el.unbind('mouseover');
      this.body.bind('mousemove', function(e) {
        return _this.onMouseMove(e);
      });
      this.lens.show().css({
        opacity: 1,
        cursor: this.settings.css.cursor
      });
      return this;
    };

    Snipe.prototype.hide = function(animation) {
      var _this = this;
      if (animation == null) {
        animation = true;
      }
      this.el.bind('mouseover', function(e) {
        return _this.show();
      });
      this.body.unbind('mousemove');
      this.lens.css({
        opacity: 0,
        cursor: 'default'
      }).hide();
      return this;
    };

    return Snipe;

  })();

  (function($) {
    return $.fn.snipe = function(settings) {
      return new Snipe(this, settings);
    };
  })(jQuery);

}).call(this);
