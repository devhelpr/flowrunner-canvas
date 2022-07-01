export const pointOnRect = (x, y, minX, minY, maxX, maxY, validate) => {
    if (validate && minX < x && x < maxX && minY < y && y < maxY) {
        return undefined;
    }
    var midX = (minX + maxX) / 2;
    var midY = (minY + maxY) / 2;
    var m = (midY - y) / (midX - x);
    if (x <= midX) {
        var minXy = m * (minX - x) + y;
        if (minY <= minXy && minXy <= maxY)
            return { x: minX, y: minXy };
    }
    if (x >= midX) {
        var maxXy = m * (maxX - x) + y;
        if (minY <= maxXy && maxXy <= maxY)
            return { x: maxX, y: maxXy };
    }
    if (y <= midY) {
        var minYx = (minY - y) / m + x;
        if (minX <= minYx && minYx <= maxX)
            return { x: minYx, y: minY };
    }
    if (y >= midY) {
        var maxYx = (maxY - y) / m + x;
        if (minX <= maxYx && maxYx <= maxX)
            return { x: maxYx, y: maxY };
    }
    if (x === midX && y === midY)
        return { x: x, y: y };
    return undefined;
};
//# sourceMappingURL=intersect.js.map