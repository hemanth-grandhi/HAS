# Selenium Suites (5)

This folder contains 5 quick Selenium suites for the current HAS frontend:

1. `test_01_auth_suite.py` - login screen and admin login
2. `test_02_navigation_suite.py` - sidebar route coverage
3. `test_03_room_management_suite.py` - room search behavior
4. `test_04_booking_suite.py` - booking workflow up to payment step
5. `test_05_occupancy_suite.py` - occupancy controls and table render

## Run

1. Start backend (`demo` profile) and frontend:

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-backend"
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-frontend"
npm install
npm run dev
```

2. Run suites:

```bash
cd "/Users/saranmacbook/Desktop/HAS-1/has-frontend/selenium"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

Optional environment variables:

- `SELENIUM_BASE_URL` (default `http://localhost:5173`)
- `SELENIUM_USER` (default `admin`)
- `SELENIUM_PASSWORD` (default `admin123`)
- `SELENIUM_HEADLESS` (`true` by default)
