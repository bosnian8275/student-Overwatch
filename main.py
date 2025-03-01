from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

def load_experiment_data():
    """Load and process data.csv (Experiment Performance)"""
    try:
        df = pd.read_csv('data.csv')

        # Ensure required columns exist
        required_columns = {'Student', 'Experiment', 'Class', 'Attempts', 'Success', 'Completion_Time'}
        if not required_columns.issubset(df.columns):
            raise ValueError("Missing required columns in data.csv")

        df['Failures'] = df['Attempts'] - df['Success']
        df['Success_Rate'] = (df['Success'] / df['Attempts']).fillna(0) * 100  # Convert to percentage

        return df
    except (pd.errors.ParserError, ValueError) as e:
        print(f"Error loading experiment data: {e}")
        return None

def load_exam_data():
    """Load and process student_performance.csv (Exam Performance)"""
    try:
        df = pd.read_csv('student_performance.csv')

        # Ensure required columns exist
        required_columns = {'Class', 'Student', 'ExamSubject', 'ExamScore', 'id', 'username', 'timespent', 'warns', 'search_out', 'blocks'}
        if not required_columns.issubset(df.columns):
            raise ValueError("Missing required columns in student_performance.csv")

        df['timespent'] = df['timespent'].fillna(0)  # Fill missing values

        return df
    except (pd.errors.ParserError, ValueError) as e:
        print(f"Error loading exam data: {e}")
        return None

def load_assignments_data():
    """Load and process assignments.csv (Assignments Data)"""
    try:
        df = pd.read_csv('assignments.csv')

        # Ensure required columns exist
        required_columns = {'Class', 'Student', 'Assignment', 'Score'}
        if not required_columns.issubset(df.columns):
            raise ValueError("Missing required columns in assignments.csv")

        return df
    except (pd.errors.ParserError, ValueError) as e:
        print(f"Error loading assignments data: {e}")
        return None

@app.route('/')
def index():
    selected_class = request.args.get('class', 'Class A')  # Default to Class A

    # Load data
    experiment_df = load_experiment_data()
    exam_df = load_exam_data()
    assignments_df = load_assignments_data()  # Load assignments data

    if experiment_df is None or exam_df is None or assignments_df is None:
        return "Error loading student data. Please check CSV files.", 500

    # Filter by Class
    exp_class_df = experiment_df[experiment_df['Class'] == selected_class]
    exam_class_df = exam_df[exam_df['Class'] == selected_class]
    assignments_class_df = assignments_df[assignments_df['Class'] == selected_class]

    # Process Experiment Data
    if not exp_class_df.empty:
        exp_class_df = exp_class_df.copy()  # Avoid modifying a slice
        exp_class_df.loc[:, 'Failures'] = exp_class_df['Attempts'] - exp_class_df['Success']
        exp_class_df.loc[:, 'Success_Rate'] = (exp_class_df['Success'] / exp_class_df['Attempts']).fillna(0) * 100

        rankings = exp_class_df.groupby("Student").agg(
            total_attempts=("Attempts", "sum"),
            failures=("Failures", "sum"),
            success_rate=("Success_Rate", "mean")
        ).reset_index().sort_values("success_rate", ascending=False)

        rankings['success_rate'] = rankings['success_rate'].round(2).astype(str) + '%'

        attempts_data = {
            "labels": exp_class_df["Experiment"].tolist(),
            "values": exp_class_df["Attempts"].tolist()
        }

        ranking_data = {
            "labels": rankings["Student"].tolist(),
            "values": rankings["failures"].tolist()
        }
    else:
        attempts_data = ranking_data = rankings = {}

    # Process Exam Data
    if not exam_class_df.empty:
        exam_data = {
            "labels": exam_class_df["Student"].tolist(),
            "values": exam_class_df["timespent"].tolist()
        }
        warns_blocks_data = exam_class_df[["Student", "warns", "blocks"]].to_dict(orient='records')
    else:
        exam_data = {}
        warns_blocks_data = []

    # Prepare assignments data for the template
    assignments = assignments_class_df.to_dict(orient='records')

    return render_template(
        'dashboard.html',
        rankings=rankings.to_dict(orient="records") if not isinstance(rankings, dict) else [],
        attempts_data=attempts_data,
        ranking_data=ranking_data,
        exam_data=exam_data,
        warns_blocks_data=warns_blocks_data,
        assignments=assignments,
        selected_class=selected_class
    )

if __name__ == '__main__':
    app.run(debug=True)
