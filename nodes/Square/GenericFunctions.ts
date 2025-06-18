import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IWebhookFunctions,
	NodeApiError,
} from 'n8n-workflow';

import { OptionsWithUri } from 'request';

export async function squareApiRequest(
	this: IHookFunctions | IExecuteFunctions | IWebhookFunctions,
	method: string,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
	uri?: string,
): Promise<any> {
	const credentials = await this.getCredentials('squareApi');
	
	const options: OptionsWithUri = {
		method,
		body,
		qs,
		uri: uri || `https://connect.squareup.com${resource}`,
		headers: {
			'Authorization': `Bearer ${credentials.accessToken}`,
			'Square-Version': '2025-05-21',
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		json: true,
	};

	// Use sandbox environment if specified in credentials
	if (credentials.environment === 'sandbox') {
		options.uri = uri || `https://connect.squareupsandbox.com${resource}`;
	}

	try {
		const response = await this.helpers.request(options);
		
		// Handle Square API error responses
		if (response.errors && response.errors.length > 0) {
			const errorMessage = response.errors.map((error: any) => error.detail || error.code).join(', ');
			throw new NodeApiError(this.getNode(), response, { message: errorMessage });
		}

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function squareApiRequestAllItems(
	this: IExecuteFunctions,
	propertyName: string,
	method: string,
	resource: string,
	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];
	
	let responseData;
	query.cursor = undefined;
	
	do {
		responseData = await squareApiRequest.call(this, method, resource, body, query);
		
		if (responseData[propertyName]) {
			returnData.push.apply(returnData, responseData[propertyName]);
		}
		
		query.cursor = responseData.cursor;
	} while (responseData.cursor);

	return returnData;
}

export function generateIdempotencyKey(): string {
	return `n8n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}