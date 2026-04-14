from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from conftest import BASE_URL


def test_login_page_visible(driver, wait):
    driver.get(BASE_URL)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[normalize-space()='System Login']")))
    assert driver.find_element(By.XPATH, "//button[normalize-space()='Login']").is_displayed()


def test_admin_login_success(driver, wait):
    from conftest import login

    login(driver, wait)
    assert driver.find_element(By.XPATH, "//*[contains(normalize-space(),'Signed in as admin')]").is_displayed()
