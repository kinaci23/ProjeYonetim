# backend/app/models/__init__.py
from .user_model import User
from .project_model import Project
from .task_model import Task, TaskStatus
from .project_member_model import ProjectMember, ProjectRole
from .notification_model import Notification

# YENİ EKLENDİ (Alembic'in görmesi için):
from .note_model import Note