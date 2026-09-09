import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import EMAIL_USER, EMAIL_PASSWORD

def enviar_correo_recuperacion(destinatario: str, enlace: str, nombre: str):
    asunto = "Recupera tu contraseña - Turismo Colombia"

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

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = EMAIL_USER
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(cuerpo_html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as servidor:
        servidor.starttls()
        servidor.login(EMAIL_USER, EMAIL_PASSWORD)
        servidor.sendmail(EMAIL_USER, destinatario, mensaje.as_string())