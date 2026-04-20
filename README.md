# Rossy Resilience - Breast Cancer Awareness & Support Platform

A comprehensive healthcare platform for breast cancer awareness, patient support, and early detection.

## 🏥 Features

- **Patient Portal**: Registration, appointment scheduling, care plans, health tracking
- **Doctor Dashboard**: Patient management, visit history, medical records
- **Health Assistant Chatbot**: AI-powered chatbot using OpenAI GPT-4o-mini
- **Breast Cancer Prediction**: Image-based analysis for early detection
- **Email Verification**: Secure account verification system
- **Role-based Access**: Admin, Doctor, and Patient roles

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.9+
- OpenAI API Key

---

## 🔧 Frontend Setup (React)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Frontend

```bash
npm start
```

The frontend will run at **http://localhost:3000**

---

## 🔧 Backend Setup (Flask)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment (Optional but recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` and add your OpenAI API Key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Get your API key from**: https://platform.openai.com/api-keys

### 5. Start the Backend Server

```bash
python app.py
```

The backend will run at **http://localhost:5000**

---

## 🔐 Demo Login Credentials

Use these credentials to test the application:

| Role     | Email              | Password   |
|----------|-------------------|------------|
| Admin    | admin@demo.com    | demo123    |
| Doctor   | doctor@demo.com   | demo123    |
| Patient  | patient@demo.com | demo123    |

---

## 📡 API Endpoints

### Chat Endpoint
```
POST http://localhost:5000/chat
Content-Type: application/json

{
  "message": "What is breast cancer?",
  "history": []
}
```

### Prediction Endpoint
```
POST http://localhost:5000/predict
Content-Type: multipart/form-data

- image: (image file)
```

### Health Check
```
GET http://localhost:5000/health
```

---

## 🎨 Technology Stack

### Frontend
- React 18
- React Router
- Context API (Authentication)
- CSS-in-JS (inline styles)

### Backend
- Flask 3.0
- Flask-CORS
- OpenAI API (GPT-4o-mini)
- Python-dotenv

---

## ⚠️ Medical Disclaimer

This application is for educational and informational purposes only. The chatbot provides general health information and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.

---

## 📁 Project Structure

```
rossy-resilience/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── README.md          # Backend README
├── src/
│   ├── pages/
│   │   ├── patient/       # Patient dashboard & features
│   │   ├── public/        # Public pages (Login, Register, etc.)
│   │   └── admin/         # Admin dashboard
│   ├── services/
│   │   ├── authService.js    # Authentication
│   │   ├── api.js            # API client
│   │   └── chatApi.js        # Chatbot API
│   ├── context/
│   │   └── AuthContext.js    # Auth context provider
│   └── components/            # Reusable components
├── public/                    # Static assets
├── package.json              # Node dependencies
└── README.md                 # This file
```

---

## 🔧 Configuration

### Frontend Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📝 License

This project is for demonstration purposes.
