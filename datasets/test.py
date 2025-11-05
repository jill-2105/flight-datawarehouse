import pandas as pd

# Load the flight data from a CSV file
df = pd.read_csv('flight_data_2024.csv')

# Display the total number of records and the date range
print(f"Total records: {len(df):,}")
print(f"Date range: {df['fl_date'].min()} to {df['fl_date'].max()}")