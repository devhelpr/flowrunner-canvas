import * as Konva from 'konva';
export const animateTo = function (node, params) {
    var onFinish = params.onFinish;
    params.node = node;
    params.onFinish = function () {
        this.destroy();
        if (onFinish) {
            onFinish();
        }
    };
    const tween = new Konva.default.Tween(params);
    tween.play();
    return tween;
};
//# sourceMappingURL=Tween.js.map