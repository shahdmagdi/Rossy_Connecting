from datetime import datetime
from app import db, bcrypt
from models import User, Doctor, UserRole, VerificationStatus
from flask_jwt_extended import create_access_token, create_refresh_token


# ================= HELPERS =================

def _generate_tokens(user_id):
    access_token = create_access_token(identity=str(user_id))
    refresh_token = create_refresh_token(identity=str(user_id))
    return access_token, refresh_token


def _update_last_login(user):
    user.last_login = datetime.utcnow()
    db.session.commit()


# ================= LOGIN =================

def login_user(data):
    email    = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    # ---------- VALIDATION ----------
    if not email or not password:
        return {"success": False, "message": "Email and password are required."}, 400, None

    # ---------- FIND USER ----------
    user = User.query.filter_by(email=email).first()

    # ---------- SAFE PASSWORD CHECK ----------
    if not user:
        return {"success": False, "message": "Invalid email or password."}, 401, None

    if not user.password_hash:
        return {"success": False, "message": "Invalid email or password."}, 401, None

    if not bcrypt.check_password_hash(user.password_hash, password):
        return {"success": False, "message": "Invalid email or password."}, 401, None

    # ---------- EMAIL VERIFICATION ----------
    if not user.email_verified:
        return {
            "success": False,
            "message": "Please verify your email before logging in.",
            "user_id": str(user.user_id),
        }, 403, None

    # ---------- ROLE ROUTING ----------
    if user.role == UserRole.patient:
        return _patient_login(user)

    if user.role == UserRole.doctor:
        return _doctor_login(user)

    if user.role == UserRole.admin:
        return _admin_login(user)

    return {"success": False, "message": "Invalid role."}, 400, None


# ================= PATIENT =================

def _patient_login(user):
    try:
        _update_last_login(user)
        tokens = _generate_tokens(user.user_id)

        return {
            "success": True,
            "message": "Login successful",
            "role": "patient",
            "user": user.to_dict(),
        }, 200, tokens

    except Exception as e:
        return {"success": False, "message": str(e)}, 500, None


# ================= DOCTOR =================

def _doctor_login(user):
    try:
        doctor = Doctor.query.get(user.user_id)

        # SAFE CHECK
        if not doctor:
            return {
                "success": False,
                "message": "Doctor profile not found."
            }, 404, None

        if doctor.verification_status == VerificationStatus.pending:
            return {
                "success": False,
                "message": "Account pending admin approval.",
                "status": "pending_approval",
            }, 403, None

        if doctor.verification_status == VerificationStatus.rejected:
            return {
                "success": False,
                "message": "Account rejected by admin."
            }, 403, None

        _update_last_login(user)
        tokens = _generate_tokens(user.user_id)

        return {
            "success": True,
            "message": "Login successful",
            "role": "doctor",
            "user": {**user.to_dict(), **doctor.to_dict()},
        }, 200, tokens

    except Exception as e:
        return {"success": False, "message": str(e)}, 500, None


# ================= ADMIN =================

def _admin_login(user):
    try:
        _update_last_login(user)
        tokens = _generate_tokens(user.user_id)

        return {
            "success": True,
            "message": "Login successful",
            "role": "admin",
            "user": user.to_dict(),
        }, 200, tokens

    except Exception as e:
        return {"success": False, "message": str(e)}, 500, None


# ================= LOGOUT =================

def logout_user():
    return {"success": True, "message": "Logged out successfully."}, 200