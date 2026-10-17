"""
MongoDB Client and Collection Manager for Civic Connect.

Provides singleton PyMongo connection management, index initialization,
and document serialization utilities. Includes automatic fallback to
mongomock for offline development and testing.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from pymongo import MongoClient, ASCENDING, GEOSPHERE
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

try:
    import mongomock
    HAS_MONGOMOCK = True
except ImportError:
    HAS_MONGOMOCK = False

logger = logging.getLogger(__name__)

# Global singleton client
_mongo_client: Optional[Any] = None
_mongo_db: Optional[Any] = None
_is_mock_mode: bool = False
_indexes_initialized: bool = False


def get_mongo_uri() -> str:
    """Return MongoDB connection URI from environment or default."""
    return os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")


def get_mongo_db_name() -> str:
    """Return MongoDB database name from environment or default."""
    return os.environ.get("MONGODB_DB_NAME", "civic_connect")


def get_mongo_client() -> Any:
    """
    Get or create singleton PyMongo MongoClient instance.
    If real MongoDB is unreachable, gracefully falls back to mongomock.
    """
    global _mongo_client, _is_mock_mode
    if _mongo_client is not None:
        return _mongo_client

    uri = get_mongo_uri()
    try:
        real_client = MongoClient(
            uri,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500,
            socketTimeoutMS=3000,
            maxPoolSize=50,
            minPoolSize=5,
            retryWrites=True,
        )
        # Verify connection
        real_client.admin.command("ping")
        _mongo_client = real_client
        _is_mock_mode = False
        logger.info(f"Connected to live MongoDB at {uri}")
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as exc:
        if HAS_MONGOMOCK:
            logger.info("Live MongoDB unreachable. Initializing in-memory mongomock engine for development/testing.")
            _mongo_client = mongomock.MongoClient()
            _is_mock_mode = True
        else:
            logger.warning(f"Could not connect to MongoDB and mongomock is not installed: {exc}")
            _mongo_client = real_client
            _is_mock_mode = False

    return _mongo_client


def get_db() -> Any:
    """Get the application MongoDB database instance."""
    global _mongo_db
    if _mongo_db is None:
        client = get_mongo_client()
        db_name = get_mongo_db_name()
        _mongo_db = client[db_name]
    return _mongo_db


def get_collection(name: str) -> Collection:
    """Get a specific collection from the application database."""
    return get_db()[name]


def is_mongo_connected() -> bool:
    """Check whether MongoDB connection is active."""
    global _is_mock_mode
    if _is_mock_mode:
        return True
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return True
    except Exception:
        return False


def is_mock_mode() -> bool:
    """Return True if running on in-memory mock MongoDB."""
    global _is_mock_mode
    return _is_mock_mode


def init_indexes() -> None:
    """
    Ensure all necessary MongoDB indexes (including 2dsphere for geospatial queries)
    are created across application collections.
    """
    global _indexes_initialized
    if _indexes_initialized:
        return

    try:
        db = get_db()

        # 1. Reports Collection Indexes
        reports = db["reports"]
        reports.create_index([("location", GEOSPHERE)], name="location_2dsphere")
        reports.create_index([("ticket_id", ASCENDING)], unique=True, name="ticket_id_unique")
        reports.create_index([("status", ASCENDING)], name="status_idx")
        reports.create_index([("category", ASCENDING)], name="category_idx")
        reports.create_index([("created_at", ASCENDING)], name="created_at_idx")
        reports.create_index([("ward_id", ASCENDING)], name="ward_id_idx")
        reports.create_index([("reporter_id", ASCENDING)], name="reporter_id_idx")
        reports.create_index([("priority_score", ASCENDING)], name="priority_score_idx")

        # 2. Users Collection Indexes
        users = db["users"]
        users.create_index([("phone", ASCENDING)], unique=True, sparse=True, name="phone_unique")
        users.create_index([("email", ASCENDING)], unique=True, sparse=True, name="email_unique")
        users.create_index([("role", ASCENDING)], name="role_idx")

        # 3. Upvotes Collection Indexes (Prevent duplicate upvotes)
        upvotes = db["upvotes"]
        upvotes.create_index([("report_id", ASCENDING), ("user_id", ASCENDING)], name="report_user_upvote_idx")
        upvotes.create_index([("report_id", ASCENDING), ("device_id", ASCENDING)], name="report_device_upvote_idx")

        # 4. Action Tokens Collection Indexes (with TTL auto-expiration)
        action_tokens = db["action_tokens"]
        action_tokens.create_index([("token", ASCENDING)], unique=True, name="token_unique")
        action_tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0, name="token_ttl_idx")

        # 5. Gamification Ledger Indexes
        gamification = db["gamification_ledger"]
        gamification.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)], name="user_ledger_idx")

        # 6. Wards Collection Indexes
        wards = db["wards"]
        wards.create_index([("ward_number", ASCENDING)], unique=True, name="ward_number_unique")

        _indexes_initialized = True
        logger.info("MongoDB indexes successfully initialized.")
    except Exception as exc:
        logger.warning(f"Could not initialize MongoDB indexes: {exc}")


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Recursively serialize MongoDB document for JSON/REST output.
    Converts ObjectId to string id, datetime to ISO format string.
    """
    if doc is None:
        return None

    res: Dict[str, Any] = {}
    for key, value in doc.items():
        if key == "_id":
            res["id"] = str(value)
            res["_id"] = str(value)
        elif isinstance(value, ObjectId):
            res[key] = str(value)
        elif isinstance(value, datetime):
            res[key] = value.isoformat()
        elif isinstance(value, dict):
            res[key] = serialize_doc(value)
        elif isinstance(value, list):
            res[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in value
            ]
        else:
            res[key] = value
    return res


def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(d) for d in docs if d is not None]  # type: ignore


def parse_object_id(id_str: str) -> Optional[ObjectId]:
    """Safely convert hex string to ObjectId. Returns None if invalid."""
    if not id_str:
        return None
    try:
        return ObjectId(id_str)
    except Exception:
        return None
