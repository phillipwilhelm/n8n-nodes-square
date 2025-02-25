import type {
	IExecuteFunctions,
	IHookFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * Make an API request to Square
 *
 */
export async function squareApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
) {
	const options = {
		method,
		body,
		qs: query,
		url: `https://connect.squareup.com/v2${endpoint}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
		},
	} satisfies IHttpRequestOptions;

	if (options.qs && Object.keys(options.qs).length === 0) {
		delete options.qs;
	}

	try {
		const response = await this.helpers.requestWithAuthentication.call(this, 'squareApi', options);
		return response;
	} catch (error: any) {
		if (error.response?.status === 404) {
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
		if (error.response?.data?.errors?.[0]) {
			const squareError = error.response.data.errors[0];
			throw new Error(`Square API Error: ${squareError.detail || squareError.category}`);
		}

		throw error;
	}
}

export async function squareApiRequestAllItems(
	this: IExecuteFunctions,
	resource: string,
	qs: IDataObject = {},
) {
	const returnData: IDataObject[] = [];
	let responseData;

	do {
		responseData = await squareApiRequest.call(this, 'GET', `/${resource}s`, {}, qs);
		returnData.push(...(responseData.data as IDataObject[]));
	} while (responseData.has_more);

	return returnData;
}
