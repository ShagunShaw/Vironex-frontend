# ClipHive - Video Streaming Platform

<img src="public/video%20streamer.png" alt="ClipHive Logo" width="200"/>

ClipHive is a feature-rich video streaming platform built with React and modern web technologies. It allows users to watch, upload, like, and share videos, subscribe to channels, and engage with content through comments. 

## 🌟 Features

- **User Authentication**: Secure signup and login with JWT authentication
- **Video Management**: Upload, watch, like, and share videos
- **Channel Subscriptions**: Subscribe to content creators and track new content
- **Interactive Comments**: Engage with content through comments
- **User Profiles**: Customizable user profiles
- **Playlists**: Create and manage video playlists
- **Responsive Design**: Full mobile and desktop support
- **Video Recommendations**: Smart video recommendations based on user preferences

## 🔧 Technology Stack

- **Frontend**: React.js with Vite for fast builds
- **State Management**: Redux for global state management
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **API Communication**: Axios for HTTP requests
- **Authentication**: JWT with access and refresh tokens
- **Media Handling**: Custom video player integration

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0.0 or later)
- npm or yarn
- A running instance of the ViroNex backend API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cliphive-frontend.git
   cd cliphive-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   VITE_API_URL=your_backend_api_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── assets/          # Static assets like images
├── components/      # Reusable React components
│   ├── Auth/        # Authentication components
│   ├── Comments/    # Comment-related components
│   ├── Header/      # Header and navigation components
│   ├── Home/        # Home page components
│   ├── Landing/     # Landing page components
│   ├── Playlists/   # Playlist management components
│   ├── Subscription/# Channel subscription components
│   ├── User/        # User profile components
│   └── Video/       # Video playback and management components
├── Contexts/        # React context providers
├── custom-hooks/    # Custom React hooks
├── redux/           # Redux store, slices, and actions
└── utils/           # Utility functions and helpers
```

## 🔐 Authentication Flow

ClipHive uses JWT authentication with access and refresh tokens:

1. **Login/Signup**: User receives access and refresh tokens
2. **API Requests**: Access token included in Authorization header
3. **Token Expiry**: Automatic refresh using refresh token
4. **Session Management**: Token storage in localStorage with Redux state management

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## � API Integration

ClipHive communicates with a backend API for data management. The API endpoints are documented in `API_DOC.md` and include:

- User authentication and management
- Video uploads, retrieval, and management
- Comment creation and retrieval
- Subscription management
- Playlist operations
- User profile management

## 🔄 State Management

The application uses Redux for global state management:
- `authSlice.js` - Manages user authentication state
- `sideBar.js` - Controls sidebar visibility and state
- Additional slices for other features

## 🚨 Troubleshooting

Common issues and solutions:

### Authentication Issues
- Ensure your tokens are valid and not expired
- Check network requests for 401/403 errors
- Verify the backend API is running correctly

### Video Playback Problems
- Ensure video formats are supported by the browser
- Check console for media-related errors
- Verify network connectivity for streaming

### API Connection Errors
- Confirm backend server is running
- Check API URL in environment variables
- Review network requests in browser developer tools

## �🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [JWT](https://jwt.io/)
- [React Router](https://reactrouter.com/)
