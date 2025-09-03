from api.modules.user.user_model import User


class UserMapper:

    @staticmethod
    def to_user_response_login(user: User):
        return {
            "user_id": str(user.id),
            "name": user.name,
            "bio": user.bio,
            "email": user.email,
            "role": str(user.role),
            "status": str(user.status),
            "crp": user.crp,
            "image_url": user.image_url,
            "created_at": str(user.created_at),
        }
