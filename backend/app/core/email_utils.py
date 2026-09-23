import requests
from app.core.config import BREVO_API_KEY, EMAIL_USER

def enviar_correo_recuperacion(destinatario: str, enlace: str, nombre: str):
    cuerpo_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #087f8c;">Turismo Colombia</h2>
        <p>Hola {nombre},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{enlace}" style="background-color: #087f8c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Restablecer contraseña
            </a>
        </p>
        <p>Este enlace expira en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p style="color: #999; font-size: 12px;">Turismo Colombia — Descubre lo extraordinario</p>
    </div>
    """

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        json={
            "sender": {"name": "Turismo Colombia", "email": EMAIL_USER},
            "to": [{"email": destinatario}],
            "subject": "Recupera tu contraseña - Turismo Colombia",
            "htmlContent": cuerpo_html,
        },
    )
    response.raise_for_status()