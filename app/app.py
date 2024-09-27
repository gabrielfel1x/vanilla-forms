from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate
from models import db
from resources import FormResource
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:0423@localhost:5432/forms_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)

api.add_resource(FormResource, '/forms', '/forms/<int:id>')

if __name__ == '__main__':
    app.run(debug=True)
