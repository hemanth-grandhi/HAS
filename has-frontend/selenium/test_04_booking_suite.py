from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def _input_by_label(wait, label):
    return wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//label[normalize-space()='{label}']/following-sibling::input[1]")
        )
    )


def test_booking_form_accepts_required_inputs(logged_in, sample_upload_file):
    driver, wait = logged_in

    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Reservations"))).click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Stay Booking']")))

    _input_by_label(wait, "First Name").send_keys("Selenium")
    _input_by_label(wait, "Last Name").send_keys("Tester")

    contact_input = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//label[normalize-space()='Contact Number']/following::input[@type='tel'][1]")
        )
    )
    contact_input.send_keys("9876543210")

    file_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='file']")))
    file_input.send_keys(sample_upload_file)

    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "(//button[.//div[contains(normalize-space(),'Room ')]])[1]")
        )
    ).click()

    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(.,'Booking Summary')]")))
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(.,'Send Booking Request')]")))
