import requests
import csv
import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Replace with your Google Spreadsheet ID
GOOGLE_SHEET_ID = "10wqo8h98eCkdhJbeuCNJSyrEPNmeR_mdBvIAwOklRX8"
GOOGLE_SHEET_URL = f"https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv"

def load_options_from_google_sheet():
    try:
        response = requests.get(GOOGLE_SHEET_URL, verify=False)
        response.raise_for_status()
        options = []
        csv_reader = csv.reader(response.text.splitlines())
        for row in csv_reader:
            if row:  # Skip empty rows
                options.append(row[0])  # Assuming options are in the first column
        return options
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Google Sheets: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/random_option', methods=['GET'])
def random_option():
    options = load_options_from_google_sheet()
    if not options:
        return jsonify({"error": "No options available from the Google Sheet"}), 400

    random_option = random.choice(options)
    return jsonify({"random_option": random_option})

@app.route('/spin', methods=['POST'])
def spin():
    options = load_options_from_google_sheet()
    if not options:
        return jsonify({"error": "No options available from the Google Sheet"}), 400

    chosen_option = random.choice(options)
    chosen_index = options.index(chosen_option)
    return jsonify({"options": options, "chosen": chosen_option, "chosen_index": chosen_index})

if __name__ == '__main__':
    app.run(debug=True)
