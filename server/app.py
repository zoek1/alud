from flask import Flask, request
from flask_mongoengine import MongoEngine
from flask_cors import CORS

import uuid

from models import Chart

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    "db": "alud",
    "host": "db",
    "port": 27017,
    "alias": "default",
}
db = MongoEngine(app)
CORS(app)


@app.route("/charts.json")
def list_charts():
    return list(Chart.objects.all())


@app.route("/charts/<uuid>.json")
def get_chart(uuid):
    chart = Chart.objects(uuid=uuid).get_or_404()

    return chart


@app.route("/charts.json", methods=["POST"])
def save_chart():
    uid = str(uuid.uuid4())
    data = request.get_json()

    chart = Chart(
        address=data['address'],
        config=data['config'],
        story=data['story'],
        chartType=data['chartType'],
        filteredData=data['filteredData'],
        filterQuery=data['filterQuery'],
        query=data['query'],
        uuid=uid
    )

    chart.save()

    return {
        'uuid': str(uid)
    }