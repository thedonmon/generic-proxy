# Generic API Proxy

This project provides a simple, customizable API proxy server written in TypeScript. It allows you to forward API requests from a client to a remote API server while hiding your API key. The proxy server supports different methods of passing the API key, such as query parameters, headers, or basic authentication.

## Features

- Customizable API key insertion methods (query, header, basic authentication)
- CORS support
- TypeScript implementation
- Easy setup and deployment

## Prerequisites

- Node.js (LTS version recommended)
- yarn

## Installation

1. Clone the repository:

2. Change the current directory to the project root: `cd generic-api-proxy`

3. Install the required dependencies:

`yarn install`


## Configuration

1. Copy the `.env.example` file to a new file named `.env`:

2. Edit the `.env` file and set the following environment variables:

- `API_BASE_URL`: The base URL of the target API (e.g., `https://api.example.com`)
- `API_KEY`: Your secret API key
- `API_KEY_INSERTION_METHOD`: The method to use for passing the API key (`query`, `header`, or `basic_auth`)
- `CORS_ALLOW_ORIGIN`: A comma-separated list of allowed origins for CORS (e.g., `http://localhost:3000,https://yourdomain.com`). Set to `*` to allow any origin.

## Running the Server

### Development

To start the server in development mode with auto-reloading, run:

`yarn dev`

### Production

To start the server in production mode, run:

`yarn start`


## Usage

Once the server is running, you can make requests to the API proxy from your client-side application. The proxy server will forward your requests to the target API server and return the responses.

For example, if your proxy server is running on `http://localhost:8080`, and you want to request an endpoint from the target API server at `/users`, you would make a request to `http://localhost:8080/users`.

The proxy server will automatically add the API key to your requests based on the specified method (`query`, `header`, or `basic_auth`).

## Future Developments

- Docker support
- Multiple API Keys for different routes
- Rate limiting requests
- Generic support to deploy to cloudflare workers, aws lambdas, azure functions
- Logging for metrics and telemetry

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to help improve this project.

## License

This project is licensed under the MIT License. 
