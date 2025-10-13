# codigo de conexão banco de dados 
from flask import Flask, request, jsonify
import psycopg2
import bcrypt

# --- CONFIGURAÇÃO ---
app = Flask(__name__)
DATABASE_URL = DATABASE_URL = 'postgresql://neondb_owner:npg_Fbyjq2Iw5tvH@ep-odd-tree-acwo8a6t-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# --- FUNÇÕES AUXILIARES ---
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def gerar_ra_unico():
    import random
    from datetime import datetime
    ano = datetime.now().year
    numero = random.randint(1000, 9999)
    return f"{ano}{numero}"

# --- NOVAS ROTAS PARA PROJETOS ---

# ROTA PARA BUSCAR (GET) TODOS OS PROJETOS
@app.route('/api/projetos', methods=['GET'])
def get_projetos():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, titulo, descricao, imagem_url, link_projeto, categorias FROM projetos ORDER BY created_at DESC;")
        projetos_db = cursor.fetchall()
        cursor.close()

        # Transforma os resultados em uma lista de dicionários (JSON)
        lista_projetos = []
        for projeto in projetos_db:
            lista_projetos.append({
                "id": projeto[0],
                "titulo": projeto[1],
                "descricao": projeto[2],
                "imagem": projeto[3], # Note que a chave no JSON é 'imagem'
                "link": projeto[4],     # E aqui é 'link'
                "categorias": projeto[5]
            })
        
        return jsonify(lista_projetos)

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ROTA PARA SALVAR (POST) UM NOVO PROJETO
@app.route('/api/projetos', methods=['POST'])
def add_projeto():
    dados = request.get_json()
    
    # Validação básica
    if not dados or not dados.get('titulo') or not dados.get('descricao'):
        return jsonify({"status": "erro", "mensagem": "Dados incompletos"}), 400

    # Assume que o user_id '1' está sendo usado para todos os projetos por enquanto
    # Em um sistema de login real, você pegaria o ID do usuário logado
    user_id = 1 

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO projetos (titulo, descricao, imagem_url, link_projeto, categorias, user_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('imagem'),
            dados.get('link'),
            dados.get('categorias'),
            user_id
        ))
        conn.commit()
        cursor.close()
        
        return jsonify({"status": "sucesso", "mensagem": "Projeto adicionado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    finally:
        if conn:
            conn.close()

# --- INICIALIZAÇÃO DO SERVIDOR ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)