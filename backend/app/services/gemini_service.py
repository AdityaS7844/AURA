"""
AURA Gemini Service
Calls the official Google Gen AI SDK from the backend with structured JSON schema output.
Strictly adheres to 00_PROJECT_OVERVIEW.txt, 05_BACKEND.txt, and 06_GEMINI_INTEGRATION.txt.
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from pydantic import ValidationError
from google import genai
from google.genai import types
from app.config import get_settings
from app.schemas.outfit import GeminiStructuredResponse

settings = get_settings()

SYSTEM_INSTRUCTION = (
    "You are AURA, a careful personal wardrobe stylist. Recommend outfits "
    "using ONLY the clothing items provided in the current request. Do not "
    "invent clothing, IDs, brands, image URLs or accessories. Respect the "
    "occasion, weather, style preferences and anchor item. Prefer practical, "
    "wearable combinations. Return only data matching the required JSON "
    "schema. If there are not enough suitable items, return fewer outfits "
    "and explain the limitation."
)


class GeminiService:

    @classmethod
    def get_client(cls) -> genai.Client:
        """Instantiates the official Google Gen AI SDK client."""
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini AI API key is not configured on the backend server.",
            )
        return genai.Client(api_key=settings.GEMINI_API_KEY.strip())

    @classmethod
    def build_context(
        cls,
        occasion: str,
        style: Optional[str],
        weather: Dict[str, Any],
        wardrobe_items: List[Dict[str, Any]],
        count: int,
        anchor_item_id: Optional[int] = None,
        exclude_outfit_ids: Optional[List[int]] = None,
        preferences: Optional[Dict[str, Any]] = None,
        feedback_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Builds a compact context payload containing only the necessary structured fields.
        Excludes private account details, passwords, and sensitive tokens.
        """
        context = {
            "request": {
                "occasion": occasion,
                "style": style or (preferences.get("styles", ["casual"])[0] if preferences and preferences.get("styles") else "casual"),
                "weather": {
                    "city": weather.get("city", "Local"),
                    "temp_c": weather.get("temp_c", 22.0),
                    "class": weather.get("class", "mild"),
                    "condition": weather.get("condition", "Clear sky"),
                    "is_rainy": weather.get("is_rainy", False),
                },
                "count": count,
                "anchor_item_id": anchor_item_id,
                "exclude_outfit_ids": exclude_outfit_ids or [],
            },
            "preferences": {
                "styles": preferences.get("styles", []) if preferences else [],
                "favorite_colors": preferences.get("favorite_colors", []) if preferences else [],
                "avoid_colors": preferences.get("avoid_colors", []) if preferences else [],
            },
            "wardrobe": wardrobe_items,
        }

        if feedback_context:
            context["feedback_context"] = feedback_context

        return context

    @classmethod
    def build_prompt(cls, context: Dict[str, Any]) -> str:
        """Formats the compact context into a precise user prompt for Gemini."""
        prompt = (
            f"Here is the user's styling request, environmental context, and owned wardrobe:\n"
            f"```json\n{json.dumps(context, indent=2)}\n```\n\n"
            f"Please recommend {context['request']['count']} outfits for occasion '{context['request']['occasion']}'.\n"
            f"CRITICAL RULES:\n"
            f"1. Use ONLY the integer item IDs present in the 'wardrobe' list.\n"
            f"2. Every outfit MUST contain either: (at least one top AND at least one bottom) OR a dress.\n"
            f"3. Do not duplicate item IDs within any single outfit.\n"
        )
        anchor_id = context.get('request', {}).get('anchor_item_id')
        if anchor_id:
            prompt += f"4. Item ID {anchor_id} is the anchor item and MUST be included in every single recommendation.\n"

        if context.get('feedback_context'):
            fb = context['feedback_context']
            prompt += (
                f"RECENT FEEDBACK PREFERENCES: User liked: {fb.get('recently_liked_outfits', [])} "
                f"and disliked: {fb.get('recently_disliked_outfits', [])}. "
                "Use this feedback for stylistic inspiration, but ALWAYS prioritize the explicit occasion, "
                "weather, and style request.\n"
            )

        prompt += (
            "Return strictly valid JSON adhering to the required response schema with match_score (0-100), "
            "occasion, reason, and item_ids."
        )
        return prompt

    @classmethod
    async def generate_recommendations(cls, context: Dict[str, Any]) -> GeminiStructuredResponse:
        """
        Calls Gemini API with structured JSON output enforcement and parses the result.
        Supports automatic fallback across available Flash models.
        """
        client = cls.get_client()
        user_prompt = cls.build_prompt(context)
        preferred = settings.GEMINI_MODEL or "gemini-2.5-flash"
        deprecated_models = {"gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"}

        candidate_models = []
        for m in [preferred, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]:
            if m and m not in deprecated_models and m not in candidate_models:
                candidate_models.append(m)
        if not candidate_models:
            candidate_models = ["gemini-2.5-flash", "gemini-2.0-flash"]

        last_error = None
        for model_name in candidate_models:
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        response_mime_type="application/json",
                        response_schema=GeminiStructuredResponse,
                        temperature=0.4,
                    ),
                )
                if response and response.text:
                    try:
                        return GeminiStructuredResponse.model_validate_json(response.text)
                    except ValidationError as val_err:
                        last_error = f"Malformed schema from {model_name}: {val_err}"
                        continue
            except Exception as exc:
                last_error = str(exc)
                continue

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gemini AI service unavailable: {last_error}",
        )
