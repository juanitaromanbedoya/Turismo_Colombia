import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
ODBC_DRIVER = os.getenv("ODBC_DRIVER", "ODBC Driver 17 for SQL Server")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

_database_url_railway = os.getenv("DATABASE_URL")

if _database_url_railway:
    # En Railway, la variable DATABASE_URL de Postgres puede llegar como
    # "postgres://..." (formato antiguo); SQLAlchemy exige "postgresql://"
    DATABASE_URL = _database_url_railway.replace("postgres://", "postgresql://", 1)
else:
    # Desarrollo local, con SQL Server
    DATABASE_URL = (
        f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_DATABASE}"
        f"?driver={ODBC_DRIVER.replace(' ', '+')}&TrustServerCertificate=yes"
    )