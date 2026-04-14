import os
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE_URL = os.getenv("SELENIUM_BASE_URL", "http://localhost:5173")
LOGIN_USER = os.getenv("SELENIUM_USER", "admin")
LOGIN_PASSWORD = os.getenv("SELENIUM_PASSWORD", "admin123")


def _chrome_options() -> Options:
    opts = Options()
    headless = os.getenv("SELENIUM_HEADLESS", "true").lower()
    if headless not in {"false", "0", "no"}:
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,1000")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    return opts


@pytest.fixture()
def driver():
    drv = webdriver.Chrome(options=_chrome_options())
    drv.implicitly_wait(1)
    yield drv
    drv.quit()


@pytest.fixture()
def wait(driver):
    return WebDriverWait(driver, 15)


def _field_by_label(wait, label_text):
    return wait.until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                f"//label[normalize-space()='{label_text}']/following-sibling::input[1]",
            )
        )
    )


def login(driver, wait, username=LOGIN_USER, password=LOGIN_PASSWORD):
    driver.get(BASE_URL)

    _field_by_label(wait, "Username").clear()
    _field_by_label(wait, "Username").send_keys(username)
    _field_by_label(wait, "Password").clear()
    _field_by_label(wait, "Password").send_keys(password)

    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']"))).click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(normalize-space(),'Dashboard')]")))


@pytest.fixture()
def logged_in(driver, wait):
    login(driver, wait)
    return driver, wait


@pytest.fixture(scope="session")
def sample_upload_file():
    path = Path(__file__).resolve().parent / "sample-id-proof.txt"
    if not path.exists():
        path.write_text("sample id proof for selenium upload", encoding="utf-8")
    return str(path)
