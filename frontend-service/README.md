# Expense Tracker Frontend

This is the frontend service for the Expense Tracker application, built with React, TypeScript, and Material-UI.

## Features

- Modern, responsive UI with Material-UI components
- Real-time expense tracking and budget management
- Interactive charts and visualizations
- Secure authentication and authorization
- Mobile-friendly design

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Docker (optional, for containerized deployment)

## Getting Started

### Development

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

1. Build the application:

   ```bash
   npm run build
   # or
   yarn build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

### Docker Deployment

1. Build the Docker image:

   ```bash
   docker build -t expense-tracker-frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 expense-tracker-frontend
   ```

## Project Structure

```
frontend-service/
├── src/
│   ├── components/     # React components
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── Dockerfile         # Docker configuration
```

## Environment Variables

The following environment variables are available:

- `VITE_API_BASE_URL`: Base URL for API requests
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_APP_ENV`: Application environment (development/production)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
