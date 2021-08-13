import Node from 'konva';
import * as Konva from 'konva';

var blacklist = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    yoyo: 1,
  },
  PAUSED = 1,
  PLAYING = 2,
  REVERSING = 3,
  idCounter = 0,
  colorAttrs = ['fill', 'stroke', 'shadowColor'];

/*
export interface TweenConfig extends NodeConfig {
    onFinish?: Function;
    onUpdate?: Function;
    duration?: number;
    node: Node;
}

export declare class Tween {
    
    onFinish: Function;
    onReset: Function;
    onUpdate: Function;
    constructor(config: TweenConfig);
    _addAttr(key: any, end: any): void;
    _tweenFunc(i: any): void;
    _addListeners(): void;
    play(): this;
    reverse(): this;
    reset(): this;
    seek(t: any): this;
    pause(): this;
    finish(): this;
    destroy(): void;
}
*/
class TweenEngine {
  prop: string;
  propFunc: Function;
  begin: number;
  _pos: number;
  duration: number;
  prevPos: number;
  yoyo: boolean;
  _time: number;
  _position: number;
  _startTime: number;
  _finish: number;
  func: Function;
  _change: number;
  state: number;

  constructor(prop, propFunc, func, begin, finish, duration, yoyo) {
    this.prop = prop;
    this.propFunc = propFunc;
    this.begin = begin;
    this._pos = begin;
    this.duration = duration;
    this._change = 0;
    this.prevPos = 0;
    this.yoyo = yoyo;
    this._time = 0;
    this._position = 0;
    this._startTime = 0;
    this._finish = 0;
    this.func = func;
    this._change = finish - this.begin;

    this.state = 0;

    this.pause();
  }
  fire(str) {
    var handler = this[str];
    if (handler) {
      handler();
    }
  }
  setTime(t) {
    if (t > this.duration) {
      if (this.yoyo) {
        this._time = this.duration;
        this.reverse();
      } else {
        this.finish();
      }
    } else if (t < 0) {
      if (this.yoyo) {
        this._time = 0;
        this.play();
      } else {
        this.reset();
      }
    } else {
      this._time = t;
      this.update();
    }
  }
  getTime() {
    return this._time;
  }
  setPosition(p) {
    this.prevPos = this._pos;
    this.propFunc(p);
    this._pos = p;
  }
  getPosition(t) {
    if (t === undefined) {
      t = this._time;
    }
    return this.func(t, this.begin, this._change, this.duration);
  }
  play() {
    this.state = PLAYING;
    this._startTime = this.getTimer() - this._time;
    this.onEnterFrame(0);
    this.fire('onPlay');
  }
  reverse() {
    this.state = REVERSING;
    this._time = this.duration - this._time;
    this._startTime = this.getTimer() - this._time;
    //this.onEnterFrame();
    this.fire('onReverse');
  }
  seek(t) {
    this.pause();
    this._time = t;
    this.update();
    this.fire('onSeek');
  }
  reset() {
    this.pause();
    this._time = 0;
    this.update();
    this.fire('onReset');
  }
  finish() {
    this.pause();
    this._time = this.duration;
    this.update();
    this.fire('onFinish');
  }
  update() {
    this.setPosition(this.getPosition(this._time));
    this.fire('onUpdate');
  }
  onEnterFrame(frame) {
    //var t = this.getTimer() - this._startTime;
    let t = frame ? frame.time : this.getTimer() - this._startTime;
    //console.log(t, frame);

    if (this.state === PLAYING) {
      this.setTime(t);
    } else if (this.state === REVERSING) {
      this.setTime(this.duration - t);
    }
  }
  pause() {
    this.state = PAUSED;
    this.fire('onPause');
  }
  getTimer() {
    return performance.now(); //new Date().getTime();
  }
}
export class Tween {
  static attrs: {};
  static tweens: {};
  node: Node;
  anim: Konva.default.Animation;
  tween: TweenEngine;
  _id: number;

  constructor(config) {
    let that = this,
      node = config.node,
      nodeId = node._id,
      duration,
      easing = config.easing || Easings.Linear,
      yoyo = !!config.yoyo,
      key;
    if (typeof config.duration === 'undefined') {
      duration = 0.3;
    } else if (config.duration === 0) {
      duration = 0.001;
    } else {
      duration = config.duration;
    }
    this.node = node;
    this._id = idCounter++;
    var layers = node.getLayers(); /*node.getLayer() ||
            (node instanceof Konva['Stage'] ? node.getLayers() : null);*/
    if (!layers) {
      Konva.default.Util.error(
        'Tween constructor have `node` that is not in a layer. Please add node into layer first.',
      );
    }
    this.anim = new Konva.default.Animation(function(frame) {
      that.tween.onEnterFrame(frame);
      return false;
    }, layers);
    this.tween = new TweenEngine(
      key,
      function(i) {
        that._tweenFunc(i);
      },
      easing,
      0,
      1,
      duration * 1000,
      yoyo,
    );
    this._addListeners();
    if (!Tween.attrs[nodeId]) {
      Tween.attrs[nodeId] = {};
    }
    if (!Tween.attrs[nodeId][this._id]) {
      Tween.attrs[nodeId][this._id] = {};
    }
    if (!Tween.tweens[nodeId]) {
      Tween.tweens[nodeId] = {};
    }
    for (key in config) {
      if (blacklist[key] === undefined) {
        this._addAttr(key, config[key]);
      }
    }
    this.reset();
    (this as any).onFinish = config.onFinish;
    (this as any).onReset = config.onReset;
    (this as any).onUpdate = config.onUpdate;
  }
  _addAttr(key, end) {
    let node = this.node,
      nodeId = (node as any)._id,
      start,
      diff,
      tweenId,
      n,
      len,
      trueEnd,
      trueStart,
      endRGBA;
    tweenId = Tween.tweens[nodeId][key];
    if (tweenId) {
      delete Tween.attrs[nodeId][tweenId][key];
    }
    start = (node as any).getAttr(key);
    if (Konva.default.Util._isArray(end)) {
      diff = [];
      len = Math.max(end.length, start.length);
      if (key === 'points' && end.length !== start.length) {
        if (end.length > start.length) {
          trueStart = start;
          start = Konva.default.Util._prepareArrayForTween(start, end, (node as any).closed());
        } else {
          trueEnd = end;
          end = Konva.default.Util._prepareArrayForTween(end, start, (node as any).closed());
        }
      }
      if (key.indexOf('fill') === 0) {
        for (n = 0; n < len; n++) {
          if (n % 2 === 0) {
            diff.push(end[n] - start[n]);
          } else {
            var startRGBA = Konva.default.Util.colorToRGBA(start[n]);
            endRGBA = Konva.default.Util.colorToRGBA(end[n]);
            start[n] = startRGBA;
            diff.push({
              r: endRGBA.r - startRGBA.r,
              g: endRGBA.g - startRGBA.g,
              b: endRGBA.b - startRGBA.b,
              a: endRGBA.a - startRGBA.a,
            });
          }
        }
      } else {
        for (n = 0; n < len; n++) {
          diff.push(end[n] - start[n]);
        }
      }
    } else if (colorAttrs.indexOf(key) !== -1) {
      start = Konva.default.Util.colorToRGBA(start);
      endRGBA = Konva.default.Util.colorToRGBA(end);
      diff = {
        r: endRGBA.r - start.r,
        g: endRGBA.g - start.g,
        b: endRGBA.b - start.b,
        a: endRGBA.a - start.a,
      };
    } else {
      diff = end - start;
    }
    Tween.attrs[nodeId][this._id][key] = {
      start: start,
      diff: diff,
      end: end,
      trueEnd: trueEnd,
      trueStart: trueStart,
    };
    Tween.tweens[nodeId][key] = this._id;
  }
  _tweenFunc(i) {
    var node = this.node,
      attrs = Tween.attrs[(node as any)._id][this._id],
      key,
      attr,
      start,
      diff,
      newVal,
      n,
      len,
      end;
    for (key in attrs) {
      attr = attrs[key];
      start = attr.start;
      diff = attr.diff;
      end = attr.end;
      if (Konva.default.Util._isArray(start)) {
        newVal = [];
        len = Math.max(start.length, end.length);
        if (key.indexOf('fill') === 0) {
          for (n = 0; n < len; n++) {
            if (n % 2 === 0) {
              newVal.push((start[n] || 0) + diff[n] * i);
            } else {
              newVal.push(
                'rgba(' +
                  Math.round(start[n].r + diff[n].r * i) +
                  ',' +
                  Math.round(start[n].g + diff[n].g * i) +
                  ',' +
                  Math.round(start[n].b + diff[n].b * i) +
                  ',' +
                  (start[n].a + diff[n].a * i) +
                  ')',
              );
            }
          }
        } else {
          for (n = 0; n < len; n++) {
            newVal.push((start[n] || 0) + diff[n] * i);
          }
        }
      } else if (colorAttrs.indexOf(key) !== -1) {
        newVal =
          'rgba(' +
          Math.round(start.r + diff.r * i) +
          ',' +
          Math.round(start.g + diff.g * i) +
          ',' +
          Math.round(start.b + diff.b * i) +
          ',' +
          (start.a + diff.a * i) +
          ')';
      } else {
        newVal = start + diff * i;
      }
      (node as any).setAttr(key, newVal);
    }
  }
  _addListeners() {
    (this.tween as any).onPlay = () => {
      this.anim.start();
    };
    (this.tween as any).onReverse = () => {
      this.anim.start();
    };
    (this.tween as any).onPause = () => {
      this.anim.stop();
    };
    (this.tween as any).onFinish = () => {
      var node = this.node;
      var attrs = Tween.attrs[(node as any)._id][this._id];
      if (attrs.points && attrs.points.trueEnd) {
        (node as any).setAttr('points', attrs.points.trueEnd);
      }
      if ((this as any).onFinish) {
        (this as any).onFinish.call(this);
      }
    };
    (this.tween as any).onReset = () => {
      var node = this.node;
      var attrs = Tween.attrs[(node as any)._id][this._id];
      if (attrs.points && attrs.points.trueStart) {
        (node as any).points(attrs.points.trueStart);
      }
      if ((this as any).onReset) {
        (this as any).onReset();
      }
    };
    (this.tween as any).onUpdate = () => {
      if ((this as any).onUpdate) {
        (this as any).onUpdate.call(this);
      }
    };
  }
  play() {
    this.tween.play();
    return this;
  }
  reverse() {
    this.tween.reverse();
    return this;
  }
  reset() {
    this.tween.reset();
    return this;
  }
  seek(t) {
    this.tween.seek(t * 1000);
    return this;
  }
  pause() {
    this.tween.pause();
    return this;
  }
  finish() {
    this.tween.finish();
    return this;
  }
  destroy() {
    var nodeId = (this.node as any)._id,
      thisId = this._id,
      attrs = Tween.tweens[nodeId],
      key;
    this.pause();
    for (key in attrs) {
      delete Tween.tweens[nodeId][key];
    }
    delete Tween.attrs[nodeId][thisId];
  }
}
Tween.attrs = {};
Tween.tweens = {};

export const animateTo = function(node, params) {
  var onFinish = params.onFinish;
  params.node = node;
  params.onFinish = function() {
    this.destroy();
    if (onFinish) {
      onFinish();
    }
  };
  var tween = new Tween(params);
  tween.play();
};
export const Easings = {
  BackEaseIn(t, b, c, d) {
    var s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  BackEaseOut(t, b, c, d) {
    var s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  BackEaseInOut(t, b, c, d) {
    var s = 1.70158;
    if ((t /= d / 2) < 1) {
      return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    }
    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  },
  ElasticEaseIn(t, b, c, d, a, p) {
    var s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d) === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
  },
  ElasticEaseOut(t, b, c, d, a, p) {
    var s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d) === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
  },
  ElasticEaseInOut(t, b, c, d, a, p) {
    var s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d / 2) === 2) {
      return b + c;
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    if (t < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
    }
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) * 0.5 + c + b;
  },
  BounceEaseOut(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  },
  BounceEaseIn(t, b, c, d) {
    return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
  },
  BounceEaseInOut(t, b, c, d) {
    if (t < d / 2) {
      return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
    } else {
      return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
  },
  EaseIn(t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  EaseOut(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  EaseInOut(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return (c / 2) * t * t + b;
    }
    return (-c / 2) * (--t * (t - 2) - 1) + b;
  },
  StrongEaseIn(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  StrongEaseOut(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  StrongEaseInOut(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return (c / 2) * t * t * t * t * t + b;
    }
    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
  },
  Linear(t, b, c, d) {
    return (c * t) / d + b;
  },
};
