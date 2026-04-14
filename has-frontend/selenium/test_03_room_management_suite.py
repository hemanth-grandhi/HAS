from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_room_search_filters_inventory(logged_in):
    driver, wait = logged_in

    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Room Management"))).click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Room Management']")))

    search_box = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//input[contains(@placeholder,'Search 204')]"))
    )
    search_box.clear()
    search_box.send_keys("suite")

    wait.until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//table//tr[contains(.,'Suite') or contains(.,'suite')]",
            )
        )
    )
