import os
import sys
sys.path.append('backend')
from sqlalchemy import create_engine, text

from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("Error: DATABASE_URL environment variable is not set.")
    sys.exit(1)

engine = create_engine(db_url)
with engine.connect() as conn:
    max_id = conn.scalar(text('SELECT MAX(id) FROM customers'))
    try:
        seq_val = conn.scalar(text("SELECT last_value FROM customers_id_seq"))
        print(f'customers max_id: {max_id}, sequence_value: {seq_val}')
    except Exception as e:
        print(f"Could not read seq directly: {e}")
    
    for table in ['customers', 'companies', 'calls']:
        max_id = conn.scalar(text(f'SELECT MAX(id) FROM {table}'))
        if max_id is not None:
            conn.execute(text(f"SELECT setval('{table}_id_seq', {max_id})"))
            print(f'Updated {table}_id_seq to {max_id}')
            
    conn.commit()
print('Done.')
