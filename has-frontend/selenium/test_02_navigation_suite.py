from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_sidebar_navigation_covers_main_pages(logged_in):
    driver, wait = logged_in

    pages = [
        ("Room Management", "Room Management"),
        ("Reservations", "Stay Booking"),
        ("Billing & Checkout", "Billing & Checkout"),
        ("Tariff Revision", "Tariff Revision"),
        ("Occupancy Analysis", "Occupancy Analysis"),
    ]

    for nav_label, page_title in pages:
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, nav_label))).click()
        wait.until(EC.visibility_of_element_located((By.XPATH, f"//h1[normalize-space()='{page_title}']")))
