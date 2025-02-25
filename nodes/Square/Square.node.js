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
exports.Square = void 0;
const helpers_1 = require("./helpers");
const n8n_workflow_1 = require("n8n-workflow");
const CustomerOperations_1 = require("./descriptions/CustomerOperations");
const InvoiceOperations_1 = require("./descriptions/InvoiceOperations");
class Square {
    constructor() {
        this.description = {
            displayName: 'Square',
            name: 'square',
            icon: 'file:Square.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Consume Square API',
            defaults: {
                name: 'Square',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'squareApi',
                    required: true,
                },
            ],
            requestDefaults: {
                baseURL: '={{$credentials?.environment === "sandbox" ? "https://connect.squareupsandbox.com/v2" : "https://connect.squareup.com/v2"}}',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Customer',
                            value: 'customer',
                        },
                        {
                            name: 'Invoice',
                            value: 'invoice',
                        },
                    ],
                    default: 'customer',
                },
                ...CustomerOperations_1.customerOperations,
                ...CustomerOperations_1.customerFields,
                ...InvoiceOperations_1.invoiceOperations,
                ...InvoiceOperations_1.invoiceFields,
            ],
        };
        this.methods = {
            loadOptions: {
            // Add any dynamic option loading methods here
            },
        };
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.getInputData();
            const returnData = [];
            const resource = this.getNodeParameter('resource', 0);
            const operation = this.getNodeParameter('operation', 0);
            let responseData;
            for (let i = 0; i < items.length; i++) {
                try {
                    if (resource === 'customer') {
                        // *********************************************************************
                        //                             customer
                        // *********************************************************************
                        if (operation === 'create') {
                            // ----------------------------------
                            //         customer: create
                            // ----------------------------------
                            const body = {
                                given_name: this.getNodeParameter('given_name', i),
                            };
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            Object.assign(body, additionalFields);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'POST', '/customers', body);
                        }
                        else if (operation === 'get') {
                            // ----------------------------------
                            //         customer: get
                            // ----------------------------------
                            const customerId = this.getNodeParameter('customerId', i);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'GET', `/customers/${customerId}`, {}, {});
                            if (responseData.error) {
                                if (this.continueOnFail()) {
                                    const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: responseData.error.message }), { itemData: { item: i } });
                                    returnData.push(...executionErrorData);
                                    continue;
                                }
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), responseData.error.message, {
                                    itemIndex: i,
                                });
                            }
                        }
                        else if (operation === 'getAll') {
                            // ----------------------------------
                            //         customer: getAll
                            // ----------------------------------
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const limit = this.getNodeParameter('limit', i, 100);
                            if (returnAll) {
                                responseData = yield helpers_1.squareApiRequestAllItems.call(this, '/customers');
                            }
                            else {
                                const qs = {
                                    limit,
                                };
                                responseData = yield helpers_1.squareApiRequest.call(this, 'GET', '/customers', {}, qs);
                            }
                        }
                        else if (operation === 'update') {
                            // ----------------------------------
                            //         customer: update
                            // ----------------------------------
                            const customerId = this.getNodeParameter('customerId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            if (Object.keys(updateFields).length === 0) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Please enter at least one field to update for the customer', { itemIndex: i });
                            }
                            responseData = yield helpers_1.squareApiRequest.call(this, 'PUT', `/customers/${customerId}`, updateFields);
                        }
                        else if (operation === 'delete') {
                            // ----------------------------------
                            //         customer: delete
                            // ----------------------------------
                            const customerId = this.getNodeParameter('customerId', i);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'DELETE', `/customers/${customerId}`, {}, {});
                        }
                        else if (operation === 'search') {
                            // ----------------------------------
                            //         customer: search
                            // ----------------------------------
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const searchFields = this.getNodeParameter('searchFields', i);
                            const body = {
                                query: {
                                    filter: {
                                        location_ids: (searchFields === null || searchFields === void 0 ? void 0 : searchFields.location_ids)
                                            ? searchFields.location_ids.split(',')
                                            : undefined,
                                        customer_ids: (searchFields === null || searchFields === void 0 ? void 0 : searchFields.customer_ids)
                                            ? searchFields.customer_ids.split(',')
                                            : undefined,
                                    },
                                },
                            };
                            if (returnAll) {
                                responseData = yield helpers_1.squareApiRequestAllItems.call(this, '/customers/search', body);
                            }
                            else {
                                const limit = this.getNodeParameter('limit', i, 100);
                                body.limit = limit;
                                responseData = yield helpers_1.squareApiRequest.call(this, 'POST', '/customers/search', body);
                            }
                        }
                    }
                    else if (resource === 'invoice') {
                        // *********************************************************************
                        //                             invoice
                        // *********************************************************************
                        if (operation === 'create') {
                            // ----------------------------------
                            //         invoice: create
                            // ----------------------------------
                            const body = {
                                location_id: this.getNodeParameter('location_id', i),
                            };
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            Object.assign(body, additionalFields);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'POST', '/invoices', body);
                        }
                        else if (operation === 'get') {
                            // ----------------------------------
                            //         invoice: get
                            // ----------------------------------
                            const invoiceId = this.getNodeParameter('invoiceId', i);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'GET', `/invoices/${invoiceId}`, {}, {});
                        }
                        else if (operation === 'getAll') {
                            // ----------------------------------
                            //         invoice: getAll
                            // ----------------------------------
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const limit = this.getNodeParameter('limit', i, 100);
                            if (returnAll) {
                                responseData = yield helpers_1.squareApiRequestAllItems.call(this, '/invoices');
                            }
                            else {
                                const qs = {
                                    limit,
                                };
                                responseData = yield helpers_1.squareApiRequest.call(this, 'GET', '/invoices', {}, qs);
                            }
                        }
                        else if (operation === 'update') {
                            // ----------------------------------
                            //         invoice: update
                            // ----------------------------------
                            const invoiceId = this.getNodeParameter('invoiceId', i);
                            const version = this.getNodeParameter('version', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            if (Object.keys(updateFields).length === 0) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Please enter at least one field to update for the invoice', { itemIndex: i });
                            }
                            const body = {
                                invoice: Object.assign({ version }, updateFields),
                            };
                            responseData = yield helpers_1.squareApiRequest.call(this, 'PUT', `/invoices/${invoiceId}`, body);
                        }
                        else if (operation === 'delete') {
                            // ----------------------------------
                            //         invoice: delete
                            // ----------------------------------
                            const invoiceId = this.getNodeParameter('invoiceId', i);
                            const version = this.getNodeParameter('version', i);
                            responseData = yield helpers_1.squareApiRequest.call(this, 'DELETE', `/invoices/${invoiceId}`, {
                                version,
                            });
                        }
                        else if (operation === 'search') {
                            // ----------------------------------
                            //         invoice: search
                            // ----------------------------------
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const searchFields = this.getNodeParameter('searchFields', i);
                            const body = {
                                query: {
                                    filter: {
                                        location_ids: (searchFields === null || searchFields === void 0 ? void 0 : searchFields.location_ids)
                                            ? searchFields.location_ids.split(',')
                                            : undefined,
                                        customer_ids: (searchFields === null || searchFields === void 0 ? void 0 : searchFields.customer_ids)
                                            ? searchFields.customer_ids.split(',')
                                            : undefined,
                                    },
                                },
                            };
                            if (returnAll) {
                                responseData = yield helpers_1.squareApiRequestAllItems.call(this, '/invoices/search', body);
                            }
                            else {
                                const limit = this.getNodeParameter('limit', i, 100);
                                body.limit = limit;
                                responseData = yield helpers_1.squareApiRequest.call(this, 'POST', '/invoices/search', body);
                            }
                        }
                    }
                }
                catch (error) {
                    if (this.continueOnFail()) {
                        const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                        returnData.push(...executionErrorData);
                        continue;
                    }
                    throw error;
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            return [returnData];
        });
    }
}
exports.Square = Square;
