# -*- coding: utf-8 -*-
import json

# Each entry: (category_id, nl, pt, example_nl, example_pt, difficulty, phonetic_or_None)
E = "makkelijk"; M = "gemiddeld"; H = "moeilijk"

data = []

def add(cat, items):
    for it in items:
        data.append((cat,) + it)

# ---------------- PERSONEN (16) ----------------
add("personen", [
    ("man", "homem", "Aquele homem é meu vizinho.", "Die man is mijn buurman.", E, None),
    ("vrouw", "mulher", "A mulher trabalha no hospital.", "De vrouw werkt in het ziekenhuis.", E, None),
    ("kind", "criança", "A criança está brincando no parque.", "Het kind speelt in het park.", E, None),
    ("jongen", "menino", "O menino gosta de futebol.", "De jongen houdt van voetbal.", E, None),
    ("meisje", "menina", "A menina tem sete anos.", "Het meisje is zeven jaar oud.", E, None),
    ("vriend", "amigo", "Ele é meu melhor amigo.", "Hij is mijn beste vriend.", E, None),
    ("vriendin", "amiga", "Minha amiga mora em São Paulo.", "Mijn vriendin woont in São Paulo.", E, None),
    ("meneer", "senhor", "Bom dia, senhor!", "Goedemorgen, meneer!", E, None),
    ("mevrouw", "senhora", "A senhora é muito gentil.", "De mevrouw is erg vriendelijk.", E, None),
    ("baby", "bebê", "O bebê está dormindo.", "De baby slaapt.", E, None),
    ("jongere", "jovem", "O jovem estuda na universidade.", "De jongere studeert aan de universiteit.", M, None),
    ("oudere", "idoso", "O idoso caminha todos os dias.", "De oudere wandelt elke dag.", M, None),
    ("persoon", "pessoa", "Ela é uma pessoa muito simpática.", "Zij is een heel aardig persoon.", E, None),
    ("jongeman", "rapaz", "O rapaz trabalha na loja.", "De jongeman werkt in de winkel.", M, None),
    ("jonge vrouw", "moça", "A moça canta muito bem.", "De jonge vrouw zingt heel goed.", M, None),
    ("buurman", "vizinho", "Meu vizinho é muito simpático.", "Mijn buurman is erg aardig.", E, None),
])

# ---------------- FAMILIE (16) ----------------
add("familie", [
    ("vader", "pai", "Meu pai trabalha muito.", "Mijn vader werkt veel.", E, "pai (pai-j)"),
    ("moeder", "mãe", "Minha mãe cozinha muito bem.", "Mijn moeder kookt erg lekker.", E, "mãe (maj-uh, nasaal)"),
    ("zoon", "filho", "O filho ajuda o pai.", "De zoon helpt de vader.", E, "fi-ljoo"),
    ("dochter", "filha", "A filha estuda na escola.", "De dochter leert op school.", E, "fi-lja"),
    ("broer", "irmão", "Meu irmão mora no Rio.", "Mijn broer woont in Rio.", E, "ir-mauhn"),
    ("zus", "irmã", "Minha irmã é professora.", "Mijn zus is lerares.", E, "ir-mah"),
    ("opa", "avô", "Meu avô conta boas histórias.", "Mijn opa vertelt goede verhalen.", E, None),
    ("oma", "avó", "Minha avó faz um bolo delicioso.", "Mijn oma bakt een heerlijke taart.", E, None),
    ("oom", "tio", "Meu tio mora na cidade.", "Mijn oom woont in de stad.", E, None),
    ("tante", "tia", "Minha tia visita todo domingo.", "Mijn tante komt elke zondag langs.", E, None),
    ("neef", "primo", "Meu primo joga futebol.", "Mijn neef speelt voetbal.", E, None),
    ("nicht", "prima", "Minha prima mora em Salvador.", "Mijn nicht woont in Salvador.", E, None),
    ("echtgenoot", "marido", "O marido dela é médico.", "Haar echtgenoot is arts.", M, None),
    ("echtgenote", "esposa", "A esposa dele é professora.", "Zijn echtgenote is lerares.", M, None),
    ("kleinzoon", "neto", "O neto visita os avós.", "De kleinzoon bezoekt de grootouders.", M, None),
    ("kleindochter", "neta", "A neta ajuda a avó.", "De kleindochter helpt oma.", M, None),
])

# ---------------- HUIS (17) ----------------
add("huis", [
    ("huis", "casa", "Minha casa é grande.", "Mijn huis is groot.", E, "kah-za"),
    ("slaapkamer", "quarto", "Meu quarto é pequeno.", "Mijn slaapkamer is klein.", E, "kwar-too"),
    ("keuken", "cozinha", "A cozinha está limpa.", "De keuken is schoon.", E, "koo-zi-nja"),
    ("badkamer", "banheiro", "O banheiro fica ao lado.", "De badkamer is ernaast.", E, "ba-nyay-roo"),
    ("woonkamer", "sala", "A família está na sala.", "De familie is in de woonkamer.", E, None),
    ("deur", "porta", "Feche a porta, por favor.", "Doe de deur dicht, alsjeblieft.", E, None),
    ("raam", "janela", "Abra a janela, faz calor.", "Doe het raam open, het is warm.", E, None),
    ("tafel", "mesa", "O jantar está na mesa.", "Het avondeten staat op tafel.", E, None),
    ("stoel", "cadeira", "Esta cadeira é confortável.", "Deze stoel is comfortabel.", E, None),
    ("bed", "cama", "Eu durmo na minha cama.", "Ik slaap in mijn bed.", E, None),
    ("bank", "sofá", "Nós assistimos TV no sofá.", "Wij kijken tv op de bank.", E, None),
    ("kast", "armário", "As roupas estão no armário.", "De kleren zitten in de kast.", M, None),
    ("sleutel", "chave", "Onde está a chave da casa?", "Waar is de sleutel van het huis?", E, None),
    ("dak", "telhado", "O telhado é vermelho.", "Het dak is rood.", M, None),
    ("tuin", "jardim", "As flores estão no jardim.", "De bloemen staan in de tuin.", E, None),
    ("trap", "escada", "A escada é muito alta.", "De trap is erg hoog.", M, None),
    ("muur", "parede", "O quadro está na parede.", "Het schilderij hangt aan de muur.", M, None),
])

# ---------------- ETEN (20) ----------------
add("eten", [
    ("rijst", "arroz", "Nós comemos arroz todos os dias.", "Wij eten elke dag rijst.", E, "ah-hoez"),
    ("bonen", "feijão", "O feijão está muito bom hoje.", "De bonen zijn vandaag erg lekker.", E, "fay-zjaun"),
    ("vlees", "carne", "Eu não como carne.", "Ik eet geen vlees.", E, None),
    ("kip", "frango", "O frango está no forno.", "De kip staat in de oven.", E, None),
    ("vis", "peixe", "O peixe é fresco.", "De vis is vers.", E, "pay-sjuh"),
    ("brood", "pão", "Quero pão com manteiga.", "Ik wil brood met boter.", E, "pauhn"),
    ("kaas", "queijo", "Este queijo é brasileiro.", "Deze kaas is Braziliaans.", E, "kay-zjoo"),
    ("ei", "ovo", "Eu como um ovo no café da manhã.", "Ik eet een ei bij het ontbijt.", E, None),
    ("fruit", "fruta", "A fruta é boa para a saúde.", "Fruit is goed voor je gezondheid.", E, None),
    ("appel", "maçã", "Esta maçã é vermelha.", "Deze appel is rood.", E, "mah-sang"),
    ("banaan", "banana", "A banana é amarela.", "De banaan is geel.", E, None),
    ("sinaasappel", "laranja", "O suco de laranja é gostoso.", "Sinaasappelsap is lekker.", E, "la-ran-zja"),
    ("aardappel", "batata", "A batata está cozida.", "De aardappel is gekookt.", E, None),
    ("salade", "salada", "Vou comer uma salada.", "Ik ga een salade eten.", E, None),
    ("suiker", "açúcar", "Não coloque muito açúcar.", "Doe niet te veel suiker erbij.", M, "a-soo-kar"),
    ("zout", "sal", "Falta sal na comida.", "Er zit geen zout aan het eten.", E, None),
    ("boter", "manteiga", "Passe manteiga no pão.", "Smeer boter op het brood.", E, None),
    ("soep", "sopa", "A sopa está quente.", "De soep is heet.", E, None),
    ("toetje", "sobremesa", "Qual é a sobremesa de hoje?", "Wat is het toetje van vandaag?", M, None),
    ("pasta", "macarrão", "As crianças adoram macarrão.", "De kinderen houden van pasta.", E, "ma-ka-rauhn"),
])

# ---------------- DRINKEN (10) ----------------
add("drinken", [
    ("water", "água", "Eu bebo água todos os dias.", "Ik drink elke dag water.", E, "ah-gwa"),
    ("melk", "leite", "As crianças bebem leite.", "De kinderen drinken melk.", E, "lay-chee"),
    ("koffie", "café", "Você quer um café?", "Wil je een koffie?", E, "ka-feh"),
    ("thee", "chá", "Eu prefiro chá de manhã.", "Ik drink liever thee 's ochtends.", E, "sjah"),
    ("sap", "suco", "O suco de laranja é fresco.", "Het sinaasappelsap is vers.", E, "soo-koo"),
    ("bier", "cerveja", "Ele bebeu uma cerveja gelada.", "Hij dronk een koud biertje.", M, "ser-veh-zja"),
    ("wijn", "vinho", "O vinho tinto é forte.", "De rode wijn is sterk.", M, "vi-njoo"),
    ("frisdrank", "refrigerante", "As crianças gostam de refrigerante.", "Kinderen houden van frisdrank.", M, None),
    ("glas", "copo", "Passe-me um copo de água.", "Geef me een glas water.", E, None),
    ("drankje", "bebida", "Qual bebida você quer?", "Welk drankje wil je?", E, None),
])

# ---------------- WERK (12) ----------------
add("werk", [
    ("werk", "trabalho", "Meu trabalho começa às oito.", "Mijn werk begint om acht uur.", E, None),
    ("kantoor", "escritório", "Eu trabalho em um escritório.", "Ik werk op een kantoor.", M, None),
    ("baas", "chefe", "Meu chefe é muito exigente.", "Mijn baas is erg veeleisend.", M, None),
    ("werknemer", "funcionário", "O funcionário chegou cedo.", "De werknemer kwam vroeg aan.", M, None),
    ("vergadering", "reunião", "A reunião é às dez horas.", "De vergadering is om tien uur.", M, "hey-oo-ni-aun"),
    ("computer", "computador", "Eu uso o computador todo dia.", "Ik gebruik elke dag de computer.", E, None),
    ("geld", "dinheiro", "Ele não tem muito dinheiro.", "Hij heeft niet veel geld.", E, "di-nyay-roo"),
    ("salaris", "salário", "O salário é pago no fim do mês.", "Het salaris wordt eind van de maand betaald.", M, None),
    ("bedrijf", "empresa", "Essa empresa é grande.", "Dat bedrijf is groot.", M, None),
    ("baan", "emprego", "Ela procura um novo emprego.", "Zij zoekt een nieuwe baan.", M, None),
    ("telefoon", "telefone", "Meu telefone está tocando.", "Mijn telefoon gaat over.", E, None),
    ("e-mail", "e-mail", "Envie um e-mail para mim.", "Stuur mij een e-mail.", E, None),
])

# ---------------- SCHOOL (14) ----------------
add("school", [
    ("school", "escola", "As crianças vão à escola.", "De kinderen gaan naar school.", E, None),
    ("leraar", "professor", "O professor explica bem.", "De leraar legt goed uit.", E, None),
    ("lerares", "professora", "A professora é paciente.", "De lerares is geduldig.", E, None),
    ("leerling (jongen)", "aluno", "O aluno faz a lição.", "De leerling maakt het huiswerk.", M, None),
    ("leerling (meisje)", "aluna", "A aluna estuda muito.", "De leerlinge studeert veel.", M, None),
    ("boek", "livro", "Este livro é interessante.", "Dit boek is interessant.", E, None),
    ("schrift", "caderno", "Escreva no seu caderno.", "Schrijf in je schrift.", E, None),
    ("potlood", "lápis", "Preciso de um lápis.", "Ik heb een potlood nodig.", E, "lah-pis"),
    ("pen", "caneta", "A caneta não funciona.", "De pen werkt niet.", E, None),
    ("klaslokaal", "sala de aula", "A sala de aula é grande.", "Het klaslokaal is groot.", M, None),
    ("toets", "prova", "Amanhã tenho uma prova.", "Morgen heb ik een toets.", M, None),
    ("les", "lição", "A lição de hoje é difícil.", "De les van vandaag is moeilijk.", M, "li-saun"),
    ("rugzak", "mochila", "Minha mochila é pesada.", "Mijn rugzak is zwaar.", E, "moo-shee-la"),
    ("universiteit", "universidade", "Ele estuda na universidade.", "Hij studeert aan de universiteit.", M, None),
])

# ---------------- DAGEN (11) ----------------
add("dagen", [
    ("maandag", "segunda-feira", "Segunda-feira eu trabalho.", "Op maandag werk ik.", E, None),
    ("dinsdag", "terça-feira", "Terça-feira tenho aula.", "Op dinsdag heb ik les.", E, None),
    ("woensdag", "quarta-feira", "Quarta-feira é meio da semana.", "Woensdag is midden in de week.", E, None),
    ("donderdag", "quinta-feira", "Quinta-feira vou ao mercado.", "Op donderdag ga ik naar de markt.", E, None),
    ("vrijdag", "sexta-feira", "Sexta-feira é o último dia útil.", "Vrijdag is de laatste werkdag.", E, None),
    ("zaterdag", "sábado", "Sábado eu descanso.", "Op zaterdag rust ik uit.", E, None),
    ("zondag", "domingo", "Domingo almoçamos em família.", "Op zondag eten we samen als familie.", E, None),
    ("vandaag", "hoje", "Hoje está um dia lindo.", "Vandaag is het een mooie dag.", E, None),
    ("morgen", "amanhã", "Amanhã eu viajo.", "Morgen ga ik reizen.", E, "a-ma-njang"),
    ("gisteren", "ontem", "Ontem eu estudei.", "Gisteren heb ik gestudeerd.", E, None),
    ("week", "semana", "Esta semana foi corrida.", "Deze week was druk.", E, None),
])

# ---------------- MAANDEN (12) ----------------
add("maanden", [
    ("januari", "janeiro", "Janeiro é o primeiro mês.", "Januari is de eerste maand.", E, None),
    ("februari", "fevereiro", "Fevereiro é curto.", "Februari is kort.", E, None),
    ("maart", "março", "Março começa o outono no Brasil.", "In maart begint de herfst in Brazilië.", E, "mar-soo"),
    ("april", "abril", "Abril tem chuva.", "April heeft regen.", E, None),
    ("mei", "maio", "Maio é um mês bonito.", "Mei is een mooie maand.", E, None),
    ("juni", "junho", "Junho tem festa junina.", "In juni is er het junifeest.", E, None),
    ("juli", "julho", "Julho é frio no sul.", "Juli is koud in het zuiden.", E, None),
    ("augustus", "agosto", "Agosto é seco.", "Augustus is droog.", E, None),
    ("september", "setembro", "Setembro é primavera no Brasil.", "September is lente in Brazilië.", E, None),
    ("oktober", "outubro", "Outubro tem muitas flores.", "Oktober heeft veel bloemen.", E, None),
    ("november", "novembro", "Novembro é quente.", "November is warm.", E, None),
    ("december", "dezembro", "Dezembro é verão no Brasil.", "December is zomer in Brazilië.", E, None),
])

# ---------------- KLEUREN (12) ----------------
add("kleuren", [
    ("rood", "vermelho", "O carro é vermelho.", "De auto is rood.", E, "ver-meh-ljoo"),
    ("blauw", "azul", "O céu está azul.", "De lucht is blauw.", E, "a-zool"),
    ("groen", "verde", "A grama é verde.", "Het gras is groen.", E, "ver-jee"),
    ("geel", "amarelo", "O sol é amarelo.", "De zon is geel.", E, "a-ma-reh-loo"),
    ("zwart", "preto", "O gato é preto.", "De kat is zwart.", E, "preh-too"),
    ("wit", "branco", "A neve é branca.", "Sneeuw is wit.", E, "bran-koo"),
    ("grijs", "cinza", "O céu está cinza hoje.", "De lucht is vandaag grijs.", E, "sin-za"),
    ("roze", "rosa", "Ela gosta da cor rosa.", "Zij houdt van de kleur roze.", E, None),
    ("oranje", "laranja", "Eu adoro a cor laranja.", "Ik hou van de kleur oranje.", E, None),
    ("paars", "roxo", "A flor é roxa.", "De bloem is paars.", E, "hoh-sjoo"),
    ("bruin", "marrom", "Seus olhos são marrons.", "Zijn ogen zijn bruin.", E, "ma-hong"),
    ("goudkleurig", "dourado", "O anel é dourado.", "De ring is goudkleurig.", M, None),
])

# ---------------- CIJFERS (21) ----------------
add("cijfers", [
    ("nul", "zero", "O placar está zero a zero.", "De stand is nul-nul.", E, None),
    ("een", "um", "Eu tenho um irmão.", "Ik heb één broer.", E, "oong"),
    ("twee", "dois", "Ela tem dois filhos.", "Zij heeft twee kinderen.", E, "doh-ees"),
    ("drie", "três", "Compre três maçãs.", "Koop drie appels.", E, "trays"),
    ("vier", "quatro", "São quatro horas.", "Het is vier uur.", E, "kwa-troo"),
    ("vijf", "cinco", "Tenho cinco reais.", "Ik heb vijf real.", E, "sin-koo"),
    ("zes", "seis", "A loja abre às seis.", "De winkel opent om zes uur.", E, "say-ees"),
    ("zeven", "sete", "Ela tem sete anos.", "Zij is zeven jaar oud.", E, "seh-chee"),
    ("acht", "oito", "São oito da noite.", "Het is acht uur 's avonds.", E, "oy-too"),
    ("negen", "nove", "Ele chega às nove.", "Hij komt om negen uur aan.", E, "noh-vee"),
    ("tien", "dez", "Tenho dez dedos.", "Ik heb tien vingers.", E, "dez"),
    ("elf", "onze", "São onze horas.", "Het is elf uur.", E, "on-zee"),
    ("twaalf", "doze", "O ano tem doze meses.", "Het jaar heeft twaalf maanden.", E, "doh-zee"),
    ("dertien", "treze", "Ela tem treze anos.", "Zij is dertien jaar oud.", M, "treh-zee"),
    ("veertien", "catorze", "Faltam catorze dias.", "Er zijn nog veertien dagen.", M, None),
    ("vijftien", "quinze", "São quinze minutos.", "Het is vijftien minuten.", M, "kin-zee"),
    ("zestien", "dezesseis", "Ele tem dezesseis anos.", "Hij is zestien jaar oud.", M, None),
    ("zeventien", "dezessete", "Faltam dezessete dias.", "Er zijn nog zeventien dagen.", M, None),
    ("achttien", "dezoito", "Ela completa dezoito anos.", "Zij wordt achttien jaar.", M, None),
    ("negentien", "dezenove", "São dezenove pessoas.", "Er zijn negentien mensen.", M, None),
    ("twintig", "vinte", "Custa vinte reais.", "Het kost twintig real.", M, "vin-chee"),
])

# ---------------- KLEDING (14) ----------------
add("kleding", [
    ("overhemd", "camisa", "Ele usa uma camisa branca.", "Hij draagt een wit overhemd.", E, "ka-mee-za"),
    ("t-shirt", "camiseta", "Comprei uma camiseta nova.", "Ik heb een nieuw t-shirt gekocht.", E, None),
    ("broek", "calça", "Esta calça é confortável.", "Deze broek is comfortabel.", E, "kal-sa"),
    ("jurk", "vestido", "O vestido é azul.", "De jurk is blauw.", E, None),
    ("rok", "saia", "Ela usa uma saia amarela.", "Zij draagt een gele rok.", E, "sah-ya"),
    ("schoen", "sapato", "Meus sapatos são novos.", "Mijn schoenen zijn nieuw.", E, None),
    ("sandaal", "sandália", "No verão uso sandálias.", "In de zomer draag ik sandalen.", E, None),
    ("sok", "meia", "Perdi uma meia.", "Ik ben een sok kwijt.", E, "may-a"),
    ("jas", "casaco", "Está frio, use um casaco.", "Het is koud, draag een jas.", E, None),
    ("blouse", "blusa", "A blusa é rosa.", "De blouse is roze.", M, None),
    ("korte broek", "short", "As crianças usam short no verão.", "De kinderen dragen een korte broek in de zomer.", M, None),
    ("hoed", "chapéu", "Ele usa chapéu na praia.", "Hij draagt een hoed op het strand.", M, "sja-peh-oo"),
    ("riem", "cinto", "O cinto é de couro.", "De riem is van leer.", M, None),
    ("bril", "óculos", "Preciso dos meus óculos.", "Ik heb mijn bril nodig.", E, "oh-koo-loos"),
])

# ---------------- STAD (17) ----------------
add("stad", [
    ("straat", "rua", "Eu moro nesta rua.", "Ik woon in deze straat.", E, "hoo-a"),
    ("laan", "avenida", "A avenida é muito longa.", "De laan is erg lang.", M, None),
    ("plein", "praça", "As pessoas se encontram na praça.", "Mensen ontmoeten elkaar op het plein.", M, "prah-sa"),
    ("winkel", "loja", "Essa loja vende roupas.", "Die winkel verkoopt kleding.", E, "loh-zja"),
    ("markt", "mercado", "Vou ao mercado comprar frutas.", "Ik ga naar de markt om fruit te kopen.", E, None),
    ("ziekenhuis", "hospital", "O hospital fica perto daqui.", "Het ziekenhuis is dichtbij.", E, None),
    ("apotheek", "farmácia", "A farmácia está aberta.", "De apotheek is open.", E, None),
    ("bank", "banco", "Preciso ir ao banco.", "Ik moet naar de bank.", M, None),
    ("restaurant", "restaurante", "Vamos jantar nesse restaurante.", "Laten we in dat restaurant eten.", E, None),
    ("hotel", "hotel", "O hotel tem piscina.", "Het hotel heeft een zwembad.", E, None),
    ("kerk", "igreja", "A igreja fica na praça.", "De kerk staat aan het plein.", M, "ee-greh-zja"),
    ("strand", "praia", "A praia de Copacabana é famosa.", "Het strand van Copacabana is beroemd.", E, "prai-a"),
    ("park", "parque", "As crianças brincam no parque.", "De kinderen spelen in het park.", E, None),
    ("stad", "cidade", "Rio é uma cidade linda.", "Rio is een prachtige stad.", E, "si-dah-jee"),
    ("wijk", "bairro", "Esse bairro é tranquilo.", "Die wijk is rustig.", M, "bai-hoo"),
    ("verkeerslicht", "semáforo", "Pare no semáforo vermelho.", "Stop bij het rode verkeerslicht.", M, None),
    ("politie", "polícia", "A polícia chegou rápido.", "De politie kwam snel.", M, None),
])

# ---------------- VERVOER (14) ----------------
add("vervoer", [
    ("auto", "carro", "Meu carro é novo.", "Mijn auto is nieuw.", E, "kah-hoo"),
    ("bus", "ônibus", "O ônibus está atrasado.", "De bus is te laat.", E, "oh-ni-boos"),
    ("trein", "trem", "O trem parte às sete.", "De trein vertrekt om zeven uur.", E, None),
    ("vliegtuig", "avião", "O avião decola agora.", "Het vliegtuig stijgt nu op.", E, "a-vi-aun"),
    ("fiets", "bicicleta", "Ando de bicicleta todo dia.", "Ik fiets elke dag.", E, "bi-si-kleh-ta"),
    ("motor", "moto", "Ele tem uma moto vermelha.", "Hij heeft een rode motor.", E, None),
    ("taxi", "táxi", "Vamos pegar um táxi.", "Laten we een taxi nemen.", E, None),
    ("metro", "metrô", "O metrô é rápido.", "De metro is snel.", M, None),
    ("boot", "barco", "O barco cruza o rio.", "De boot vaart de rivier over.", M, None),
    ("snelweg", "rodovia", "A rodovia está congestionada.", "De snelweg staat vast.", H, None),
    ("station", "estação", "Nos encontramos na estação.", "We ontmoeten elkaar bij het station.", M, "es-ta-saun"),
    ("vliegveld", "aeroporto", "O aeroporto fica longe.", "Het vliegveld ligt ver weg.", M, None),
    ("bestuurder", "motorista", "O motorista dirige devagar.", "De bestuurder rijdt langzaam.", M, None),
    ("kaartje", "passagem", "Comprei a passagem online.", "Ik heb het kaartje online gekocht.", M, None),
])

# ---------------- NATUUR (18) ----------------
add("natuur", [
    ("zon", "sol", "O sol está forte hoje.", "De zon is vandaag sterk.", E, None),
    ("maan", "lua", "A lua está cheia.", "De maan is vol.", E, None),
    ("ster", "estrela", "Vejo uma estrela no céu.", "Ik zie een ster aan de hemel.", E, "es-treh-la"),
    ("lucht/hemel", "céu", "O céu está limpo.", "De lucht is helder.", E, "seh-oo"),
    ("zee", "mar", "O mar está calmo.", "De zee is kalm.", E, None),
    ("rivier", "rio", "O rio passa pela cidade.", "De rivier stroomt door de stad.", E, None),
    ("berg", "montanha", "Vamos subir a montanha.", "We gaan de berg beklimmen.", M, "mon-ta-nja"),
    ("bos", "floresta", "A floresta amazônica é enorme.", "Het Amazonewoud is enorm.", M, "flo-res-ta"),
    ("boom", "árvore", "Essa árvore é muito alta.", "Die boom is erg hoog.", E, "ar-voo-ree"),
    ("bloem", "flor", "Ela ganhou uma flor.", "Zij kreeg een bloem.", E, None),
    ("zand", "areia", "A areia da praia é branca.", "Het zand van het strand is wit.", E, "a-ray-a"),
    ("regen", "chuva", "Vai cair chuva hoje.", "Het gaat vandaag regenen.", E, "shoo-va"),
    ("wind", "vento", "O vento está forte.", "De wind is sterk.", E, None),
    ("wolk", "nuvem", "Aquela nuvem é grande.", "Die wolk is groot.", M, "noo-vaing"),
    ("dier", "animal", "Esse animal é selvagem.", "Dat dier is wild.", E, None),
    ("hond", "cachorro", "Meu cachorro adora brincar.", "Mijn hond speelt graag.", E, "ka-shoh-hoo"),
    ("kat", "gato", "O gato dorme o dia todo.", "De kat slaapt de hele dag.", E, "gah-too"),
    ("vogel", "pássaro", "O pássaro canta pela manhã.", "De vogel zingt in de ochtend.", E, "pah-sa-roo"),
])

# ---------------- LICHAAM (18) ----------------
add("lichaam", [
    ("hoofd", "cabeça", "Minha cabeça dói.", "Mijn hoofd doet pijn.", E, "ka-beh-sa"),
    ("oog", "olho", "Seus olhos são verdes.", "Zijn ogen zijn groen.", E, "oh-ljoo"),
    ("neus", "nariz", "Meu nariz está frio.", "Mijn neus is koud.", E, "na-rees"),
    ("mond", "boca", "Abra a boca, por favor.", "Doe je mond open, alsjeblieft.", E, "boh-ka"),
    ("oor", "orelha", "Minha orelha está vermelha.", "Mijn oor is rood.", E, "oh-reh-lja"),
    ("hand", "mão", "Dê-me a sua mão.", "Geef me je hand.", E, "mauhn"),
    ("arm", "braço", "Ele quebrou o braço.", "Hij heeft zijn arm gebroken.", E, "brah-soo"),
    ("been", "perna", "Minha perna está cansada.", "Mijn been is moe.", E, "per-na"),
    ("voet", "pé", "Meu pé está doendo.", "Mijn voet doet pijn.", E, "peh"),
    ("vinger", "dedo", "Ela machucou o dedo.", "Zij heeft haar vinger bezeerd.", E, "deh-doo"),
    ("haar", "cabelo", "Seu cabelo é longo.", "Haar haar is lang.", E, "ka-beh-loo"),
    ("tand", "dente", "Escove os dentes todo dia.", "Poets elke dag je tanden.", E, "den-chee"),
    ("hart", "coração", "Meu coração bate rápido.", "Mijn hart klopt snel.", M, "ko-ra-saun"),
    ("rug", "costas", "Minhas costas doem.", "Mijn rug doet pijn.", M, "kos-tas"),
    ("buik", "barriga", "Sua barriga está cheia.", "Zijn buik is vol.", E, "ba-hee-ga"),
    ("nek", "pescoço", "Meu pescoço está rígido.", "Mijn nek voelt stijf.", M, "pes-koh-soo"),
    ("knie", "joelho", "Machuquei o joelho jogando.", "Ik heb mijn knie bezeerd tijdens het spelen.", M, "zjoo-eh-ljoo"),
    ("huid", "pele", "Sua pele é bronzeada.", "Zijn huid is gebruind.", M, "peh-lee"),
])

# ---------------- WERKWOORDEN (35) ----------------
add("werkwoorden", [
    ("zijn (permanent)", "ser", "Eu sou brasileiro.", "Ik ben Braziliaan.", E, "ser"),
    ("zijn (tijdelijk)", "estar", "Eu estou cansado.", "Ik ben moe.", E, "es-tar"),
    ("hebben", "ter", "Eu tenho um carro.", "Ik heb een auto.", E, "ter"),
    ("gaan", "ir", "Eu vou para casa.", "Ik ga naar huis.", E, "eer"),
    ("doen/maken", "fazer", "Vou fazer o jantar.", "Ik ga het avondeten maken.", E, "fa-zer"),
    ("praten", "falar", "Podemos falar depois?", "Kunnen we later praten?", E, "fa-lar"),
    ("eten", "comer", "Vamos comer agora.", "Laten we nu eten.", E, "ko-mer"),
    ("drinken", "beber", "Eu bebo água.", "Ik drink water.", E, "beh-ber"),
    ("slapen", "dormir", "Eu durmo oito horas.", "Ik slaap acht uur.", E, "dor-meer"),
    ("werken", "trabalhar", "Eu trabalho de segunda a sexta.", "Ik werk van maandag tot vrijdag.", E, "tra-ba-ljar"),
    ("studeren", "estudar", "Ela estuda português.", "Zij studeert Portugees.", E, "es-too-dar"),
    ("wonen", "morar", "Eu moro no Brasil.", "Ik woon in Brazilië.", E, "mo-rar"),
    ("houden van", "gostar", "Eu gosto de música.", "Ik houd van muziek.", E, "gos-tar"),
    ("willen", "querer", "Eu quero um café.", "Ik wil een koffie.", E, "keh-rer"),
    ("kunnen", "poder", "Você pode me ajudar?", "Kun je me helpen?", E, "po-der"),
    ("weten", "saber", "Eu sei a resposta.", "Ik weet het antwoord.", M, "sa-ber"),
    ("zien", "ver", "Eu vejo o mar daqui.", "Ik zie de zee van hieruit.", E, "ver"),
    ("horen", "ouvir", "Você ouve isso?", "Hoor je dat?", M, "oh-veer"),
    ("lopen", "andar", "Gosto de andar na praia.", "Ik loop graag op het strand.", E, "an-dar"),
    ("rennen", "correr", "As crianças adoram correr.", "Kinderen rennen graag.", E, "ko-her"),
    ("kopen", "comprar", "Vou comprar pão.", "Ik ga brood kopen.", E, "kom-prar"),
    ("verkopen", "vender", "Eles vendem frutas.", "Zij verkopen fruit.", M, "ven-der"),
    ("openen", "abrir", "Pode abrir a porta?", "Kun je de deur openen?", E, "a-breer"),
    ("sluiten", "fechar", "Feche a janela, por favor.", "Sluit het raam, alsjeblieft.", E, "fe-shar"),
    ("schrijven", "escrever", "Vou escrever uma carta.", "Ik ga een brief schrijven.", M, "es-kre-ver"),
    ("lezen", "ler", "Gosto de ler livros.", "Ik lees graag boeken.", E, "ler"),
    ("spelen", "jogar", "As crianças jogam bola.", "De kinderen spelen bal.", E, "zjo-gar"),
    ("reizen", "viajar", "Nós vamos viajar em julho.", "Wij gaan in juli reizen.", M, "vi-a-zjar"),
    ("aankomen", "chegar", "O trem vai chegar logo.", "De trein komt zo aan.", E, "sje-gar"),
    ("weggaan", "sair", "Ela vai sair agora.", "Zij gaat nu weg.", E, "sa-eer"),
    ("binnenkomen", "entrar", "Pode entrar!", "Kom binnen!", E, "en-trar"),
    ("helpen", "ajudar", "Você pode me ajudar?", "Kun je me helpen?", E, "a-zjoo-dar"),
    ("denken", "pensar", "Eu penso muito nisso.", "Ik denk daar veel over na.", M, "pen-sar"),
    ("wachten", "esperar", "Vou esperar aqui.", "Ik wacht hier.", M, "es-peh-rar"),
    ("leven", "viver", "Ele vive no Rio.", "Hij woont in Rio.", M, "vi-ver"),
])

# ---------------- BIJVOEGLIJKE NAAMWOORDEN (23) ----------------
add("bijvoeglijk", [
    ("goed", "bom", "Este bolo está bom.", "Deze taart is goed.", E, "bong"),
    ("slecht", "ruim", "O tempo está ruim hoje.", "Het weer is vandaag slecht.", E, "hoo-eeng"),
    ("groot", "grande", "A casa é grande.", "Het huis is groot.", E, "gran-jee"),
    ("klein", "pequeno", "O carro é pequeno.", "De auto is klein.", E, "pe-keh-noo"),
    ("mooi", "bonito", "O jardim é bonito.", "De tuin is mooi.", E, "bo-nee-too"),
    ("lelijk", "feio", "Esse sapato é feio.", "Die schoen is lelijk.", M, "fay-oo"),
    ("nieuw", "novo", "Comprei um celular novo.", "Ik heb een nieuwe telefoon gekocht.", E, "noh-voo"),
    ("oud", "velho", "Este livro é velho.", "Dit boek is oud.", E, "veh-ljoo"),
    ("blij", "feliz", "Estou muito feliz hoje.", "Ik ben vandaag erg blij.", E, "fe-lees"),
    ("verdrietig", "triste", "Ela está triste.", "Zij is verdrietig.", E, "trees-chee"),
    ("warm", "quente", "O café está quente.", "De koffie is warm.", E, "ken-chee"),
    ("koud", "frio", "A água está fria.", "Het water is koud.", E, "free-oo"),
    ("snel", "rápido", "Esse carro é rápido.", "Die auto is snel.", E, "hah-pi-doo"),
    ("langzaam", "lento", "O trem está lento hoje.", "De trein is vandaag langzaam.", M, "len-too"),
    ("sterk", "forte", "Ele é muito forte.", "Hij is erg sterk.", E, "for-chee"),
    ("zwak", "fraco", "O sinal está fraco.", "Het signaal is zwak.", M, "frah-koo"),
    ("duur", "caro", "Esse hotel é caro.", "Dat hotel is duur.", E, "kah-roo"),
    ("goedkoop", "barato", "O mercado é mais barato.", "De markt is goedkoper.", E, "ba-rah-too"),
    ("makkelijk", "fácil", "A prova foi fácil.", "De toets was makkelijk.", E, "fah-sil"),
    ("moeilijk", "difícil", "Português pode ser difícil.", "Portugees kan moeilijk zijn.", M, "di-fee-sil"),
    ("schoon", "limpo", "O quarto está limpo.", "De kamer is schoon.", E, "leem-poo"),
    ("vies", "sujo", "O carro está sujo.", "De auto is vies.", E, "soo-zjoo"),
    ("moe", "cansado", "Estou muito cansado.", "Ik ben erg moe.", E, "kan-sah-doo"),
])

print(len(data))
with open("./words_raw.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
