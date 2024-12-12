import csv
import os
from pynput.keyboard import Key, Listener
import datetime

# Initialize a counter for key presses
count = 0

# Define the directory and CSV file path
csv_directory = 'C:/Users/meena/OneDrive/Desktop/productivity-tracker/csv'  # Directory to store CSV files
csv_file_path = os.path.join(csv_directory, 'keyboard_events.csv')

# Function to ensure the CSV file exists with headers
def ensure_csv_file():
    if not os.path.exists(csv_directory):
        os.makedirs(csv_directory)  # Create directory if it doesn't exist
        print(f"Created directory: {csv_directory}")

    if not os.path.isfile(csv_file_path):
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=['Timestamp', 'Key', 'Total_Count'])
            writer.writeheader()
        print(f"Created CSV file with headers: {csv_file_path}")

# Call the function to ensure CSV file exists
ensure_csv_file()

# This function is called every time a key is pressed.
def on_press(key):
    global count
    count += 1
    current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    key_str = str(key).replace("'", "")  # Remove quotes from key representation

    # Write the event data to the CSV file
    with open(csv_file_path, mode='a', newline='', encoding='utf-8') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=['Timestamp', 'Key', 'Total_Count'])
        writer.writerow({
            'Timestamp': current_time,
            'Key': key_str,
            'Total_Count': count
        })
    print(f"Recorded Key: {key_str}, Total Count: {count}, Time: {current_time}")

    # Stop listener if escape key is pressed
    if key == Key.esc:
        print("Escape key pressed. Stopping keyboard listener.")
        return False

# Setup the listener to monitor keyboard events
print("Starting keyboard listener. Press ESC to stop.")
with Listener(on_press=on_press) as listener:
    listener.join()

print("Keyboard listener has been stopped.")
