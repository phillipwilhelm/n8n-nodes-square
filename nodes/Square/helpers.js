"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.squareApiRequest = squareApiRequest;
exports.squareApiRequestAllItems = squareApiRequestAllItems;
/**
 * Make an API request to Square
 *
 */
function squareApiRequest(method, endpoint, body, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const options = {
            method,
            body,
            qs: query,
            url: `https://connect.squareup.com/v2${endpoint}`,
            json: true,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (options.qs && Object.keys(options.qs).length === 0) {
            delete options.qs;
        }
        try {
            const response = yield this.helpers.requestWithAuthentication.call(this, 'squareApi', options);
            return response;
        }
        catch (error) {
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                if (endpoint.includes('/customers/')) {
                    const customerId = endpoint.split('/customers/')[1];
                    return {
                        error: {
                            message: `Customer with ID "${customerId}" was not found. Please check if the customer ID exists in your Square account.`,
                            code: 'CUSTOMER_NOT_FOUND',
                        },
                    };
                }
            }
            // Handle other common Square API errors
            if ((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errors) === null || _d === void 0 ? void 0 : _d[0]) {
                const squareError = error.response.data.errors[0];
                throw new Error(`Square API Error: ${squareError.detail || squareError.category}`);
            }
            throw error;
        }
    });
}
function squareApiRequestAllItems(resource_1) {
    return __awaiter(this, arguments, void 0, function* (resource, qs = {}) {
        const returnData = [];
        let responseData;
        do {
            responseData = yield squareApiRequest.call(this, 'GET', `/${resource}s`, {}, qs);
            returnData.push(...responseData.data);
        } while (responseData.has_more);
        return returnData;
    });
}
