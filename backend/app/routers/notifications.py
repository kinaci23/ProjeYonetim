from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import user_model
from app.schemas import notification_schemas
from app.services.auth_service import get_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=List[notification_schemas.NotificationDisplay])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return notification_service.get_user_notifications(db, current_user.id)

@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    notification_service.mark_as_read(db, notif_id, current_user.id)
    return {"message": "Okundu"}

@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "Tümü okundu"}