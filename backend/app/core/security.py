from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def crear_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verificar_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def crear_token_recuperacion(correo: str) -> str:
    data = {
        "correo": correo,
        "proposito": "recuperar_password",
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verificar_token_recuperacion(token: str) -> str:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    if payload.get("proposito") != "recuperar_password":
        raise ValueError("Token no válido para esta operación")
    return payload.get("correo")