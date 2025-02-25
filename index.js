import { INodeType } from 'n8n-workflow';
import { Square } from './nodes/Square/Square.node';

export const nodeTypes: INodeType[] = [
  new Square(),
];