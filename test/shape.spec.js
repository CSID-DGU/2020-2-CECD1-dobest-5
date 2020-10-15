/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/line.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Shape from '../src/js/component/shape';
import {resize} from '../src/js/helper/shapeResizeHelper';
import {getFillImageFromShape, getCachedCanvasImageElement} from '../src/js/helper/shapeFilterFillHelper';

describe('Shape', () => {
    let canvas, graphics, mockImage, fEvent, shape, shapeObj;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();

        shape = new Shape(graphics);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        graphics.setCanvasImage('mockImage', mockImage);

        fEvent = {
            e: {}
        };
    });

    afterEach(() => {
        canvas.forEachObject(obj => {
            canvas.remove(obj);
        });
    });

    it('The origin direction and position value initially adjusted at resize must be calculated correctly.', () => {
        const pointer = canvas.getPointer(fEvent.e);
        const settings = {
            strokeWidth: 0,
            type: 'rect',
            left: 150,
            top: 200,
            width: 40,
            height: 40,
            originX: 'center',
            originY: 'center'
        };

        shape.add('rect', settings);
        [shapeObj] = canvas.getObjects();

        spyOn(shapeObj, 'set').and.callThrough();

        resize(shapeObj, pointer);

        const [{left: resultLeft, top: resultTop}] = shapeObj.set.calls.first().args;

        expect(resultLeft).toBe(settings.left - (settings.width / 2));
        expect(resultTop).toBe(settings.top - (settings.height / 2));
    });

    it('The rectagle object is created on canvas.', () => {
        shape.add('rect');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.type).toBe('rect');
    });

    it('The circle object(ellipse) is created on canvas.', () => {
        shape.add('circle');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.type).toBe('circle');
    });

    it('The triangle object is created on canvas.', () => {
        shape.add('triangle');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.type).toBe('triangle');
    });

    it('When add() is called with no options, the default options set the rectangle object.', () => {
        shape.add('rect');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.width).toBe(1); // strokeWidth: 1, width: 1
        expect(shapeObj.height).toBe(1); // strokeWidth: 1, height: 1
    });

    it('When add() is called with no options, the default options set the circle object.', () => {
        shape.add('circle');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.width).toBe(0);
        expect(shapeObj.height).toBe(0);
    });

    it('When add() is called with no options, the default options set the triangle object.', () => {
        shape.add('triangle');

        [shapeObj] = canvas.getObjects();

        expect(shapeObj.width).toBe(1); // strokeWidth: 1, width: 1
        expect(shapeObj.height).toBe(1); // strokeWidth: 1, height: 1
    });

    it('When add() is called with the options, this options set the rectagle object.', () => {
        const settings = {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 10,
            type: 'rect',
            width: 100,
            height: 100
        };

        shape.add('rect', settings);
        [shapeObj] = canvas.getObjects();

        expect(shapeObj.fill).toBe('blue');
        expect(shapeObj.stroke).toBe('red');
        expect(shapeObj.strokeWidth).toBe(10);
        expect(shapeObj.width).toBe(100); // width + storkeWidth
        expect(shapeObj.height).toBe(100); // height + storkeWidth
    });

    it('When add() is called with the options, this options set the circle object.', () => {
        const settings = {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 3,
            type: 'circle',
            rx: 100,
            ry: 50
        };

        shape.add('circle', settings);
        [shapeObj] = canvas.getObjects();

        expect(shapeObj.fill).toBe('blue');
        expect(shapeObj.stroke).toBe('red');
        expect(shapeObj.strokeWidth).toBe(3);
        expect(shapeObj.width).toBe(200); // rx * 2 + stokeWidth
        expect(shapeObj.height).toBe(100); // ry * 2 + stokeWidth
    });

    it('When add() is called with the options, this options set the triangle object.', () => {
        const settings = {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 0,
            type: 'triangle',
            width: 100,
            height: 100
        };

        shape.add('triangle', settings);
        [shapeObj] = canvas.getObjects();

        expect(shapeObj.fill).toBe('blue');
        expect(shapeObj.stroke).toBe('red');
        expect(shapeObj.strokeWidth).toBe(0);
        expect(shapeObj.width).toBe(100);
        expect(shapeObj.height).toBe(100);
    });

    it('When change() is called, the style of the rectagle object is changed.', () => {
        shape.add('rect');

        [shapeObj] = canvas.getObjects();

        shape.change(shapeObj, {
            fill: 'blue',
            stroke: 'red',
            width: 10,
            height: 20
        });

        expect(shapeObj.fill).toBe('blue');
        expect(shapeObj.stroke).toBe('red');
        expect(shapeObj.width).toBe(10);
        expect(shapeObj.height).toBe(20);
    });

    it('When change() is called, the style of the circle object is changed.', () => {
        shape.add('circle');

        [shapeObj] = canvas.getObjects();

        shape.change(shapeObj, {
            fill: 'blue',
            stroke: 'red',
            rx: 10,
            ry: 20
        });

        expect(shapeObj.fill).toBe('blue');
        expect(shapeObj.stroke).toBe('red');
        expect(shapeObj.width).toBe(20);
        expect(shapeObj.height).toBe(40);
    });

    it('When change() is called, the style of the triangle object is changed.', () => {
        shape.add('triangle');

        [shapeObj] = canvas.getObjects();

        shape.change(shapeObj, {
            width: 10,
            height: 20
        });

        expect(shapeObj.fill).toBe('#ffffff');
        expect(shapeObj.stroke).toBe('#000000');
        expect(shapeObj.width).toBe(10);
        expect(shapeObj.height).toBe(20);
    });

    describe('Fill - filter type', () => {
        beforeEach(done => {
            const imageURL = 'base/test/fixtures/sampleImage.jpg';

            getCachedCanvasImageElement(canvas, true);

            fabric.Image.fromURL(imageURL, sampleImage => {
                graphics.setCanvasImage('', sampleImage);
                shape.add('rect', {
                    strokeWidth: 0,
                    left: 20,
                    top: 30,
                    width: 100,
                    height: 80,
                    fill: {
                        type: 'filter',
                        filter: [{pixelate: 20}]
                    }
                });
                [shapeObj] = canvas.getObjects();

                done();
            });
        });

        it('"_resetPositionFillFilter" should be executed when a movement, rotation, and scaling event of a filter type fill is applied.', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 10
            });
            spyOn(shape, '_resetPositionFillFilter');
            shapeObj.fire('moving');
            shapeObj.fire('rotating');
            shapeObj.fire('scaling');

            expect(shape._resetPositionFillFilter.calls.count()).toBe(3);
        });

        it('cropX and cropY values of the image filled with the shape background must be changed to match the canvas background exactly.', () => {
            shape._resetPositionFillFilter(shapeObj);
            const {cropX, cropY} = getFillImageFromShape(shapeObj);

            expect(cropX).toBe(-30);
            expect(cropY).toBe(-10);
        });

        it('The fill image should be the same size as the shape.', () => {
            shape._resetPositionFillFilter(shapeObj);
            const {width, height} = getFillImageFromShape(shapeObj);

            expect(width).toBe(100);
            expect(height).toBe(80);
        });

        it('The rotated object fill image must be the same size as the rectangle that draws the rotated object border.', () => {
            shapeObj.set({
                angle: 40
            });
            shape._resetPositionFillFilter(shapeObj);
            const {width, height} = getFillImageFromShape(shapeObj);

            expect(Math.round(width)).toBe(128);
            expect(Math.round(height)).toBe(126);
        });

        it('If repositioning is performed while the angle is changed, the angle value of the fill image must have the shape reverse rotation value.', () => {
            shapeObj.set({
                angle: 40
            });
            shape._resetPositionFillFilter(shapeObj);
            const {angle} = getFillImageFromShape(shapeObj);

            expect(angle).toBe(-40);
        });

        it('For shapes that go outside the bottom right area of the canvas, the size and position of the image position should give the expected result.', done => {
            shape.add('rect', {
                strokeWidth: 0,
                left: 250,
                top: 100,
                width: 200,
                height: 200,
                fill: {
                    type: 'filter',
                    filter: [{pixelate: 20}]
                }
            }).then(props => {
                shapeObj = graphics.getObject(props.id);
                const fillImage = getFillImageFromShape(shapeObj);
                const {top, height, left, width} = fillImage;
                expect(top).toBe(75);
                expect(left).toBe(75);
                expect(height).toBe(150);
                expect(width).toBe(150);

                done();
            });
        });

        it('For shapes that go outside the top left area of the canvas, the size and position of the image position should give the expected result.', done => {
            shape.add('rect', {
                strokeWidth: 0,
                left: 50,
                top: 30,
                width: 200,
                height: 70,
                fill: {
                    type: 'filter',
                    filter: [{pixelate: 20}]
                }
            }).then(props => {
                shapeObj = graphics.getObject(props.id);
                const fillImage = getFillImageFromShape(shapeObj);
                const {top, height, left, width} = fillImage;
                expect(Math.round(top)).toBe(40);
                expect(left).toBe(150);
                expect(height).toBe(70);
                expect(width).toBe(200);

                done();
            });
        });

        it('Background image of the shape to which the filter fill is applied must have the filter applied.', () => {
            const fillImage = getFillImageFromShape(shapeObj);

            expect(fillImage.filters.length).toBeGreaterThan(0);
        });
    });

    describe('_onFabricMouseMove()', () => {
        beforeEach(() => {
            shape.add('rect', {
                left: 100,
                top: 100
            });

            [shapeObj] = canvas.getObjects();
            shape._shapeObj = shapeObj;
        });

        it('When the mouse direction is in 1th quadrant,' +
            'the origin values of shape set to "left" and "top".', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 200,
                y: 120
            });

            shape._onFabricMouseMove(fEvent);

            expect(shapeObj.originX).toBe('left');
            expect(shapeObj.originY).toBe('top');
        });

        it('When the mouse direction is in 2th quadrant,' +
            'the origin values of shape set to "right" and "top".', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 80,
                y: 100
            });

            shape._onFabricMouseMove(fEvent);

            expect(shapeObj.originX).toBe('right');
            expect(shapeObj.originY).toBe('top');
        });

        it('When the mouse direction is in 3th quadrant,' +
            'the origin values of shape set to "right" and "bottom".', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 80,
                y: 80
            });

            shape._onFabricMouseMove(fEvent);

            expect(shapeObj.originX).toBe('right');
            expect(shapeObj.originY).toBe('bottom');
        });

        it('When the mouse direction is in 4th quadrant,' +
            'the origin values of shape set to "left" and "bottom".', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 200,
                y: 80
            });

            shape._onFabricMouseMove(fEvent);

            expect(shapeObj.originX).toBe('left');
            expect(shapeObj.originY).toBe('bottom');
        });
    });

    describe('_onFabricMouseUp()', () => {
        let startPoint, expectedPoint;

        beforeEach(() => {
            shape.add('circle', {
                left: 100,
                top: 100
            });

            [shapeObj] = canvas.getObjects();
            shape._shapeObj = shapeObj;
        });

        it('When the drawing shape is in 1th quadrant, "left" and "top" are the same as start point.', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 200,
                y: 120
            });

            startPoint = shapeObj.getPointByOrigin('left', 'top');

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            expectedPoint = shapeObj.getPointByOrigin('left', 'top');

            expect(expectedPoint.x).toBe(startPoint.x);
            expect(expectedPoint.y).toBe(startPoint.y);
        });

        it('When the drawing shape is in 2th quadrant, "right" and "top" are the same as start point.', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 80,
                y: 120
            });

            startPoint = shapeObj.getPointByOrigin('right', 'top');

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            expectedPoint = shapeObj.getPointByOrigin('right', 'top');

            expect(expectedPoint.x).toBe(startPoint.x);
            expect(expectedPoint.y).toBe(startPoint.y);
        });

        it('When the drawing shape is in 3th quadrant, "right" and "bottom" are the same as start point.', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 80,
                y: 80
            });

            startPoint = shapeObj.getPointByOrigin('right', 'bottom');

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            expectedPoint = shapeObj.getPointByOrigin('right', 'bottom');

            expect(expectedPoint.x).toBe(startPoint.x);
            expect(expectedPoint.y).toBe(startPoint.y);
        });

        it('When the drawing shape is in 4th quadrant, "left" and "bottom" are the same as start point.', () => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 120,
                y: 80
            });

            startPoint = shapeObj.getPointByOrigin('left', 'bottom');

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            expectedPoint = shapeObj.getPointByOrigin('left', 'bottom');

            expect(expectedPoint.x).toBe(startPoint.x);
            expect(expectedPoint.y).toBe(startPoint.y);
        });
    });

    it('When drawing the shape with mouse and the "isRegular" option set to true, ' +
        'the created rectangle shape has the same "width" and "height" values.', () => {
        shape.add('rect', {
            left: 0,
            top: 0
        });

        shape._withShiftKey = true;
        [shapeObj] = canvas.getObjects();
        shape._shapeObj = shapeObj;

        spyOn(canvas, 'getPointer').and.returnValue({
            x: 200,
            y: 100
        });

        shape._onFabricMouseMove(fEvent);
        shape._onFabricMouseUp();

        expect(shapeObj.width).toBe(200); // has 1 storkeWidth
        expect(shapeObj.height).toBe(200); // has 1 storkeWidth
    });

    it('When drawing the shape with mouse and the "isRegular" option set to true, ' +
        'the created rectangle shape has the same "width" and "height" values.', () => {
        shape.add('rect', {
            left: 0,
            top: 0
        });

        shape._withShiftKey = true;
        [shapeObj] = canvas.getObjects();
        shape._shapeObj = shapeObj;

        spyOn(canvas, 'getPointer').and.returnValue({
            x: 100,
            y: 200
        });

        shape._onFabricMouseMove(fEvent);
        shape._onFabricMouseUp();

        expect(shapeObj.width).toBe(200); // has 1 storkeWidth
        expect(shapeObj.height).toBe(200); // has 1 storkeWidth
    });
});
