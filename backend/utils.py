import datetime
from models import db, Student

def generate_student_id():

    year = datetime.datetime.now().year

    prefix = f"ST-{year}-"
    last_student = Student.query.filter(Student.student_id.like(f"{prefix}%")).order_by(Student.student_id.desc()).first()

    if last_student:
        #extract the last 3 digits
        last_num = int(last_student.student_id.split('-')[-1])
        new_num = last_num + 1
    else:
        #First student of the year
        new_num = 1 

    return f"{prefix}{new_num:03d}"   