import json
import random
import requests
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

temporary_artists = []  # session-scoped, cleared on restart


def load_artists():
    with open("artists.json") as f:
        base = json.load(f)["artists"]
    return base + temporary_artists


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/random_option', methods=['GET'])
def random_option():
    artists = load_artists()
    if not artists:
        return jsonify({"error": "No artists available"}), 400
    artist = random.choice(artists)
    return jsonify({"random_option": artist["label"]})


@app.route('/spin', methods=['POST'])
def spin():
    artists = load_artists()
    if not artists:
        return jsonify({"error": "No artists available"}), 400
    chosen = random.choice(artists)
    chosen_index = artists.index(chosen)
    return jsonify({
        "options": [a["label"] for a in artists],
        "chosen": chosen["label"],
        "chosen_search": chosen["search"],
        "chosen_index": chosen_index
    })


@app.route('/add_artist', methods=['POST'])
def add_artist():
    data = request.get_json()
    label = data.get('label', '').strip()
    search = data.get('search', '').strip()
    if not label:
        return jsonify({"error": "Label required"}), 400
    if not search:
        search = label  # fall back to label as the Deezer search query
    temporary_artists.append({"label": label, "search": search})
    return jsonify({"success": True})


@app.route('/preview')
def preview():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"preview_url": None})
    try:
        resp = requests.get(
            'https://api.deezer.com/search',
            params={'q': query, 'limit': 1},
            timeout=5
        )
        data = resp.json()
        url = data['data'][0]['preview']
        return jsonify({"preview_url": url})
    except Exception:
        return jsonify({"preview_url": None})


if __name__ == '__main__':
    app.run(debug=True)
