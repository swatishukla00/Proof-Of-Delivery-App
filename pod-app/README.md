# Logistics Proof of Delivery (POD) App

A prototype web application for delivery drivers to scan AWB numbers, capture proof of delivery media, and upload to cloud storage.

## Features

1. **AWB Scanning**: Simulate scanning package Air Waybill numbers
2. **Media Capture**: Take photos or record videos as proof of delivery
3. **Cloud Storage**: Upload captured media associated with AWB numbers

## Technology Stack

- **Frontend**: React with Vite
- **Styling**: CSS3 with responsive design
- **Camera API**: Browser MediaDevices API
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd pod-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Click "Scan AWB Barcode" to enter an AWB number (simulated)
2. Choose to "Take Photo" or "Record Video" for proof of delivery
3. Click "Upload to Cloud" to simulate uploading to cloud storage

## System Design

See [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for detailed architecture and data model information.

## License

This project is licensed under the MIT License.