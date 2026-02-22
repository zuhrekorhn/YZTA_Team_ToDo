from fastapi import APIRouter,Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext #şifre hashlemek için
from jose import jwt, JWTError  # token oluşturmak için
from datetime import datetime, timedelta, timezone #token süresi için
from ..database import SessionLocal #db bağlantısı için
from ..models.user import User
from typing import Annotated #daha temiz kod yazmak için

router = APIRouter(
    prefix = "/auth",
    tags = ["Authentication"]
)

SECRET_KEY = "zo227rvlsmkz9hbvuuj1x5w47z3m2d9tsqmmydvqof84n7i4z92yu9mxvzg4ai2b"
ALGORITHM = "HS256" #şifreleme algoritması

#DB bağlantısı her fonk. ayrı ayrı çağırmamak için
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #şifreleri hashlemek için kullanılan araç
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

#Şema => kullanıcı kayıt olurken göndermek zorunda olduğu bilgiler
class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
#api sonucunda hangi verilerin döneceğini gösterir.fastapi dönen verinin buna uygun olup olmadığını kontrol eder
class Token(BaseModel):
    access_token: str
    token_type: str

#YARDIMCI FONKSİYONLAR (token oluşturma - kullanıcı kontrolü)
def create_access_token(username: str, user_id:int, experies_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    experies = datetime.now(timezone.utc) + experies_delta
    encode.update(({'exp': experies}))
    return jwt.encode(encode, SECRET_KEY, algorithm='HS256')


def authentication_user(username:str, password:str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

#Mevcut kullanıcıyı doğrulama
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        #kullanıcıdan aldığımız tokenı çözüyoruz
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz kimlik bilgileri"
            )

        # Her şey okeyse kullanıcının bilgilerini dönüyoruz
        return {"username": username, "id": user_id}

    except JWTError:
        #Token doğru değilse veya süresi dolmuşsa hata fırlatır
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz veya süresi dolmuş"
        )

#ENDPOINTLER
@router.post("/token", response_model= Token) #giriş yapıp token almak için kullanılır
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependency):
    user = authentication_user(form_data.username, form_data.password,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Kullanıcı adı veya şifre yanlış")
    token= create_access_token(user.username, user.id, timedelta(minutes=60))
    return {"access_token":token,"token_type":"bearer"}

#kayıt işlemi için kullanılır
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    hashed_pass = bcrypt_context.hash(create_user_request.password) #kullanıcıdan aldığı şifreyi hashledi

    new_user = User(
        username = create_user_request.username,
        email = create_user_request.email,
        hashed_password = hashed_pass,#gerçek şifreyi değil hashli olanı yazıyo db ye
        current_streak = 0 #yeni kullanıcıda seri 0 olur
    )

    db.add(new_user)
    db.commit() #db değişkliklerini onaylar(kaydet)
