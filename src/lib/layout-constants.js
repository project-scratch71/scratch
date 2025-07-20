import keyMirror from 'keymirror';

/**
 * Names for each state of the stage size toggle
 * @enum {string}
 */
const STAGE_SIZE_MODES = keyMirror({
    /**
     * The "large stage" button is pressed; the user would like a large stage.
     */
    large: null,

    /**
     * The "small stage" button is pressed; the user would like a small stage.
     */
    small: null
});

/**
 * Names for each stage render size
 * @enum {string}
 */
const STAGE_DISPLAY_SIZES = keyMirror({
    /**
     * Large stage with wide browser
     */
    large: null,

    /**
     * Large stage with narrow browser
     */
    largeConstrained: null,

    /**
     * Small stage (ignores browser width)
     */
    small: null
});

// zoom level to start with
const BLOCKS_DEFAULT_SCALE = 0.675;

const STAGE_DISPLAY_SCALES = {};
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.large] = 0.85; // large mode, wide browser (reduced from 1.0)
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.largeConstrained] = 0.7; // large mode but narrow browser (reduced from 0.85)
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.small] = 0.45; // small mode, regardless of browser size (reduced from 0.5)

export default {
    standardStageWidth: 480,
    standardStageHeight: 360,
    fullSizeMinWidth: 1024,
    tabletBreakpoint: 768,
    mobileBreakpoint: 480,
    fullSizePaintMinWidth: 1250
};

export {
    BLOCKS_DEFAULT_SCALE,
    STAGE_DISPLAY_SCALES,
    STAGE_DISPLAY_SIZES,
    STAGE_SIZE_MODES
};
