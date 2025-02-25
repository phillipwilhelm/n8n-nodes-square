FROM n8nio/n8n:latest

USER root

# Set working directory for custom nodes
WORKDIR /home/node/.n8n/custom/nodes/Square

# Copy package.json and pnpm-lock.yaml first for better caching
COPY package.json pnpm-lock.yaml* ./

# Set a consistent PNPM store directory
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_PATH="/pnpm/store"

RUN mkdir -p /pnpm/store && \
    pnpm config set store-dir /pnpm/store && \
    NODE_ENV=development pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm list typescript && \
    pnpm exec which tsc

# Now copy the rest of the project files
COPY ./nodes/Square /home/node/.n8n/custom/nodes/Square
COPY ./tsconfig.json /home/node/.n8n/custom/nodes/tsconfig.json

# Ensure correct permissions
RUN chown -R node:node /home/node/.n8n/custom/nodes && chmod -R 755 /home/node/.n8n/custom/nodes

# Switch to node user for TypeScript compilation
USER node

# Compile TypeScript files
RUN if [ -f "Square.node.ts" ]; then \
        node_modules/.bin/tsc --project /home/node/.n8n/custom/nodes/tsconfig.json || (echo "TypeScript compilation failed with errors:" && exit 1); \
    fi

# Set working directory back
WORKDIR /home/node