# Compara duas versões de uma lista usando operações com conjuntos.

versao_inicial = ["arroz", "feijão", "leite", "café", "açúcar"]
versao_alterada = ["arroz", "leite", "café", "pão", "manteiga"]

inicial = set(versao_inicial)
alterada = set(versao_alterada)

nao_mudaram = inicial & alterada   # interseção: estão nas duas
novos = alterada - inicial         # diferença: só na nova versão
removidos = inicial - alterada     # diferença: só na versão inicial

print("Lista inicial: ", versao_inicial)
print("Lista alterada:", versao_alterada)
print()
print("Elementos que não mudaram:", sorted(nao_mudaram))
print("Novos elementos:          ", sorted(novos))
print("Elementos removidos:      ", sorted(removidos))
