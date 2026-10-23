# Escreva uma funcao que receba uma string com as opcoes validas a aceitar (cada opcao
# é uma letra). Converta as opcoes validas para letras minusculas. Utilize input
# para ler uma opcao, converter o valor para letras minusculas e verificar se a opcao
# é valida. Em caso de opcao invalida, a funcao deve pedir ao usuario que digite novamente
# outra opcao.


def valida_opcao(opcoes_validas):
    opcoes_validas = opcoes_validas.lower()
    while True:
        opcao = input(f"Digite uma opção ({opcoes_validas}): ").strip().lower()
        # len == 1 evita aceitar entrada vazia ou várias letras, como "ab"
        if len(opcao) == 1 and opcao in opcoes_validas:
            return opcao
        print("Opção inválida! Digite novamente.")


if __name__ == "__main__":
    escolha = valida_opcao("ABC")
    print(f"Você escolheu a opção: {escolha}")
