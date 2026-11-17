"""
Notification Manager and Storage for Municipal Alerts and Governance Events.
"""

from __future__ import annotations

import datetime
import logging
from typing import Any, Dict, List, Optional

from civic_connect.mongo import get_collection, parse_object_id, serialize_docs, serialize_doc

logger = logging.getLogger(__name__)


class NotificationType:
    STATUS_CHANGED = "status_changed"
    TASK_ASSIGNED = "task_assigned"
    RESOLUTION_PENDING = "resolution_pending"
    RESOLUTION_CONFIRMED = "resolution_confirmed"
    RESOLUTION_DISPUTED = "resolution_disputed"
    DELETION_REQUEST = "deletion_request"
    SYSTEM_ALERT = "system_alert"


class NotificationManager:
    @classmethod
    def get_collection(cls):
        return get_collection("notifications")

    @classmethod
    def create_notification(
        cls,
        recipient_id: Optional[str],
        recipient_role: str,
        title: str,
        message: str,
        link: str = "",
        notification_type: str = NotificationType.SYSTEM_ALERT,
        report_id: Optional[str] = None,
        ticket_id: Optional[str] = None,
        recipient_ward: Optional[str] = None,
        recipient_phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a notification in MongoDB."""
        col = cls.get_collection()
        now = datetime.datetime.now(datetime.timezone.utc)

        doc = {
            "recipient_id": str(recipient_id).strip() if recipient_id else None,
            "recipient_role": recipient_role or "citizen",
            "recipient_phone": str(recipient_phone).strip() if recipient_phone else None,
            "recipient_ward": str(recipient_ward).strip() if recipient_ward else None,
            "title": title,
            "message": message,
            "link": link or "",
            "type": notification_type,
            "report_id": str(report_id) if report_id else None,
            "ticket_id": str(ticket_id) if ticket_id else None,
            "is_read": False,
            "created_at": now,
        }

        res = col.insert_one(doc)
        doc["_id"] = res.inserted_id
        return serialize_doc(doc)

    @classmethod
    def _build_user_query(
        cls,
        user_id: Optional[str] = None,
        phone: Optional[str] = None,
        role: Optional[str] = None,
        ward_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Construct recipient filter matching user's identity or role."""
        or_clauses: List[Dict[str, Any]] = []

        if user_id:
            or_clauses.append({"recipient_id": str(user_id).strip()})
        if phone:
            clean_phone = "".join(filter(str.isdigit, str(phone)))[-10:]
            if clean_phone:
                or_clauses.append({"recipient_phone": {"$regex": f"{clean_phone}$"}})
                or_clauses.append({"recipient_id": {"$regex": f"{clean_phone}$"}})

        # Role-based channel alerts
        if role == "super_admin":
            or_clauses.append({"recipient_role": "super_admin"})
        elif role == "admin" and ward_id:
            or_clauses.append({"recipient_role": "admin", "recipient_ward": str(ward_id).strip()})
        elif role == "officer" and ward_id:
            or_clauses.append({"recipient_role": "officer", "recipient_ward": str(ward_id).strip()})

        if not or_clauses:
            return {"recipient_id": "__none__"}

        return {"$or": or_clauses} if len(or_clauses) > 1 else or_clauses[0]

    @classmethod
    def list_for_user(
        cls,
        user_id: Optional[str] = None,
        phone: Optional[str] = None,
        role: Optional[str] = None,
        ward_id: Optional[str] = None,
        limit: int = 40,
        only_unread: bool = False,
    ) -> List[Dict[str, Any]]:
        """List notifications for the requesting user session."""
        col = cls.get_collection()
        query = cls._build_user_query(user_id=user_id, phone=phone, role=role, ward_id=ward_id)

        if only_unread:
            if "$or" in query:
                query = {"$and": [query, {"is_read": False}]}
            else:
                query["is_read"] = False

        cursor = col.find(query).sort("created_at", -1).limit(limit)
        return serialize_docs(cursor)

    @classmethod
    def get_unread_count(
        cls,
        user_id: Optional[str] = None,
        phone: Optional[str] = None,
        role: Optional[str] = None,
        ward_id: Optional[str] = None,
    ) -> int:
        """Count unread notifications for user session."""
        col = cls.get_collection()
        query = cls._build_user_query(user_id=user_id, phone=phone, role=role, ward_id=ward_id)

        if "$or" in query:
            query = {"$and": [query, {"is_read": False}]}
        else:
            query["is_read"] = False

        return col.count_documents(query)

    @classmethod
    def mark_as_read(cls, notification_id: str, user_id: Optional[str] = None) -> bool:
        """Mark a single notification as read."""
        col = cls.get_collection()
        oid = parse_object_id(notification_id)
        query = {"_id": oid} if oid else {"_id": notification_id}

        res = col.update_one(query, {"$set": {"is_read": True}})
        return res.modified_count > 0

    @classmethod
    def mark_all_as_read(
        cls,
        user_id: Optional[str] = None,
        phone: Optional[str] = None,
        role: Optional[str] = None,
        ward_id: Optional[str] = None,
    ) -> int:
        """Mark all notifications matching user as read."""
        col = cls.get_collection()
        query = cls._build_user_query(user_id=user_id, phone=phone, role=role, ward_id=ward_id)
        if "$or" in query:
            query = {"$and": [query, {"is_read": False}]}
        else:
            query["is_read"] = False

        res = col.update_many(query, {"$set": {"is_read": True}})
        return res.modified_count
