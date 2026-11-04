"""
AURA Database Seeding Script
Creates a demo user (demo@wardrobe.com) and ~25 diverse clothing items across all categories,
colors, patterns, warmth levels, and occasions.
Strictly adheres to 05_BACKEND.txt and 08_SCHEMA.txt.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path so app modules import properly
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.preference import Preference
from app.models.clothing import ClothingItem
from app.utils.security import hash_password

DEMO_USER_EMAIL = "demo@wardrobe.com"
DEMO_USER_PASSWORD = "demo12345"
DEMO_USER_NAME = "Demo Stylist"

SAMPLE_ITEMS = [
    # TOPS
    {
        "name": "Classic White Oxford Shirt",
        "category": "top",
        "sub_type": "shirt",
        "color_name": "White",
        "color_hex": "#FFFFFF",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 2,
        "occasions": ["office", "formal", "date"],
        "fabric": "100% Cotton",
        "notes": "Crisp button-down shirt suitable for smart casual and business wear.",
    },
    {
        "name": "Navy Blue Polo T-Shirt",
        "category": "top",
        "sub_type": "polo",
        "color_name": "Navy Blue",
        "color_hex": "#1F2A44",
        "pattern": "solid",
        "season": "all",
        "formality": 2,
        "warmth": 2,
        "occasions": ["casual", "travel", "sports"],
        "fabric": "Pique Cotton",
        "notes": "Breathable collared polo for relaxed weekend and travel styling.",
    },
    {
        "name": "Heather Grey Pullover Hoodie",
        "category": "top",
        "sub_type": "hoodie",
        "color_name": "Grey",
        "color_hex": "#808080",
        "pattern": "solid",
        "season": "winter",
        "formality": 1,
        "warmth": 4,
        "occasions": ["casual", "travel"],
        "fabric": "Fleece Cotton",
        "notes": "Cozy winter streetwear staple.",
    },
    {
        "name": "Black Crewneck T-Shirt",
        "category": "top",
        "sub_type": "tshirt",
        "color_name": "Black",
        "color_hex": "#000000",
        "pattern": "solid",
        "season": "all",
        "formality": 1,
        "warmth": 2,
        "occasions": ["casual", "party", "date"],
        "fabric": "Organic Cotton",
        "notes": "Versatile foundational tee for layering.",
    },
    {
        "name": "Yellow Floral Festive Kurta",
        "category": "top",
        "sub_type": "kurta",
        "color_name": "Yellow",
        "color_hex": "#F2C94C",
        "pattern": "printed",
        "season": "all",
        "formality": 3,
        "warmth": 2,
        "occasions": ["festival", "party"],
        "fabric": "Chanderi Silk Blend",
        "notes": "Vibrant traditional kurta with intricate detailing.",
    },
    {
        "name": "Beige Knit Cable Sweater",
        "category": "top",
        "sub_type": "sweater",
        "color_name": "Beige",
        "color_hex": "#D2B48C",
        "pattern": "solid",
        "season": "winter",
        "formality": 3,
        "warmth": 4,
        "occasions": ["casual", "office", "date"],
        "fabric": "Merino Wool",
        "notes": "Warm textured knit sweater for cooler weather.",
    },
    {
        "name": "Lilac Silk Blouse",
        "category": "top",
        "sub_type": "blouse",
        "color_name": "Lavender",
        "color_hex": "#EAE3FF",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 1,
        "occasions": ["office", "date", "formal"],
        "fabric": "Silk Satin",
        "notes": "Elegant flowing blouse with a subtle sheen.",
    },

    # BOTTOMS
    {
        "name": "Navy Tailored Chinos",
        "category": "bottom",
        "sub_type": "chinos",
        "color_name": "Navy Blue",
        "color_hex": "#1F2A44",
        "pattern": "solid",
        "season": "all",
        "formality": 3,
        "warmth": 3,
        "occasions": ["office", "casual", "date"],
        "fabric": "Stretch Cotton Twill",
        "notes": "Smart slim-fit trousers that pair with shirts and tees.",
    },
    {
        "name": "Classic Blue Denim Jeans",
        "category": "bottom",
        "sub_type": "jeans",
        "color_name": "Blue",
        "color_hex": "#3B5B92",
        "pattern": "solid",
        "season": "all",
        "formality": 2,
        "warmth": 2,
        "occasions": ["casual", "travel"],
        "fabric": "Denim",
        "notes": "Straight-fit durable blue denim.",
    },
    {
        "name": "Charcoal Grey Formal Trousers",
        "category": "bottom",
        "sub_type": "trousers",
        "color_name": "Grey",
        "color_hex": "#404040",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 3,
        "occasions": ["office", "formal"],
        "fabric": "Poly-Viscose",
        "notes": "Sharp pleated office dress pants.",
    },
    {
        "name": "Khaki Cargo Shorts",
        "category": "bottom",
        "sub_type": "shorts",
        "color_name": "Beige",
        "color_hex": "#C3B091",
        "pattern": "solid",
        "season": "summer",
        "formality": 1,
        "warmth": 1,
        "occasions": ["casual", "sports", "travel"],
        "fabric": "Cotton Canvas",
        "notes": "Lightweight breathable summer shorts with utility pockets.",
    },
    {
        "name": "Black Slim Joggers",
        "category": "bottom",
        "sub_type": "joggers",
        "color_name": "Black",
        "color_hex": "#000000",
        "pattern": "solid",
        "season": "all",
        "formality": 1,
        "warmth": 2,
        "occasions": ["casual", "sports", "travel"],
        "fabric": "French Terry",
        "notes": "Comfortable athleisure joggers.",
    },

    # DRESSES
    {
        "name": "Emerald Green Formal Midi Dress",
        "category": "dress",
        "sub_type": "formal_dress",
        "color_name": "Green",
        "color_hex": "#278653",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 2,
        "occasions": ["formal", "party", "date"],
        "fabric": "Crepe",
        "notes": "A-line silhouette formal dress with belted waist.",
    },
    {
        "name": "Printed Floral Summer Jumpsuit",
        "category": "dress",
        "sub_type": "jumpsuit",
        "color_name": "Pastel Pink",
        "color_hex": "#FFD1DC",
        "pattern": "printed",
        "season": "summer",
        "formality": 2,
        "warmth": 1,
        "occasions": ["casual", "travel", "party"],
        "fabric": "Rayon",
        "notes": "Breezy jumpsuit with wide legs and floral motifs.",
    },
    {
        "name": "Royal Maroon Embroidered Kurti Set",
        "category": "dress",
        "sub_type": "kurti_set",
        "color_name": "Burgundy",
        "color_hex": "#800020",
        "pattern": "printed",
        "season": "all",
        "formality": 4,
        "warmth": 2,
        "occasions": ["festival", "party"],
        "fabric": "Silk Georgette",
        "notes": "Traditional coordinated 2-piece ethnic outfit.",
    },

    # OUTERWEAR
    {
        "name": "Navy Slim-Fit Blazer",
        "category": "outerwear",
        "sub_type": "blazer",
        "color_name": "Navy Blue",
        "color_hex": "#1F2A44",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 3,
        "occasions": ["office", "formal", "party"],
        "fabric": "Wool Blend",
        "notes": "Versatile blazer for smart business casual and evening occasions.",
    },
    {
        "name": "AURA Purple Denim Jacket",
        "category": "outerwear",
        "sub_type": "jacket",
        "color_name": "Purple",
        "color_hex": "#7355CF",
        "pattern": "solid",
        "season": "all",
        "formality": 2,
        "warmth": 3,
        "occasions": ["casual", "party", "travel"],
        "fabric": "Denim",
        "notes": "Signature purple outer layer making an outfit pop.",
    },
    {
        "name": "Olive Green Windbreaker Raincoat",
        "category": "outerwear",
        "sub_type": "raincoat",
        "color_name": "Olive Green",
        "color_hex": "#556B2F",
        "pattern": "solid",
        "season": "all",
        "formality": 1,
        "warmth": 2,
        "occasions": ["casual", "travel", "sports"],
        "fabric": "Waterproof Nylon",
        "notes": "Lightweight water-resistant jacket for rainy commutes.",
    },
    {
        "name": "Charcoal Overcoat",
        "category": "outerwear",
        "sub_type": "coat",
        "color_name": "Grey",
        "color_hex": "#2B2B2B",
        "pattern": "solid",
        "season": "winter",
        "formality": 5,
        "warmth": 5,
        "occasions": ["formal", "office", "travel"],
        "fabric": "Heavy Wool",
        "notes": "Thick winter overcoat for cold weather styling.",
    },

    # FOOTWEAR
    {
        "name": "Clean White Low-Top Sneakers",
        "category": "footwear",
        "sub_type": "sneakers",
        "color_name": "White",
        "color_hex": "#FFFFFF",
        "pattern": "solid",
        "season": "all",
        "formality": 2,
        "warmth": 2,
        "occasions": ["casual", "travel", "sports"],
        "fabric": "Leather",
        "notes": "Minimalist everyday white leather sneakers.",
    },
    {
        "name": "Black Leather Oxford Shoes",
        "category": "footwear",
        "sub_type": "formal_shoes",
        "color_name": "Black",
        "color_hex": "#000000",
        "pattern": "solid",
        "season": "all",
        "formality": 5,
        "warmth": 2,
        "occasions": ["formal", "office"],
        "fabric": "Full Grain Leather",
        "notes": "Polished black cap-toe formal lace-ups.",
    },
    {
        "name": "Tan Suede Penny Loafers",
        "category": "footwear",
        "sub_type": "loafers",
        "color_name": "Brown",
        "color_hex": "#8B4513",
        "pattern": "solid",
        "season": "summer",
        "formality": 3,
        "warmth": 2,
        "occasions": ["casual", "office", "date"],
        "fabric": "Suede",
        "notes": "Slip-on breathable loafers pairing with chinos or shorts.",
    },
    {
        "name": "Dark Brown Chelsea Boots",
        "category": "footwear",
        "sub_type": "boots",
        "color_name": "Brown",
        "color_hex": "#4A2E18",
        "pattern": "solid",
        "season": "winter",
        "formality": 3,
        "warmth": 4,
        "occasions": ["casual", "date", "travel"],
        "fabric": "Leather",
        "notes": "Elastic-sided ankle boots for winter and smart casual wear.",
    },

    # ACCESSORIES
    {
        "name": "Classic Silver & Leather Watch",
        "category": "accessory",
        "sub_type": "watch",
        "color_name": "Brown",
        "color_hex": "#8B4513",
        "pattern": "solid",
        "season": "all",
        "formality": 4,
        "warmth": 1,
        "occasions": ["office", "formal", "date"],
        "fabric": "Stainless Steel & Leather",
        "notes": "Minimal analog dial watch with brown leather strap.",
    },
    {
        "name": "Reversible Black/Brown Leather Belt",
        "category": "accessory",
        "sub_type": "belt",
        "color_name": "Black",
        "color_hex": "#000000",
        "pattern": "solid",
        "season": "all",
        "formality": 3,
        "warmth": 1,
        "occasions": ["office", "formal", "casual"],
        "fabric": "Leather",
        "notes": "Essential wardrobe hardware for trousers and chinos.",
    },
    {
        "name": "Polarized Tortoise Sunglasses",
        "category": "accessory",
        "sub_type": "sunglasses",
        "color_name": "Brown",
        "color_hex": "#3A2010",
        "pattern": "printed",
        "season": "summer",
        "formality": 2,
        "warmth": 1,
        "occasions": ["casual", "travel", "party"],
        "fabric": "Acetate",
        "notes": "UV-protective modern wayfarer frames.",
    },
]


def seed_database():
    """Initializes tables and seeds the demo user with sample wardrobe items."""
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if demo user already exists
        user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
        if not user:
            print(f"Creating demo user: {DEMO_USER_EMAIL} ...")
            user = User(
                name=DEMO_USER_NAME,
                email=DEMO_USER_EMAIL,
                password_hash=hash_password(DEMO_USER_PASSWORD),
                role="user",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create default preferences for demo user
            pref = Preference(
                user_id=user.id,
                styles=["casual", "minimal", "streetwear"],
                favorite_colors=["#4B2E9E", "#1F2A44", "#FFFFFF"],
                avoid_colors=["#FF00FF"],
                city="Mumbai",
                onboarding_done=True,
            )
            db.add(pref)
            db.commit()
            print(f"Demo user created with ID #{user.id}")
        else:
            print(f"Demo user {DEMO_USER_EMAIL} already exists (ID #{user.id}).")

        # Check existing items count
        existing_items = db.query(ClothingItem).filter(ClothingItem.user_id == user.id).count()
        if existing_items > 0:
            print(f"Demo user already has {existing_items} wardrobe items. Skipping item insertion.")
            return

        print(f"Seeding {len(SAMPLE_ITEMS)} clothing items across all categories...")
        for item_data in SAMPLE_ITEMS:
            item = ClothingItem(
                user_id=user.id,
                name=item_data["name"],
                category=item_data["category"],
                sub_type=item_data["sub_type"],
                color_name=item_data["color_name"],
                color_hex=item_data["color_hex"],
                secondary_color_hex=item_data.get("secondary_color_hex"),
                pattern=item_data["pattern"],
                season=item_data["season"],
                formality=item_data["formality"],
                occasions=item_data["occasions"],
                warmth=item_data["warmth"],
                fabric=item_data.get("fabric"),
                notes=item_data.get("notes"),
                image_path=None,
                times_worn=0,
                last_worn=None,
            )
            db.add(item)

        db.commit()
        print(f"Successfully seeded {len(SAMPLE_ITEMS)} clothing items for {DEMO_USER_EMAIL}!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
