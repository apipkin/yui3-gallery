var TYPES = Y.Color.TYPES,
    ColorPicker;

/*
        +-----------------+ +---+
        |                 | |   |
        |                 | | s |
        |                 | | l |
        |      field      | | i |
        |                 | | d |
        |                 | | e |
        |                 | | r |
        |                 | |   |
        +-----------------+ +---+
*/

ColorPicker = Y.Base.create('color-picker', Y.Widget, [], {


    initializer: function () {

        this.fieldNode = null;

        this.sliderNode = null;

        this.slider = new Y.Slider(this.get('sliderConfig'));

    },

    renderUI: function () {
        var fieldNode = Y.Node.create('<div class="sv"></div>'),
            sliderNode = Y.Node.create('<div class="hue"></div>');

        this.get('contentBox').append(fieldNode).append(sliderNode);

        this.fieldNode = fieldNode;
        this.sliderNode = sliderNode;

        this.slider.render(sliderNode);
    },

    bindUI: function () {
        // bind arrow key press for minor adjustments
        this.after('keyPress', Y.bind(this.afterArrowPress, this));

        // bind mouse clicks on field to adjust sat and lum
        this.fieldNode.after('click', Y.bind(this.afterFieldClick, this));

        // bind slider to adjust hue
        this.slider.after('valueChange', Y.bind(this.afterSliderValueChange, this));

        // bind attr changes to update field and slider
        this.after('hChange', Y.bind(this.afterHChange, this));
        this.after('sChange', Y.bind(this.afterSChange, this));
        this.after('vChange', Y.bind(this.afterVChange, this));
        this.after('visiblityChange', Y.bind(this.afterVisibilityChange, this));
    },

    syncUI: function () {
        this.set('color', Y.Color.convert(this._getHSV(), this.get('type')));
        this.fieldNode.setStyle('backgroundColor', Y.Color.fromArray([this.get('h'), 100, 50], TYPES.HSL));
    },

    afterArrowPress: function(e) {
        if (!this.hasFocus()){
            return;
        }
    },

    afterFieldClick: function(e) {
        var region = this.fieldNode.get('region'),
            s,
            l;

        s = (e.clientX - region.left) / region.width;
        v = (e.clientY - region.top) / region.height;

        this.set('s', s * 100);
        this.set('v', Math.abs(v * 100 - 100));
    },

    afterSliderValueChange: function(e) {
        this.set('h', e.newVal);
        this.fieldNode.setStyle('backgroundColor', Y.Color.fromArray([e.newVal, 100, 50], TYPES.HSL));
    },

    afterTypeChange: function(e) {
        this.set('prevColor', Y.Color.convert(this.get('prevColor'), e.newVal));
        this.set('color',  Y.Color.convert(this.get('color'), e.newVal));
    },

    afterHChange: function(e) {
        this.syncUI();
    },

    afterSChange: function(e) {
        this.syncUI();
    },

    afterVChange: function(e) {
        this.syncUI();
    },

    afterVisibilityChange: function (e) {
        if (!e.newVal) {
            this.set('prevColor', this.get('newColor'));
        }
    },

    _defPrevColor: function () {
        return Y.Color.convert(this._getHSV(), this.get('type'));
    },

    _defColor: function () {
        return this.get('prevColor');
    },

    _defSliderConfig: function () {
        return {
            axis: 'y',
            min: 360,
            max: 0,
            length: '256px',
            value: this.get('h')
        };
    },

    _defH: function () {
        return this.slider && this.slider.get('value') || null;
    },

    _hSetter: function (val) {
        return val % 360;
    },

    _getHSV: function () {
        return Y.Color.fromArray([this.get('h'), this.get('s'), this.get('v')], TYPES.HSV);
    }



}, {
    ATTRS: {

        type: {
            value: TYPES.HEX
        },

        prevColor: {
            valueFn: '_defPrevColor'
        },

        color: {
            valueFn: '_defColor'
        },

        h: {
            valueFn: '_defH',
            setter: '_hSetter'
        },

        s: {
            value: 0
        },

        v: {
            value: 0
        },

        sliderConfig: {
            valueFn: '_defSliderConfig'
        }
    }
});

Y.ColorPicker = ColorPicker;