import os 
print('hello World! \n')

# python Servidor\servidor.py 
# O Python usa o padrão nome_variavel para declarar
# pode usar  o int ou float para transformar uma string em numero
# try except serve para em caso de erro nao realizar a mudança 

def perguntar_usuario():
    pergunta_usuario = input('Como você está? Bem (1) ou Mau (2)? ')
    try:
        numero = int(pergunta_usuario)
        return numero 
    except ValueError:
        return pergunta_usuario

def main():
    resultado = perguntar_usuario()

    if resultado == 1:
        os.system('cls')  # Limpa o terminal
        print('Ótimo, você está Bem!')
    elif resultado == 2:
        os.system('cls')  # Limpa o terminal
        print('Que pena!')
    else:
        os.system('cls')  # Limpa o terminal
        print('Até mais!') 

if __name__ == '__main__':
    main()