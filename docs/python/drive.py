from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

app = Flask(__name__)
CORS(app)

# ============================
# 🔧 Caminho direto da credencial JSON
# ============================

SERVICE_ACCOUNT_FILE = r"C:\\Users\\gutos\\OneDrive\\Documentos\\GitHub\\SITE-FAITS-FINAL\\JSON_DRIVE\\etec-caba3-54583b48a1ff.json"

print("Usando credencial:", SERVICE_ACCOUNT_FILE)

# ============================
# 🔐 Carregar credenciais Google
# ============================

SCOPES = ["https://www.googleapis.com/auth/drive.file"]

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=SCOPES
)

drive_service = build("drive", "v3", credentials=credentials)

# ============================================
# 🟩 ID da pasta no Google Drive
# ============================================

PASTA_ID = "1tKvbYYDp-ugIVkoUo_l_wEyEw5RQjLFt"


# ============================
# 📤 ROTA DE UPLOAD
# ============================

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "arquivo" not in request.files:
            return jsonify({"erro": "Nenhum arquivo enviado"}), 400

        arquivo = request.files["arquivo"]

        media = MediaIoBaseUpload(
            io.BytesIO(arquivo.read()),
            mimetype=arquivo.mimetype,
            resumable=False
        )

        file_metadata = {
            "name": arquivo.filename,
            "parents": [PASTA_ID]
        }

        enviado = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id"
        ).execute()

        return jsonify({
            "mensagem": "Arquivo enviado com sucesso!",
            "fileId": enviado.get("id")
        })

    except Exception as e:
        print("Erro:", e)
        return jsonify({"erro": str(e)}), 500


# ============================
# ▶️ INICIAR O SERVIDOR
# ============================

if __name__ == "__main__":
    app.run(port=5000, debug=True)
