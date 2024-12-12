import csv
import os
from pynput.mouse import Listener
import datetime

# Define the directory and CSV file path
csv_directory = 'C:/Users/meena/OneDrive/Desktop/productivity-tracker/csv'  # Directory to store CSV files
csv_file_path = os.path.join(csv_directory, 'mouse_events.csv')

# Function to ensure the CSV file exists with headers
def ensure_csv_file():
    if not os.path.exists(csv_directory):
        os.makedirs(csv_directory)  # Create directory if it doesn't exist
        print(f"Created directory: {csv_directory}")

    if not os.path.isfile(csv_file_path):
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=['Timestamp', 'X', 'Y', 'Button'])
            writer.writeheader()
        print(f"Created CSV file with headers: {csv_file_path}")

# Call the function to ensure CSV file exists
ensure_csv_file()

# Function to execute on mouse clicks
def on_click(x, y, button, pressed):
    if pressed:
        current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        button_str = str(button).replace("'", "")  # Remove quotes from button representation

        # Write the event data to the CSV file
        with open(csv_file_path, mode='a', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=['Timestamp', 'X', 'Y', 'Button'])
            writer.writerow({
                'Timestamp': current_time,
                'X': x,
                'Y': y,
                'Button': button_str
            })
        print(f"Recorded Mouse Click at ({x}, {y}), Button: {button_str}, Time: {current_time}")

# Setup the listener to monitor mouse events
print("Starting mouse listener. Press Ctrl+C to stop.")
with Listener(on_click=on_click) as listener:
    try:
        listener.join()
    except KeyboardInterrupt:
        print("Mouse listener has been stopped manually.")

print("Mouse listener has been stopped.")
