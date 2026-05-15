# Masjidh Sandha Management System

A modern web-based management system for masjid membership, payments, and reporting.

## Features

### Membership Management
- Complete member registration with personal details
- Children/dependents tracking with age calculation
- Non-related residents management
- Special needs tracking
- Residence type handling (Own/Rent)

### Payment Tracking
- Monthly Sandha collection
- Meal contributions tracking
- General donations (members & non-members)
- Zakath donations and distribution
- Staff salary management
- Temporary worker payments

### Reporting
- Monthly income summary
- Sandha defaulters list
- Meal contributors report
- Staff salary sheet
- Zakath summary and distribution
- CSV export functionality

### Security & Access Control
- Role-based access (Admin/Staff/Member)
- JWT authentication
- Audit logging
- Password hashing with bcrypt

## Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (easily switchable to PostgreSQL)
- **Pydantic** - Data validation
- **python-jose** - JWT token handling
- **passlib** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Chart.js** - Charts and visualizations

## Project Structure

```
masjidh-sandha-web/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── auth.py              # Authentication utilities
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication routes
│   │   │   ├── members.py       # Member CRUD routes
│   │   │   ├── payments.py      # Payment routes
│   │   │   └── reports.py       # Report routes
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── payment_service.py
│   │       └── report_service.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Members.jsx
│   │       ├── MemberForm.jsx
│   │       ├── Payments.jsx
│   │       └── Reports.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd masjidh-sandha-web
```

2. Start the services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python run.py
```

#### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

## Default Credentials

- **Username:** admin
- **Password:** admin

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/me` - Get current user

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create new member
- `GET /api/members/{memno}` - Get member details
- `PUT /api/members/{memno}` - Update member (Admin only)
- `DELETE /api/members/{memno}` - Delete member (Admin only)
- `POST /api/members/{memno}/children` - Add child
- `POST /api/members/{memno}/non-related` - Add non-related resident
- `POST /api/members/{memno}/remarks` - Add remark

### Payments
- `POST /api/payments/sandha/{memno}` - Record Sandha payment
- `POST /api/payments/meal/{memno}` - Record meal contribution
- `POST /api/payments/donations` - Record donation
- `POST /api/payments/zakath/{donor_memno}` - Record Zakath donation
- `GET /api/payments/donations` - List donations

### Reports
- `GET /api/reports/monthly-summary` - Monthly income summary
- `GET /api/reports/member-history/{memno}` - Member payment history
- `GET /api/reports/sandha-defaulters` - Sandha defaulters
- `GET /api/reports/meal-contributors` - Meal contributors
- `GET /api/reports/staff-salary` - Staff salary sheet
- `GET /api/reports/zakath-summary` - Zakath summary
- `GET /api/reports/export-csv` - Export CSV report

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./sandha.db
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend Proxy

The Vite development server is configured to proxy API requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

## Database Schema

The system uses the following main tables:

- **members** - Member personal information
- **member_children** - Children/dependents details
- **non_related_residents** - Non-related residents
- **users** - System users with roles
- **sandha_payments** - Monthly Sandha payments
- **meal_contributions** - Meal contributions
- **donations** - General donations
- **zakath_donations** - Zakath donations
- **zakath_beneficiaries** - Zakath beneficiaries
- **staff** - Staff information
- **temp_workers** - Temporary workers
- **office_bearers** - Organization office bearers
- **member_remarks** - Member remarks
- **audit_logs** - Audit trail

## Security Features

- **Password Hashing:** bcrypt with salt
- **JWT Tokens:** Secure token-based authentication
- **Role-Based Access:** Admin/Staff/Member roles
- **CORS Protection:** Configured for frontend origin
- **Input Validation:** Pydantic schema validation
- **SQL Injection Prevention:** SQLAlchemy ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.