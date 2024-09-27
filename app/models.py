from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Form(db.Model):
    __tablename__ = 'forms'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    questions = db.relationship('Question', backref='form', lazy=True)

    def __init__(self, title, description=None):
        self.title = title
        self.description = description

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'questions': [question.serialize() for question in self.questions]
        }

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('forms.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    options = db.Column(db.JSON, nullable=True)

    def __init__(self, form_id, text, question_type, options=None):
        self.form_id = form_id
        self.text = text
        self.question_type = question_type
        self.options = options or []

    def serialize(self):
        return {
            'id': self.id,
            'form_id': self.form_id,
            'text': self.text,
            'question_type': self.question_type,
            'options': self.options
        }
