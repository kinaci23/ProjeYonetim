from sqlalchemy.orm import Session
from app.models.notification_model import Notification
from typing import List

class NotificationService:
    
    @staticmethod
    def create_notification(db: Session, user_id: int, title: str, message: str):
        """Kullanıcıya yeni bildirim gönderir."""
        new_notif = Notification(
            user_id=user_id,
            title=title,
            message=message
        )
        db.add(new_notif)
        db.commit()
        db.refresh(new_notif)
        return new_notif

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, limit: int = 10) -> List[Notification]:
        """Kullanıcının son bildirimlerini getirir (En yeni en üstte)."""
        return db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(limit)\
            .all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int):
        """Bildirimi okundu olarak işaretler."""
        notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int):
        """Tüm bildirimleri okundu yapar."""
        db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        db.commit()

notification_service = NotificationService()