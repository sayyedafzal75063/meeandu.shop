from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ADMIN_HASH = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()) if ADMIN_PASSWORD else None

app = FastAPI()
api_router = APIRouter(prefix="/api")


class Size(BaseModel):
    label: str
    price: float


class Notes(BaseModel):
    top: Optional[str] = None
    heart: Optional[str] = None
    base: Optional[str] = None


class ProductIn(BaseModel):
    name: str
    description: str = ""
    category: str = "Attar"
    sizes: List[Size] = []
    image: str = ""
    in_stock: bool = True
    featured: bool = False
    notes: Optional[Notes] = None


class OfferIn(BaseModel):
    name: str
    price: float
    product_ids: List[str] = []
    image: str = ""
    active: bool = True


class WhatsAppNumberIn(BaseModel):
    label: str = ""
    number: str
    primary: bool = False


class ContactIn(BaseModel):
    name: str
    email: str
    phone: str = ""
    address: str = ""
    message: str


class LoginIn(BaseModel):
    password: str


def clean(doc):
    doc.pop("_id", None)
    return doc


def make_token():
    payload = {"role": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid token")
    return True


# ---------- Auth ----------

@api_router.post("/admin/login")
async def admin_login(body: LoginIn):
    if not ADMIN_HASH or not bcrypt.checkpw(body.password.encode("utf-8"), ADMIN_HASH):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"token": make_token()}


@api_router.get("/admin/verify")
async def admin_verify(_=Depends(require_admin)):
    return {"ok": True}


# ---------- Products ----------

@api_router.get("/products")
async def list_products(category: Optional[str] = None):
    query = {}
    if category in ("Attar", "Perfume"):
        query["category"] = category
    items = await db.products.find(query).sort("created_at", 1).to_list(1000)
    return [clean(i) for i in items]


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return clean(doc)


@api_router.post("/products", status_code=201)
async def create_product(body: ProductIn, _=Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    return clean(doc)


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductIn, _=Depends(require_admin)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = body.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": doc})
    updated = await db.products.find_one({"id": product_id})
    return clean(updated)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _=Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ---------- Offers ----------

@api_router.get("/offers")
async def list_active_offers():
    items = await db.offers.find({"active": True}).sort("created_at", 1).to_list(100)
    return [clean(i) for i in items]


@api_router.get("/admin/offers")
async def list_all_offers(_=Depends(require_admin)):
    items = await db.offers.find({}).sort("created_at", 1).to_list(100)
    return [clean(i) for i in items]


@api_router.post("/offers", status_code=201)
async def create_offer(body: OfferIn, _=Depends(require_admin)):
    if len(body.product_ids) < 2:
        raise HTTPException(status_code=400, detail="A combo needs at least 2 products")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.offers.insert_one(doc)
    return clean(doc)


@api_router.put("/offers/{offer_id}")
async def update_offer(offer_id: str, body: OfferIn, _=Depends(require_admin)):
    existing = await db.offers.find_one({"id": offer_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Offer not found")
    await db.offers.update_one({"id": offer_id}, {"$set": body.model_dump()})
    updated = await db.offers.find_one({"id": offer_id})
    return clean(updated)


@api_router.delete("/offers/{offer_id}")
async def delete_offer(offer_id: str, _=Depends(require_admin)):
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"ok": True}


# ---------- Settings (WhatsApp numbers) ----------

@api_router.get("/settings/whatsapp")
async def get_whatsapp_numbers():
    doc = await db.settings.find_one({"key": "whatsapp_numbers"})
    numbers = doc["value"] if doc else []
    return {"numbers": numbers}


@api_router.put("/settings/whatsapp")
async def put_whatsapp_numbers(numbers: List[WhatsAppNumberIn], _=Depends(require_admin)):
    if not numbers:
        raise HTTPException(status_code=400, detail="At least one number is required")
    value = [n.model_dump() for n in numbers]
    for n in value:
        n["id"] = n.get("id") or str(uuid.uuid4())
    if not any(n["primary"] for n in value):
        value[0]["primary"] = True
    await db.settings.update_one(
        {"key": "whatsapp_numbers"},
        {"$set": {"key": "whatsapp_numbers", "value": value}},
        upsert=True,
    )
    return {"numbers": value}


# ---------- Contact ----------

@api_router.post("/contact", status_code=201)
async def create_contact(body: ContactIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"id": doc["id"], "status": "stored"}


@api_router.get("/contact")
async def list_contacts(_=Depends(require_admin)):
    items = await db.contacts.find({}).sort("created_at", -1).to_list(500)
    return [clean(i) for i in items]


# ---------- Health ----------

@api_router.get("/")
async def root():
    return {"message": "Mee & U API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


SEED_PRODUCTS = [
    {
        "name": "Oud Royale",
        "category": "Attar",
        "description": "A deep, resinous oud attar — warm, smoky, and unforgettable. The crown of our attar collection.",
        "sizes": [{"label": "6ml", "price": 450}],
        "notes": {"top": "Saffron, Bergamot", "heart": "Rose, Cedar", "base": "Oud, Amber, Musk"},
        "image": "/products/oud-royale.png",
        "featured": True,
        "in_stock": True,
    },
    {
        "name": "Musk Al Ameer",
        "category": "Attar",
        "description": "A regal white musk attar — soft, luminous, and second-skin. Everyone's favourite everyday attar.",
        "sizes": [{"label": "6ml", "price": 400}],
        "notes": {"top": "White Musk, Lily", "heart": "Sandalwood, Iris", "base": "Amber, Vanilla"},
        "image": "/products/musk-al-ameer.png",
        "featured": True,
        "in_stock": True,
    },
    {
        "name": "Midnight Bloom",
        "category": "Perfume",
        "description": "A bold nocturnal EDP — jasmine, black orchid, and vanilla wrapped in soft amber. For the confident.",
        "sizes": [{"label": "50ml EDP", "price": 1200}],
        "notes": {"top": "Black Plum, Bergamot", "heart": "Jasmine, Black Orchid", "base": "Vanilla, Soft Amber"},
        "image": "/products/midnight-bloom.png",
        "featured": True,
        "in_stock": True,
    },
    {
        "name": "Ocean Breeze",
        "category": "Perfume",
        "description": "A crisp, refreshing EDP — sea salt, citrus, and driftwood. Light, uplifting, made for the day.",
        "sizes": [{"label": "50ml EDP", "price": 1100}],
        "notes": {"top": "Sea Salt, Citrus", "heart": "Driftwood, Sage", "base": "Musk, Cedarwood"},
        "image": "/products/ocean-breeze.png",
        "featured": True,
        "in_stock": True,
    },
]

SEED_WHATSAPP = [
    {"id": str(uuid.uuid4()), "label": "Founder 1 (Afzal)", "number": "917506380114", "primary": True},
    {"id": str(uuid.uuid4()), "label": "Founder 2 (Partner)", "number": "919702554117", "primary": False},
]


@app.on_event("startup")
async def seed_database():
    if await db.products.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = []
        for p in SEED_PRODUCTS:
            doc = dict(p)
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = now
            docs.append(doc)
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))
    existing = await db.settings.find_one({"key": "whatsapp_numbers"})
    if not existing:
        await db.settings.insert_one({"key": "whatsapp_numbers", "value": SEED_WHATSAPP})
        logger.info("Seeded WhatsApp numbers")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
