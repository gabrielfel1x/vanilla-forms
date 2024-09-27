from flask import jsonify, request
from flask_restful import Resource
from models import db, Form, Question

class FormResource(Resource):
    def get(self, id=None):
        if id:
            form = Form.query.get(id)
            if not form:
                return {'message': 'Form not found'}, 404
            return jsonify(form.serialize())
        else:
            forms = Form.query.all()
            return jsonify([form.serialize() for form in forms])

    def post(self):
        data = request.get_json()

        new_form = Form(title=data['title'], description=data.get('description'))
        db.session.add(new_form)
        db.session.commit()

        for question_data in data.get('questions', []):
            question = Question(
                form_id=new_form.id,
                text=question_data['text'],
                question_type=question_data['question_type'],
                options=question_data.get('options')
            )
            db.session.add(question)

        db.session.commit()

        return {'message': 'Form created successfully', 'id': new_form.id}, 201

    def put(self, id):
        form = Form.query.get(id)
        if not form:
            return {'message': 'Form not found'}, 404

        data = request.get_json()

        form.title = data.get('title', form.title)
        form.description = data.get('description', form.description)

        existing_question_ids = [q.id for q in form.questions]

        for question_data in data.get('questions', []):
            if 'id' in question_data and question_data['id'] in existing_question_ids:
                question = Question.query.get(question_data['id'])
                if question:
                    question.text = question_data.get('text', question.text)
                    question.question_type = question_data.get('question_type', question.question_type)
                    question.options = question_data.get('options', question.options)
                else:
                    return {'message': 'Question not found'}, 404
            else:
                new_question = Question(
                    form_id=form.id,
                    text=question_data['text'],
                    question_type=question_data['question_type'],
                    options=question_data.get('options')
                )
                db.session.add(new_question)

        for question in form.questions:
            if question.id not in [q.get('id') for q in data.get('questions', [])]:
                db.session.delete(question)

        db.session.commit()
        return {'message': 'Form updated successfully'}

