# HAS Run Guide

This file explains how to run the full project in two modes:
- `demo` mode (quick start, no PostgreSQL setup, non-persistent data)
- `local` mode (PostgreSQL-backed, persistent data)

## Prerequisites

- Java 17+ (project currently runs with newer Java as well)
- Maven
- Node.js 18+ and npm
- PostgreSQL (only needed for `local` mode)

## Option A: Demo Mode (fastest)

Use this for demo/submission walkthroughs when you want zero DB setup.

### 1) Start backend

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-backend"
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

Backend runs on: `http://localhost:8080`

### 2) Start frontend (new terminal)

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-frontend"
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3) Login credentials

- `admin` / `admin123`
- `reception` / `reception123`
- `catering` / `catering123`
- `manager` / `manager123`

## Option B: Local Mode (persistent database)

Use this if you want inserted data to remain after backend restarts.

### 1) Configure PostgreSQL once

Create database and user (adjust values if needed):

```bash
psql postgres
```

```sql
CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres';
ALTER ROLE postgres SUPERUSER CREATEDB CREATEROLE;
CREATE DATABASE hotel_db OWNER postgres;
```

If role/database already exists, PostgreSQL will show an error; that is fine.

### 2) Configure backend DB

Create local config from example:

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-backend/src/main/resources"
cp application-local.properties.example application-local.properties
```

Edit `application-local.properties` with your PostgreSQL username/password/database.

Edit `application-local.properties` with your PostgreSQL username/password/database.

### 3) Start backend

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-backend"
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4) Start frontend (new terminal)

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-frontend"
npm install
npm run dev
```

## Data Persistence

- In `demo` profile: data is saved in in-memory H2 and is lost on backend restart.
- In `local` profile: data is saved to PostgreSQL and persists across restarts.

## Backend-Only Flow Health Check

Use this quick checklist after startup:

1. Login as `admin`.
2. Create reservation in Booking.
3. Search reservation in Reservation Check-in.
4. Convert reservation to check-in and note token.
5. Add catering item for that token.
6. Run billing checkout for same token.
7. Confirm data after restart (local profile only):
   - stop backend
   - start backend again with `local` profile
   - verify reservation/check-in/bill still exists

## Current Project Status

- Frontend is strict backend-only (no mock fallback).
- Core flows verified: login, reservation, lookup, check-in, catering, checkout.
