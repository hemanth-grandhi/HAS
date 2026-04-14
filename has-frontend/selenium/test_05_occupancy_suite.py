from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_occupancy_analysis_controls_and_table(logged_in):
    driver, wait = logged_in

    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Occupancy Analysis"))).click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Occupancy Analysis']")))

    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Bar']"))).click()
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Line']"))).click()

    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(.,'Daily Details')]")))
    wait.until(EC.visibility_of_element_located((By.XPATH, "//table")))
