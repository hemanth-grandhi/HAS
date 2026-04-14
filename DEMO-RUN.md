# HAS Demo Run Guide

This guide is optimized for presentation/demo usage.

## 1) Start backend (demo profile, no Postgres needed)

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-backend"
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

Backend URL: `http://localhost:8080`

## 2) Start frontend

Open a second terminal:

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-frontend"
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## 3) Demo credentials

- Username: `admin`
- Password: `admin123`

## 4) Suggested demo flow

1. Dashboard overview
2. Room Management (show available vs occupied)
3. Booking / Reservation (create a booking)
4. Reservation Check-in
5. Catering entry
6. Billing checkout
7. Occupancy and guest sections

## Notes

- Frontend is backend-first and gracefully falls back to mock behavior for any unmapped data flow, so screens stay stable during a live demo.
- For strict backend-only evaluation later, remove fallback behavior after API contract alignment.
