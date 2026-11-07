# AURA System Architecture & Design Diagrams

This document contains the complete technical design and architectural diagrams for **AURA — AI-Powered Smart Wardrobe & Outfit Stylist**.

---

## 1. Mind Map Diagram (System Architecture & Modules)

```mermaid
flowchart LR
    Root["AURA Smart Wardrobe"]

    %% Core Branches
    Root --> M1["User Management & Auth"]
    Root --> M2["Digital Wardrobe Catalog"]
    Root --> M3["Live Weather Intelligence"]
    Root --> M4["AI Stylist Engine (Gemini 3 Flash)"]
    Root --> M5["Outfit Planner & Calendar"]
    Root --> M6["Analytics & Insights"]

    %% Auth Details
    M1 --> M1A["JWT Bearer Authentication"]
    M1 --> M1B["Bcrypt Password Hashing"]
    M1 --> M1C["User Onboarding & Preferences"]
    M1 --> M1D["1-Click Demo Login"]

    %% Wardrobe Details
    M2 --> M2A["6 Categories (Tops, Bottoms, Dresses, etc.)"]
    M2 --> M2B["Multi-Attribute Tagging (Color, Warmth, Formality)"]
    M2 --> M2C["Image Upload & Processing"]
    M2 --> M2D["Multi-Filter Search & Browse"]

    %% Weather Details
    M3 --> M3A["Open-Meteo Geocoding & Forecast"]
    M3 --> M3B["Temperature Classification (Cold to Hot)"]
    M3 --> M3C["Manual Temperature Override"]

    %% AI Stylist Details
    M4 --> M4A["Occasion Selection (8 Occasions)"]
    M4 --> M4B["Hero Anchor Item Picker"]
    M4 --> M4C["Strict SQLite Wardrobe Validation"]
    M4 --> M4D["Feedback Loop (Like, Dislike, Save, Worn)"]

    %% Planner Details
    M5 --> M5A["7-Day Monday-Sunday Weekly Grid"]
    M5 --> M5B["Duplicate Schedule Prevention"]
    M5 --> M5C["Custom Day Notes"]
    M5 --> M5D["Direct 'Mark as Worn' Action"]

    %% Analytics Details
    M6 --> M6A["Wardrobe Utilization Rate (%)"]
    M6 --> M6B["Category Distribution Breakdown"]
    M6 --> M6C["Most-Worn Items Ranking"]
    M6 --> M6D["Forgotten Gems (Zero-Wear) Spotlight"]
```

---

## 2. System Flowchart (Outfit Recommendation & Feedback Pipeline)

```mermaid
flowchart TD
    Start([User Requests Outfit]) --> CheckAuth{Authenticated?}
    CheckAuth -- No --> RedirectLogin[Redirect to Landing / Login]
    CheckAuth -- Yes --> SelectParams[User Selects Occasion, City & Optional Anchor Item]

    SelectParams --> FetchWeather[Fetch Live Weather from Open-Meteo API]
    FetchWeather --> ValidateWardrobe{Wardrobe Valid?<br/>Top+Bottom OR Dress}
    
    ValidateWardrobe -- No --> Return400[Return 400 Bad Request: Insufficient Wardrobe]
    ValidateWardrobe -- Yes --> BuildContext[Build Compact Prompt Context from Owned SQLite Items & Recent Feedback]

    BuildContext --> CallGemini[Invoke Google Gemini 3 Flash with Structured JSON Schema]
    CallGemini --> ParseJSON{Valid JSON Response?}

    ParseJSON -- No / Timeout --> RetryFallback[Retry with Fallback Model / Return 503]
    ParseJSON -- Yes --> StrictValidation{Backend Validation:<br/>1. Owned IDs only?<br/>2. Anchor item present?<br/>3. Category structure valid?}

    StrictValidation -- Fails --> RejectInvented[Reject Invalid Items / Drop Outfit]
    StrictValidation -- Passes --> PersistOutfit[(Persist Outfits to SQLite)]

    PersistOutfit --> ReturnOutfits[Return Trusted Outfits to Frontend]
    ReturnOutfits --> UserFeedback{User Action}

    UserFeedback -->|Like / Dislike| UpdateFeedback[(Update feedback table - mutually exclusive)]
    UserFeedback -->|Save / Unsave| ToggleSave[(Update save record in feedback table)]
    UserFeedback -->|I Wore This| UpdateWear[(Increment times_worn + update last_worn date)]
    UserFeedback -->|Plan Outfit| AddToPlanner[(Schedule on Calendar date)]
```

---

## 3. Use Case Diagram

```mermaid
flowchart LR
    User((User / Stylist))
    GeminiSys((Google Gemini 3 Flash))
    WeatherSys((Open-Meteo API))

    subgraph AuthModule ["Authentication & Account"]
        UC1(["Register / 1-Click Demo Login"])
        UC2(["Manage Style Preferences & City"])
        UC3(["Change Password / Delete Account"])
    end

    subgraph WardrobeModule ["Wardrobe Catalog"]
        UC4(["Add / Edit Clothing Items"])
        UC5(["Upload Garment Photos"])
        UC6(["Filter & Browse Wardrobe"])
        UC7(["View Garment Wear History"])
    end

    subgraph StylistModule ["AI Stylist & Outfits"]
        UC8(["Select Occasion & Anchor Item"])
        UC9(["Fetch Live Weather Forecast"])
        UC10(["Generate Outfits (Zero Invented Clothes)"])
        UC11(["Give Feedback (Like / Dislike / Save)"])
        UC12(["Mark Outfit as Worn"])
    end

    subgraph PlannerModule ["Planner & Insights"]
        UC13(["Schedule Outfit on Calendar"])
        UC14(["View Weekly Look Schedule"])
        UC15(["View Wardrobe Utilization & Analytics"])
        UC16(["Style Forgotten Gems"])
    end

    %% User Connections
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15
    User --> UC16

    %% External System Connections
    UC9 --> WeatherSys
    UC10 --> GeminiSys
```

---

## 4. Data Flow Diagrams (DFD)

### Level 0: Context Diagram

```mermaid
flowchart LR
    User["User (Web Browser)"]
    AURA["AURA System (FastAPI + React)"]
    WeatherAPI["Open-Meteo API"]
    GeminiAPI["Google Gemini 3 Flash API"]
    SQLiteDB[("SQLite Database")]

    User -->|Credentials, Wardrobe Items, Occasions, Feedback, Schedules| AURA
    AURA -->|Rendered UI, Outfits, Analytics, Forecasts| User

    AURA -->|City Geocoding & Forecast Query| WeatherAPI
    WeatherAPI -->|Temperature, Condition, Rain Probability| AURA

    AURA -->|Wardrobe Catalog Context + Occasion Prompt| GeminiAPI
    GeminiAPI -->|Structured Outfit JSON Recommendations| AURA

    AURA -->|Read / Write SQL Transactions| SQLiteDB
    SQLiteDB -->|User, Wardrobe, Outfit, Feedback, Planner Records| AURA
```

### Level 1: Decomposition Diagram

```mermaid
flowchart TD
    User["User"]

    %% Processes
    P1["1.0 Auth & Profile Manager"]
    P2["2.0 Wardrobe Inventory Manager"]
    P3["3.0 Weather Service Adapter"]
    P4["4.0 Gemini Outfit Generator"]
    P5["5.0 Feedback & Wear Tracker"]
    P6["6.0 Calendar Planner Service"]
    P7["7.0 Wardrobe Analytics Engine"]

    %% Data Stores
    D1[("D1: users")]
    D2[("D2: preferences")]
    D3[("D3: clothing_items")]
    D4[("D4: outfits & outfit_items")]
    D5[("D5: feedback")]
    D6[("D6: planned_outfits")]

    %% External APIs
    ExtWeather["Open-Meteo API"]
    ExtGemini["Google Gemini 3 Flash"]

    %% Process 1: Auth
    User -->|Register / Login Credentials| P1
    P1 -->|Read / Write User| D1
    P1 -->|Read / Write Preferences| D2
    P1 -->|JWT Token| User

    %% Process 2: Wardrobe
    User -->|Garment Metadata & Photos| P2
    P2 -->|CRUD Clothing Items| D3
    D3 -->|Wardrobe Item List| P2
    P2 -->|Filtered Catalog View| User

    %% Process 3: Weather
    P1 -.->|User Home City| P3
    P3 -->|Query Geocoding / Weather| ExtWeather
    ExtWeather -->|Current Temp & Condition| P3
    P3 -->|Weather Context| P4

    %% Process 4: Outfit Recommendation
    User -->|Occasion & Anchor Item| P4
    D3 -->|Owned Clothing Items| P4
    D5 -->|Recent Feedback History| P4
    P4 -->|Prompt with Owned Items JSON| ExtGemini
    ExtGemini -->|Structured Recommendation JSON| P4
    P4 -->|Strict ID Validation & Save| D4
    D4 -->|Verified Outfits| User

    %% Process 5: Feedback & Wear
    User -->|Like / Dislike / Save / Worn Action| P5
    P5 -->|Update Actions| D5
    P5 -->|Increment times_worn, set last_worn| D3

    %% Process 6: Planner
    User -->|Schedule Outfit for Date| P6
    P6 -->|Write / Delete Schedule| D6
    D6 -->|Weekly Planned Looks| P6
    P6 -->|Calendar View| User

    %% Process 7: Insights
    D3 -->|Item Counts & Wear Frequencies| P7
    D4 -->|Total Outfits Styled| P7
    D5 -->|Saved & Liked Counts| P7
    P7 -->|Utilization %, Most Worn, Forgotten Gems| User
```

---

## 5. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o| PREFERENCES : "has"
    USERS ||--o{ CLOTHING_ITEMS : "owns"
    USERS ||--o{ OUTFITS : "generates"
    USERS ||--o{ FEEDBACK : "records"
    USERS ||--o{ PLANNED_OUTFITS : "schedules"

    OUTFITS ||--|{ OUTFIT_ITEMS : "contains"
    CLOTHING_ITEMS ||--o{ OUTFIT_ITEMS : "included_in"

    OUTFITS ||--o{ FEEDBACK : "receives"
    OUTFITS ||--o{ PLANNED_OUTFITS : "scheduled_as"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        boolean is_active
        datetime created_at
    }

    PREFERENCES {
        int id PK
        int user_id FK
        json styles
        json favorite_colors
        json avoid_colors
        string city
        boolean onboarding_done
        datetime updated_at
    }

    CLOTHING_ITEMS {
        int id PK
        int user_id FK
        string name
        string category
        string sub_type
        string color_name
        string color_hex
        string secondary_color_hex
        string pattern
        string season
        int formality
        json occasions
        int warmth
        string fabric
        text notes
        string image_path
        int times_worn
        date last_worn
        datetime created_at
        datetime updated_at
    }

    OUTFITS {
        int id PK
        int user_id FK
        string occasion
        string name
        int score
        text reason
        datetime created_at
    }

    OUTFIT_ITEMS {
        int outfit_id PK, FK
        int item_id PK, FK
    }

    FEEDBACK {
        int id PK
        int user_id FK
        int outfit_id FK
        string action
        datetime created_at
    }

    PLANNED_OUTFITS {
        int id PK
        int user_id FK
        int outfit_id FK
        date planned_date
        text notes
        datetime created_at
    }
```

---

## 6. Activity Diagram (Outfit Recommendation & Wear Cycle)

```mermaid
flowchart TD
    Start([User Navigates to AI Stylist]) --> Step1[Select Occasion: casual, office, formal, etc.]
    Step1 --> Step2[Check Live Weather or Apply Manual Override]
    Step2 --> Step3{Select Anchor Piece?}

    Step3 -- Yes --> Step3A[Pick specific wardrobe item as Anchor] --> Step4[Click Generate Outfits]
    Step3 -- No --> Step4

    Step4 --> Step5[FastAPI builds structured prompt with owned clothes only]
    Step5 --> Step6[Google Gemini 3 Flash returns structured JSON recommendations]
    Step6 --> Step7{Backend ID Validation Passes?}

    Step7 -- No --> Step7A[Filter out unowned / hallucinated IDs]
    Step7A --> Step7B{Are valid outfits remaining?}
    Step7B -- No --> Step7C[Return Error / Trigger safe retry]
    Step7B -- Yes --> Step8[Save verified outfits to SQLite]
    Step7 -- Yes --> Step8

    Step8 --> Step9[Display Outfit Cards with real clothing collages & scores]
    Step9 --> ActionChoice{User Evaluates Outfit}

    ActionChoice -->|Save Outfit| ActSave[Add bookmark to Saved Outfits]
    ActionChoice -->|Like / Dislike| ActVote[Update feedback state for future recommendations]
    ActionChoice -->|Schedule Outfit| ActPlan[Add to Weekly Calendar with note]
    ActionChoice -->|Mark as Worn| ActWorn[Trigger wear tracking: times_worn +1, last_worn = today]

    ActSave --> End([Flow Complete])
    ActVote --> End
    ActPlan --> End
    ActWorn --> End
```

---

## 7. Sequence Diagram (End-to-End Recommendation Call)

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant Weather as Open-Meteo API
    participant DB as SQLite (wardrobe.db)
    participant Gemini as Google Gemini 3 Flash

    User->>UI: Select Occasion ("office") & click "Generate Outfits"
    UI->>API: POST /api/v1/outfits/suggest (JWT, occasion="office", city="Mumbai")
    
    API->>API: Verify JWT token & identify user_id
    API->>Weather: GET /v1/forecast (lat, lon for Mumbai)
    Weather-->>API: Return weather data (temp=24.5°C, condition="Sunny")
    
    API->>DB: Query user's owned clothing_items
    DB-->>API: Return 26 clothing items
    
    API->>DB: Query recent feedback history (liked/disliked tags)
    DB-->>API: Return recent feedback summary
    
    API->>API: Check preconditions (>=1 top + >=1 bottom OR >=1 dress)
    API->>API: Assemble compact JSON prompt with owned item IDs & weather
    
    API->>Gemini: client.models.generate_content(prompt, GeminiStructuredResponse)
    Note over API,Gemini: Executed via asyncio.to_thread (non-blocking)
    Gemini-->>API: Return structured JSON {recommendations: [{name, item_ids, reason, match_score}]}
    
    API->>API: Strictly validate all item_ids exist in user's owned clothing
    API->>API: Verify anchor item presence & (top+bottom/dress) structure
    
    API->>DB: INSERT INTO outfits & outfit_items (trusted combinations)
    DB-->>API: Outfits saved successfully
    
    API-->>UI: HTTP 200 OK with weather summary & trusted OutfitOut list
    UI-->>User: Render Outfit Cards with actual wardrobe photos, scores & action buttons
```

---

## 8. Class Diagram (Backend Architecture)

```mermaid
classDiagram
    %% Models
    class User {
        +int id
        +string name
        +string email
        +string password_hash
        +string role
        +boolean is_active
        +datetime created_at
    }

    class Preference {
        +int id
        +int user_id
        +List~string~ styles
        +List~string~ favorite_colors
        +List~string~ avoid_colors
        +string city
        +boolean onboarding_done
    }

    class ClothingItem {
        +int id
        +int user_id
        +string name
        +string category
        +string sub_type
        +string color_name
        +string color_hex
        +string season
        +int formality
        +int warmth
        +int times_worn
        +date last_worn
    }

    class Outfit {
        +int id
        +int user_id
        +string occasion
        +string name
        +int score
        +string reason
        +datetime created_at
    }

    class Feedback {
        +int id
        +int user_id
        +int outfit_id
        +string action
        +datetime created_at
    }

    class PlannedOutfit {
        +int id
        +int user_id
        +int outfit_id
        +date planned_date
        +string notes
        +datetime created_at
    }

    %% Services
    class GeminiService {
        +generate_recommendations(user_items, occasion, weather, anchor_id, feedback_summary) GeminiStructuredResponse
    }

    class OutfitService {
        +check_wardrobe_preconditions(items)
        +validate_single_recommendation(rec, user_items_map, anchor_id)
        +save_outfit(user_id, rec, user_items_map, db) OutfitOut
        +record_feedback(user_id, outfit_id, action, db) OutfitOut
        +to_outfit_out(outfit, user_id, db) OutfitOut
    }

    class WeatherService {
        +get_weather(city) WeatherOut
        +classify_temperature(temp_c) string
    }

    class InsightService {
        +get_summary(user_id, db) InsightsSummaryOut
    }

    %% Relationships
    User "1" --> "1" Preference : has
    User "1" --> "*" ClothingItem : owns
    User "1" --> "*" Outfit : generates
    User "1" --> "*" Feedback : submits
    User "1" --> "*" PlannedOutfit : plans
    Outfit "*" o-- "*" ClothingItem : outfit_items
    Outfit "1" --> "*" Feedback : evaluated_by
    Outfit "1" --> "*" PlannedOutfit : scheduled_in

    OutfitService ..> GeminiService : uses
    OutfitService ..> WeatherService : uses
    OutfitService ..> Outfit : orchestrates
    InsightService ..> ClothingItem : analyzes
```

---

## 9. State Diagram (Clothing Item & Outfit Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> Uncataloged : Physical Garment Owned

    state "Clothing Item Lifecycle" as ItemLife {
        Uncataloged --> Cataloged : Upload / Add to Wardrobe
        Cataloged --> NeverWorn : times_worn = 0 (Forgotten Gem)
        NeverWorn --> SelectedAsAnchor : Chosen as Hero Piece in Stylist
        SelectedAsAnchor --> InRecommendation : Included in Generated Look
        InRecommendation --> ActiveInWardrobe : Worn Event Triggered
        ActiveInWardrobe --> FrequentlyWorn : times_worn >= 3
        ActiveInWardrobe --> ArchivedOrDeleted : Deleted from Wardrobe
    }

    state "Outfit Recommendation Lifecycle" as OutfitLife {
        [*] --> PromptGeneration : User selects occasion & weather
        PromptGeneration --> AIFormulation : Gemini creates combination
        AIFormulation --> BackendValidation : Schema & ID verification
        BackendValidation --> SavedInHistory : Persisted to SQLite
        
        SavedInHistory --> Liked : Thumbs Up feedback
        SavedInHistory --> Disliked : Thumbs Down feedback
        SavedInHistory --> Bookmarked : Saved to Wardrobe Collection
        
        Bookmarked --> ScheduledOnCalendar : Planned for a Date
        Liked --> ScheduledOnCalendar
        SavedInHistory --> ScheduledOnCalendar
        
        ScheduledOnCalendar --> MarkedAsWorn : "I Wore This" clicked
        MarkedAsWorn --> [*] : times_worn updated on all items
    }
```
