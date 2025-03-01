import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
import os

# Load data from input CSV file
def load_data(file_path):
    if not os.path.exists(file_path):
        print("Error: File not found. Please check the path and try again.")
        return None
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

# Analyze student performance
def analyze_performance(df):
    if df is None:
        print("No data to analyze.")
        return None
    
    # Calculate Success Rate per Student
    df['Success_Rate'] = df['Success'] / df['Attempts']
    
    # Descriptive Statistics
    print("Descriptive Statistics:")
    print(df[['Completion_Time', 'Attempts', 'Success_Rate']].describe())
    
    # Outlier Detection (Using IQR Method)
    Q1 = df['Completion_Time'].quantile(0.25)
    Q3 = df['Completion_Time'].quantile(0.75)
    IQR = Q3 - Q1
    outliers = df[(df['Completion_Time'] < (Q1 - 1.5 * IQR)) | (df['Completion_Time'] > (Q3 + 1.5 * IQR))]
    print("\nOutliers in Completion Time:")
    print(outliers)
    
    # Correlation Analysis
    correlation_matrix = df[['Completion_Time', 'Attempts', 'Success_Rate']].corr()
    print("\nCorrelation Matrix:")
    print(correlation_matrix)
    
    # Clustering Students Based on Performance
    X = df[['Completion_Time', 'Attempts', 'Success_Rate']]
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['Cluster'] = kmeans.fit_predict(X)
    
    # Visualization
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    sns.histplot(df['Completion_Time'], bins=10, kde=True)
    plt.title('Completion Time Distribution')
    
    plt.subplot(1, 2, 2)
    sns.boxplot(x=df['Attempts'])
    plt.title('Attempts Distribution')
    
    plt.show()
    
    # Scatter Plot of Clusters
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=df['Completion_Time'], y=df['Success_Rate'], hue=df['Cluster'], palette='viridis')
    plt.title('Student Clusters Based on Performance')
    plt.xlabel('Completion Time')
    plt.ylabel('Success Rate')
    plt.show()
    
    return df

# Main execution
def main():
    file_path = input("Enter the path to the student performance data file: ")
    df = load_data(file_path)
    if df is not None:
        analyze_performance(df)

if __name__ == "__main__":
    main()
