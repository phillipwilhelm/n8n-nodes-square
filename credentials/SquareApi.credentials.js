"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquareApi = void 0;
class SquareApi {
    constructor() {
        this.name = 'squareApi';
        this.displayName = 'Square API';
        this.documentationUrl = 'https://developer.squareup.com/docs';
        this.properties = [
            {
                displayName: 'Access Token',
                name: 'accessToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
            },
            {
                displayName: 'Environment',
                name: 'environment',
                type: 'options',
                default: 'sandbox',
                options: [
                    {
                        name: 'Sandbox',
                        value: 'sandbox',
                    },
                    {
                        name: 'Production',
                        value: 'production',
                    },
                ],
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'Square-Version': '2024-01-01',
                    Authorization: '=Bearer {{$credentials.accessToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials?.environment === "sandbox" ? "https://connect.squareupsandbox.com/v2" : "https://connect.squareup.com/v2"}}',
                url: '/customers',
                json: true,
            },
        };
    }
}
exports.SquareApi = SquareApi;
