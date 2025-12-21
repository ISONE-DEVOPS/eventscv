"use strict";
/**
 * NFC Wristband Functions
 *
 * Functions for managing NFC wristbands and cashless payments at events.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferWristbandBalance = exports.toggleWristbandBlock = exports.topUpWristband = exports.processNFCPayment = exports.activateWristband = void 0;
var activateWristband_1 = require("./activateWristband");
Object.defineProperty(exports, "activateWristband", { enumerable: true, get: function () { return activateWristband_1.activateWristband; } });
var processPayment_1 = require("./processPayment");
Object.defineProperty(exports, "processNFCPayment", { enumerable: true, get: function () { return processPayment_1.processNFCPayment; } });
Object.defineProperty(exports, "topUpWristband", { enumerable: true, get: function () { return processPayment_1.topUpWristband; } });
Object.defineProperty(exports, "toggleWristbandBlock", { enumerable: true, get: function () { return processPayment_1.toggleWristbandBlock; } });
Object.defineProperty(exports, "transferWristbandBalance", { enumerable: true, get: function () { return processPayment_1.transferWristbandBalance; } });
//# sourceMappingURL=index.js.map