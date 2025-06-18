import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { squareApiRequest, squareApiRequestAllItems } from './GenericFunctions';

export class Square implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Square',
		name: 'square',
		icon: 'file:square.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Square API - Payments, Orders, Items, Devices, and Locations',
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
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Payment',
						value: 'payment',
					},
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Catalog Item',
						value: 'catalogItem',
					},
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'Location',
						value: 'location',
					},
				],
				default: 'payment',
			},

			// Payment Operations (keep existing if any)
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['payment'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a payment',
						action: 'Create a payment',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a payment',
						action: 'Get a payment',
					},
				],
				default: 'create',
			},

			// Order Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['order'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new order',
						action: 'Create an order',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an order by ID',
						action: 'Get an order',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search orders with filters',
						action: 'Search orders',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing order',
						action: 'Update an order',
					},
					{
						name: 'Pay',
						value: 'pay',
						description: 'Pay for an order',
						action: 'Pay for an order',
					},
				],
				default: 'get',
			},

			// Catalog Item Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['catalogItem'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a catalog item by ID',
						action: 'Get a catalog item',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search catalog items',
						action: 'Search catalog items',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all catalog items',
						action: 'List catalog items',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a catalog item',
						action: 'Create a catalog item',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a catalog item',
						action: 'Update a catalog item',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a catalog item',
						action: 'Delete a catalog item',
					},
				],
				default: 'get',
			},

			// Device Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['device'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all devices',
						action: 'List devices',
					},
					{
						name: 'Create Device Code',
						value: 'createDeviceCode',
						description: 'Create a device code for Terminal pairing',
						action: 'Create device code',
					},
					{
						name: 'Get Device Code',
						value: 'getDeviceCode',
						description: 'Get device code details',
						action: 'Get device code',
					},
					{
						name: 'List Device Codes',
						value: 'listDeviceCodes',
						description: 'List all device codes',
						action: 'List device codes',
					},
				],
				default: 'list',
			},

			// Location Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['location'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a location by ID',
						action: 'Get a location',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all locations',
						action: 'List locations',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new location',
						action: 'Create a location',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a location',
						action: 'Update a location',
					},
				],
				default: 'get',
			},

			// Payment Parameters (keep existing)
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['create'],
					},
				},
				default: 0,
				description: 'Amount in cents',
			},

			{
				displayName: 'Source ID',
				name: 'sourceId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The payment source ID (card nonce, token, etc.)',
			},

			{
				displayName: 'Payment ID',
				name: 'paymentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the payment',
			},

			// Order Parameters
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['get', 'update', 'pay'],
					},
				},
				default: '',
				description: 'The ID of the order',
			},

			{
				displayName: 'Location IDs',
				name: 'locationIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Comma-separated list of location IDs to search (max 10)',
			},

			// Catalog Item Parameters
			{
				displayName: 'Object ID',
				name: 'objectId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['catalogItem'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the catalog object',
			},

			// Device Parameters
			{
				displayName: 'Device Code ID',
				name: 'deviceCodeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['getDeviceCode'],
					},
				},
				default: '',
				description: 'The ID of the device code',
			},

			// Location Parameters
			{
				displayName: 'Location ID',
				name: 'locationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['location'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				description: 'The ID of the location (use "main" for main location)',
			},

			// Additional Fields for Orders
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						description: 'The ID of the location to associate with the order',
					},
					{
						displayName: 'Reference ID',
						name: 'reference_id',
						type: 'string',
						default: '',
						description: 'A client-specified ID to associate an entity in another system',
					},
					{
						displayName: 'Customer ID',
						name: 'customer_id',
						type: 'string',
						default: '',
						description: 'The ID of the customer associated with the order',
					},
					{
						displayName: 'Line Items',
						name: 'line_items',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Line Item',
								name: 'line_item',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'The name of the line item',
									},
									{
										displayName: 'Quantity',
										name: 'quantity',
										type: 'number',
										default: 1,
										description: 'The quantity of the line item',
									},
									{
										displayName: 'Base Price (in cents)',
										name: 'base_price_money',
										type: 'number',
										default: 0,
										description: 'The base price in the smallest unit of currency',
									},
									{
										displayName: 'Currency',
										name: 'currency',
										type: 'string',
										default: 'USD',
										description: 'The currency code',
									},
									{
										displayName: 'Catalog Object ID',
										name: 'catalog_object_id',
										type: 'string',
										default: '',
										description: 'The ID of the catalog item variation',
									},
								],
							},
						],
					},
				],
			},

			// Additional Fields for Catalog Items
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['catalogItem'],
						operation: ['search', 'list', 'create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Types',
						name: 'types',
						type: 'multiOptions',
						default: ['ITEM'],
						options: [
							{ name: 'Item', value: 'ITEM' },
							{ name: 'Item Variation', value: 'ITEM_VARIATION' },
							{ name: 'Category', value: 'CATEGORY' },
							{ name: 'Tax', value: 'TAX' },
							{ name: 'Discount', value: 'DISCOUNT' },
							{ name: 'Modifier', value: 'MODIFIER' },
							{ name: 'Modifier List', value: 'MODIFIER_LIST' },
						],
						description: 'The types of catalog objects to include',
					},
					{
						displayName: 'Text Filter',
						name: 'text_filter',
						type: 'string',
						default: '',
						description: 'Search text to filter catalog items',
					},
					{
						displayName: 'Category IDs',
						name: 'category_ids',
						type: 'string',
						default: '',
						description: 'Comma-separated list of category IDs to filter by',
					},
					{
						displayName: 'Include Related Objects',
						name: 'include_related_objects',
						type: 'boolean',
						default: false,
						description: 'Whether to include related objects',
					},
					{
						displayName: 'Item Name',
						name: 'item_name',
						type: 'string',
						default: '',
						description: 'Name for the catalog item',
					},
					{
						displayName: 'Item Description',
						name: 'item_description',
						type: 'string',
						default: '',
						description: 'Description for the catalog item',
					},
				],
			},

			// Additional Fields for Devices
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['createDeviceCode'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'An optional user-defined name for the device code',
					},
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						description: 'The location ID to associate with the device code',
					},
				],
			},

			// Additional Fields for Locations
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['location'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The location name (nickname)',
					},
					{
						displayName: 'Business Name',
						name: 'business_name',
						type: 'string',
						default: '',
						description: 'The business name of the location',
					},
					{
						displayName: 'Address Line 1',
						name: 'address_line_1',
						type: 'string',
						default: '',
						description: 'First line of the address',
					},
					{
						displayName: 'Address Line 2',
						name: 'address_line_2',
						type: 'string',
						default: '',
						description: 'Second line of the address',
					},
					{
						displayName: 'Locality (City)',
						name: 'locality',
						type: 'string',
						default: '',
						description: 'The city or locality',
					},
					{
						displayName: 'State/Province',
						name: 'administrative_district_level_1',
						type: 'string',
						default: '',
						description: 'The state or province',
					},
					{
						displayName: 'Postal Code',
						name: 'postal_code',
						type: 'string',
						default: '',
						description: 'The postal code',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: 'US',
						description: 'The country code',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'payment') {
					responseData = await this.executePaymentOperation(i);
				} else if (resource === 'order') {
					responseData = await this.executeOrderOperation(i);
				} else if (resource === 'catalogItem') {
					responseData = await this.executeCatalogItemOperation(i);
				} else if (resource === 'device') {
					responseData = await this.executeDeviceOperation(i);
				} else if (resource === 'location') {
					responseData = await this.executeLocationOperation(i);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	// Payment Operations (keep existing or add basic ones)
	private async executePaymentOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		switch (operation) {
			case 'create':
				return this.createPayment(itemIndex);
			case 'get':
				return this.getPayment(itemIndex);
			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
					itemIndex,
				});
		}
	}

	private async createPayment(itemIndex: number): Promise<any> {
		const amount = this.getNodeParameter('amount', itemIndex) as number;
		const sourceId = this.getNodeParameter('sourceId', itemIndex) as string;

		const body: any = {
			source_id: sourceId,
			idempotency_key: this.helpers.generateIdempotencyKey(),
			amount_money: {
				amount: amount,
				currency: 'USD',
			},
		};

		return squareApiRequest.call(this, 'POST', '/v2/payments', body);
	}

	private async getPayment(itemIndex: number): Promise<any> {
		const paymentId = this.getNodeParameter('paymentId', itemIndex) as string;
		return squareApiRequest.call(this, 'GET', `/v2/payments/${paymentId}`);
	}

	// Order Operations
	private async executeOrderOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		switch (operation) {
			case 'create':
				return this.createOrder(itemIndex);
			case 'get':
				return this.getOrder(itemIndex);
			case 'search':
				return this.searchOrders(itemIndex);
			case 'update':
				return this.updateOrder(itemIndex);
			case 'pay':
				return this.payOrder(itemIndex);
			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
					itemIndex,
				});
		}
	}

	private async createOrder(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;
		
		const body: any = {
			order: {},
			idempotency_key: this.helpers.generateIdempotencyKey(),
		};

		if (additionalFields.location_id) {
			body.order.location_id = additionalFields.location_id;
		}

		if (additionalFields.reference_id) {
			body.order.reference_id = additionalFields.reference_id;
		}

		if (additionalFields.customer_id) {
			body.order.customer_id = additionalFields.customer_id;
		}

		if (additionalFields.line_items?.line_item) {
			body.order.line_items = additionalFields.line_items.line_item.map((item: any) => {
				const lineItem: any = {
					name: item.name,
					quantity: item.quantity.toString(),
				};

				if (item.catalog_object_id) {
					lineItem.catalog_object_id = item.catalog_object_id;
				} else {
					lineItem.base_price_money = {
						amount: item.base_price_money,
						currency: item.currency || 'USD',
					};
				}

				return lineItem;
			});
		}

		return squareApiRequest.call(this, 'POST', '/v2/orders', body);
	}

	private async getOrder(itemIndex: number): Promise<any> {
		const orderId = this.getNodeParameter('orderId', itemIndex) as string;
		return squareApiRequest.call(this, 'GET', `/v2/orders/${orderId}`);
	}

	private async searchOrders(itemIndex: number): Promise<any> {
		const locationIds = this.getNodeParameter('locationIds', itemIndex) as string;

		const body: any = {
			location_ids: locationIds.split(',').map(id => id.trim()),
		};

		return squareApiRequest.call(this, 'POST', '/v2/orders/search', body);
	}

	private async updateOrder(itemIndex: number): Promise<any> {
		const orderId = this.getNodeParameter('orderId', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {
			order: {},
			idempotency_key: this.helpers.generateIdempotencyKey(),
		};

		Object.assign(body.order, additionalFields);

		return squareApiRequest.call(this, 'PUT', `/v2/orders/${orderId}`, body);
	}

	private async payOrder(itemIndex: number): Promise<any> {
		const orderId = this.getNodeParameter('orderId', itemIndex) as string;

		const body: any = {
			idempotency_key: this.helpers.generateIdempotencyKey(),
		};

		return squareApiRequest.call(this, 'POST', `/v2/orders/${orderId}/pay`, body);
	}

	// Catalog Item Operations
	private async executeCatalogItemOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		switch (operation) {
			case 'get':
				return this.getCatalogItem(itemIndex);
			case 'search':
				return this.searchCatalogItems(itemIndex);
			case 'list':
				return this.listCatalogItems(itemIndex);
			case 'create':
				return this.createCatalogItem(itemIndex);
			case 'update':
				return this.updateCatalogItem(itemIndex);
			case 'delete':
				return this.deleteCatalogItem(itemIndex);
			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
					itemIndex,
				});
		}
	}

	private async getCatalogItem(itemIndex: number): Promise<any> {
		const objectId = this.getNodeParameter('objectId', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		let qs: any = {};

		if (additionalFields.include_related_objects) {
			qs.include_related_objects = additionalFields.include_related_objects;
		}

		return squareApiRequest.call(this, 'GET', `/v2/catalog/object/${objectId}`, {}, qs);
	}

	private async searchCatalogItems(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {};

		if (additionalFields.text_filter) {
			body.text_filter = additionalFields.text_filter;
		}

		if (additionalFields.category_ids) {
			body.category_ids = additionalFields.category_ids.split(',').map((id: string) => id.trim());
		}

		return squareApiRequest.call(this, 'POST', '/v2/catalog/search', body);
	}

	private async listCatalogItems(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		let qs: any = {};

		if (additionalFields.types) {
			qs.types = additionalFields.types.join(',');
		} else {
			qs.types = 'ITEM';
		}

		return squareApiRequestAllItems.call(this, 'objects', 'GET', '/v2/catalog/list', {}, qs);
	}

	private async createCatalogItem(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {
			idempotency_key: this.helpers.generateIdempotencyKey(),
			batches: [
				{
					objects: [
						{
							type: 'ITEM',
							id: `#temp_item_${Date.now()}`,
							item_data: {
								name: additionalFields.item_name || 'New Item',
								description: additionalFields.item_description || '',
								variations: [
									{
										type: 'ITEM_VARIATION',
										id: `#temp_variation_${Date.now()}`,
										item_variation_data: {
											name: 'Regular',
											pricing_type: 'FIXED_PRICING',
											price_money: {
												amount: 100,
												currency: 'USD',
											},
										},
									},
								],
							},
						},
					],
				},
			],
		};

		return squareApiRequest.call(this, 'POST', '/v2/catalog/batch-upsert', body);
	}

	private async updateCatalogItem(itemIndex: number): Promise<any> {
		const objectId = this.getNodeParameter('objectId', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {
			idempotency_key: this.helpers.generateIdempotencyKey(),
			batches: [
				{
					objects: [
						{
							type: 'ITEM',
							id: objectId,
							item_data: {
								name: additionalFields.item_name,
								description: additionalFields.item_description,
							},
						},
					],
				},
			],
		};

		return squareApiRequest.call(this, 'POST', '/v2/catalog/batch-upsert', body);
	}

	private async deleteCatalogItem(itemIndex: number): Promise<any> {
		const objectId = this.getNodeParameter('objectId', itemIndex) as string;

		const body: any = {
			object_ids: [objectId],
		};

		return squareApiRequest.call(this, 'POST', '/v2/catalog/batch-delete', body);
	}

	// Device Operations
	private async executeDeviceOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		switch (operation) {
			case 'list':
				return this.listDevices(itemIndex);
			case 'createDeviceCode':
				return this.createDeviceCode(itemIndex);
			case 'getDeviceCode':
				return this.getDeviceCode(itemIndex);
			case 'listDeviceCodes':
				return this.listDeviceCodes(itemIndex);
			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
					itemIndex,
				});
		}
	}

	private async listDevices(itemIndex: number): Promise<any> {
		return squareApiRequest.call(this, 'GET', '/v2/devices');
	}

	private async createDeviceCode(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {
			idempotency_key: this.helpers.generateIdempotencyKey(),
			device_code: {
				product_type: 'TERMINAL_API',
			},
		};

		if (additionalFields.name) {
			body.device_code.name = additionalFields.name;
		}

		if (additionalFields.location_id) {
			body.device_code.location_id = additionalFields.location_id;
		}

		return squareApiRequest.call(this, 'POST', '/v2/devices/codes', body);
	}

	private async getDeviceCode(itemIndex: number): Promise<any> {
		const deviceCodeId = this.getNodeParameter('deviceCodeId', itemIndex) as string;
		return squareApiRequest.call(this, 'GET', `/v2/devices/codes/${deviceCodeId}`);
	}

	private async listDeviceCodes(itemIndex: number): Promise<any> {
		return squareApiRequest.call(this, 'GET', '/v2/devices/codes');
	}

	// Location Operations
	private async executeLocationOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		switch (operation) {
			case 'get':
				return this.getLocation(itemIndex);
			case 'list':
				return this.listLocations(itemIndex);
			case 'create':
				return this.createLocation(itemIndex);
			case 'update':
				return this.updateLocation(itemIndex);
			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
					itemIndex,
				});
		}
	}

	private async getLocation(itemIndex: number): Promise<any> {
		const locationId = this.getNodeParameter('locationId', itemIndex) as string;
		return squareApiRequest.call(this, 'GET', `/v2/locations/${locationId}`);
	}

	private async listLocations(itemIndex: number): Promise<any> {
		return squareApiRequest.call(this, 'GET', '/v2/locations');
	}

	private async createLocation(itemIndex: number): Promise<any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {};

		if (additionalFields.name) {
			body.name = additionalFields.name;
		}

		if (additionalFields.business_name) {
			body.business_name = additionalFields.business_name;
		}

		// Build address object if any address fields are provided
		const addressFields = [
			'address_line_1',
			'address_line_2',
			'locality',
			'administrative_district_level_1',
			'postal_code',
			'country'
		];

		const address: any = {};
		let hasAddressFields = false;

		addressFields.forEach(field => {
			if (additionalFields[field]) {
				address[field] = additionalFields[field];
				hasAddressFields = true;
			}
		});

		if (hasAddressFields) {
			body.address = address;
		}

		return squareApiRequest.call(this, 'POST', '/v2/locations', body);
	}

	private async updateLocation(itemIndex: number): Promise<any> {
		const locationId = this.getNodeParameter('locationId', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

		const body: any = {};

		if (additionalFields.name) {
			body.name = additionalFields.name;
		}

		if (additionalFields.business_name) {
			body.business_name = additionalFields.business_name;
		}

		// Build address object if any address fields are provided
		const addressFields = [
			'address_line_1',
			'address_line_2',
			'locality',
			'administrative_district_level_1',
			'postal_code',
			'country'
		];

		const address: any = {};
		let hasAddressFields = false;

		addressFields.forEach(field => {
			if (additionalFields[field]) {
				address[field] = additionalFields[field];
				hasAddressFields = true;
			}
		});

		if (hasAddressFields) {
			body.address = address;
		}

		return squareApiRequest.call(this, 'PUT', `/v2/locations/${locationId}`, body);
	}
}