# Introducció als ordinadors: components d'un ordinador
> Què és un ordinador, com està organitzat per dins (arquitectura de Von Neumann i nivells d'abstracció), quins components el formen (CPU, memòries, busos i perifèrics), quin software fa servir i com funciona des que l'engeguem. Al final, les parts d'un portàtil real.

## 1. Què és un ordinador?
### Característiques d'un ordinador
- ⭐ **Clave:** un ordinador és una màquina **de propòsit general**, **digital**, **electrònica**, **programable**, **automàtica** i **amb emmagatzematge**.
  - De propòsit general: serveix per a moltes tasques diferents.
  - Programable: fa el que li indiquen els **programes**.

### Tenim ordinadors per tot arreu
- **Servidors**.
- De **sobretaula**, **portàtils** i **netbooks**.
- **Encastats** en televisions, mòbils i electrodomèstics.
- **Supercomputadors**.
- **Ordinadors quàntics**.

> 🧠 **Recorda:** ordinador = propòsit general + digital + electrònic + programable + automàtic + amb emmagatzematge. N'hi ha a tot arreu: dels servidors i supercomputadors als mòbils i electrodomèstics.

## 2. Estructura d'un ordinador
### L'arquitectura de Von Neumann
- Un ordinador està format per un conjunt de **subsistemes** amb funcions específiques.
- ⭐ **Estructura de Von Neumann**: la **CPU** (formada per la **UC**, unitat de control, i la **UP**, unitat de procés), la **memòria** (MEM) i l'**entrada/sortida** (E/S), connectades per un **bus**.
- Segons el material, la computadora consta de tres subsistemes principals: **Unitat de Control**, **Memòria** i **subsistemes d'Entrada/Sortida**. [dudoso: en el diagrama la unitat de control forma part de la CPU, juntament amb la unitat de procés]

### Diagrama de blocs d'un PC
- A la **placa mare** hi ha la **CPU** i la **RAM**.
- La CPU es comunica amb l'**adaptador gràfic** (monitor), les **interfícies paral·lel i sèrie** (impressora, mòdem), l'**adaptador de xarxa**, la **controladora de discos** (disc dur, disquetera) i el **teclat**.

> 🧠 **Recorda:** Von Neumann = CPU (UC + UP) + memòria + entrada/sortida, units pel bus.

## 3. Nivells d'abstracció
### De l'usuari a la lògica digital
- ⭐ Un ordinador es pot estudiar per **nivells d'abstracció**, de dalt a baix:

| Nivell | Nom | Exemple |
|---|---|---|
| 6 | **Usuari** | Programes executables |
| 5 | **Llenguatge d'alt nivell** | C++, Java, FORTRAN |
| 4 | **Llenguatge assemblador** | Codi assemblador |
| 3 | **Software del sistema** | Sistema operatiu, biblioteques |
| 2 | **Màquina** | Arquitectura del joc d'instruccions |
| 1 | **Control** | Microprogramació o control cablejat |
| 0 | **Lògica digital** | Circuits, portes lògiques |

### Hardware i software
- ⭐ **Software** (del nivell 1 al 6):
  - **Software d'aplicació**: escrit en **llenguatges d'alt nivell**.
  - **Software del sistema** → **sistema operatiu**: gestiona l'entrada/sortida, gestiona la memòria i l'emmagatzematge, i programa tasques i comparteix recursos.
- ⭐ **Hardware** (nivell 0): **processador**, **memòria** i **dispositius d'E/S**.
- ⭐ El **compilador** tradueix el codi d'**alt nivell** a **llenguatge màquina**.
- En aquesta assignatura s'estudien el **nivell 0** (hardware: CPU i controladors dels dispositius) i el **nivell 5** (programació en llenguatges d'alt nivell).

> 🧠 **Recorda:** 7 nivells (0 a 6): de la lògica digital (0) a l'usuari (6). Hardware = nivell 0; software = nivells 1-6. El compilador passa d'alt nivell a llenguatge màquina.

## 4. CPU, memòria i busos
### Hardware
- ⭐ **Hardware**: «és tota aquella part de l'ordinador que es pot **partir amb una destral**» (les parts físiques). Exemples: torre, monitor, teclat, ratolí, altaveus, impressora.

### La CPU: unitat central de procés
- ⭐ La **CPU** està formada per:
  - **Unitat de control**: **obté** les instruccions, les **descodifica** i les **executa**.
  - **Unitat aritmètica-lògica** (ALU): fa les **operacions lògiques i matemàtiques**.
- El **microprocessador** és el component **més important** de l'ordinador: fa totes les operacions que permeten executar els programes, i d'ell **depèn la potència** final del sistema. Exemples: Intel Core i7, AMD Sempron.

### La memòria
- Magatzem de les **dades** i de les **instruccions** dels programes que executarà la CPU.
- ⭐ **Memòria RAM**:
  - Emmagatzema les **instruccions** dels programes que executarà la CPU i les **dades** amb què treballen.
  - **En apagar el subministrament elèctric, se'n perd el contingut.**
  - Es pot **escriure i llegir**. És expandible i intercanviable.
- ⭐ **Memòria ROM**:
  - Emmagatzema les instruccions d'alguns programes **vitals**: els que **engeguen l'ordinador** i fan els **diagnòstics**, part del sistema operatiu...
  - **Només és de lectura.**

### Busos de dades
- ⭐ **Busos**: línies per on **circula la informació** entre la **CPU**, la **memòria** i els **dispositius d'entrada i sortida**.

> 🧠 **Recorda:** CPU = unitat de control (obté, descodifica i executa) + ALU (càlculs i lògica). RAM = lectura i escriptura, s'esborra en apagar. ROM = només lectura, programes d'arrencada. El bus comunica CPU, memòria i E/S.

## 5. Perifèrics d'entrada
### Tipus de perifèrics
- ⭐ Hi ha quatre tipus de perifèrics: **d'entrada** de dades, **de sortida** de dades, **d'entrada i sortida** i **d'emmagatzematge**.
- ⭐ Els **perifèrics d'entrada** permeten a l'usuari **introduir dades** a l'ordinador.

### Exemples de perifèrics d'entrada
- **Teclat**. Classes: amb **trackball**, **sense fils** i **flexibles/enrotllables**.
- **Ratolí** (mouse). Tipus bàsics: **mecànic**, **òptic** i **sense fils**.
- **Joystick** i comandaments de joc.
- **Taula gràfica** i **llapis òptic**.
- **Càmera web**.
- **Escàner**: converteix en format digital els textos o imatges impresos; primer els ha de rastrejar (escanejar) i després els tradueix a llenguatge **binari**. Tipus: de codi de barres, impressora amb escàner, escàner de sobretaula.
- **Micròfon**.
- **Sensors**: dispositius que capten senyals de l'entorn: **llum**, **so**, **distància**...

> 🧠 **Recorda:** entrada = introduir dades (teclat, ratolí, joystick, taula gràfica, llapis òptic, càmera web, escàner, micròfon, sensors).

## 6. Perifèrics de sortida, d'entrada i sortida i d'emmagatzematge
### Perifèrics de sortida
- ⭐ Permeten a l'usuari **obtenir dades o accions** de l'ordinador.
- **Pantalla o monitor**: LCD, LED, TRC i pantalles tàctils.
- **Impressores**: làser i de tinta contínua, entre d'altres.
- **Altaveus** (amb la targeta de so).
- **Plotter**: de tinta i de tall.
- **Actuadors**: dispositius que **executen ordres** i solen fer alguna **acció motriu**, com els **motors**.

### Perifèrics d'entrada i sortida
- ⭐ Permeten a l'usuari **introduir o obtenir** dades de l'ordinador.
- **Mòdem** (mòdem o router, mòdem USB).
- **Targetes de xarxa**: amb connector **RJ45** o **sense fils**.

### Perifèrics d'emmagatzematge
- ⭐ Permeten **emmagatzemar dades** a l'ordinador.
- **Discs òptics**: CD i DVD.
- **Disc dur**.
- **Memòries flash**: llapis USB i targetes microSD.

> 🧠 **Recorda:** sortida = obtenir dades (monitor, impressora, altaveus, plotter, actuadors). Entrada i sortida = mòdem i targeta de xarxa. Emmagatzematge = CD/DVD, disc dur, memòries flash.

## 7. Software
### Què és el software
- ⭐ **Software**: conjunt dels **programes** de còmput, procediments, regles, documentació i dades associades que formen part de les operacions d'un sistema de computació (**estàndard 729 de l'IEEE**).

### Tipus de software
- ⭐ **Software de sistema**: desvincula l'usuari i el programador dels detalls de l'ordinador concret (memòria, discos, ports, impressores, pantalles, teclats...). Exemples: macOS, Windows, Linux (Ubuntu, Fedora), Android, Bash.
- ⭐ **Sistema operatiu**: el programari **bàsic que controla un ordinador**. Té tres grans funcions:
  1. **Coordina i manipula el maquinari**: CPU, memòria, impressores, discos, teclat, ratolí...
  2. **Organitza i gestiona el sistema de fitxers** de les unitats d'emmagatzematge.
  3. **Gestiona els errors de maquinari**, entre altres coses.
- ⭐ **Programari d'aplicacions**: permet a l'usuari fer **tasques específiques** en qualsevol camp que es pugui automatitzar.
- ⭐ **Software de programació**: conjunt d'**eines** que permeten al programador **desenvolupar programes** amb diferents llenguatges de programació (Java, HTML, PHP, MySQL, .NET...).

### Programes
- ⭐ **Programa**: conjunt d'**instruccions** que fem servir per donar ordres a l'ordinador i fer les tasques necessàries. Els escrivim amb diferents **llenguatges**.

> 🧠 **Recorda:** software = programes i dades. Tres tipus: de sistema (el SO), d'aplicacions i de programació. El SO controla el maquinari, gestiona els fitxers i els errors.

## 8. Com funciona un ordinador?
### L'arrencada
- ⭐ En engegar l'ordinador s'activa la **font d'alimentació**, que dona energia als components.
- ⭐ L'ordinador executa la seqüència d'operacions de la **memòria ROM (BIOS)** per posar-se en marxa i **revisa els elements instal·lats**.
- Després executa instruccions del **sistema operatiu** i posa en marxa l'**intèrpret de comandes** per interactuar amb l'usuari (per exemple, l'escriptori de Windows).

### Executar programes
- ⭐ Quan activem un programa, **es carrega a la memòria RAM**. **Només s'executen programes emmagatzemats a la RAM.**
- Introduïm dades amb els **perifèrics d'entrada**; la **CPU** executa **una a una** les instruccions del programa.
- Les dades poden estar a la RAM, en algun perifèric o arribar per la **xarxa**.
- El programa pot enviar les dades a un **dispositiu de sortida** (p. ex. impressora), guardar-les en un **perifèric d'emmagatzematge** o enviar-les per la xarxa.
- La CPU pot executar **diversos programes alhora** repartint el seu temps entre ells, i diverses instruccions alhora de forma **segmentada**.
- La majoria d'ordinadors actuals tenen **diverses CPU**.

> 🧠 **Recorda:** font d'alimentació → ROM (BIOS) → sistema operatiu → intèrpret de comandes. Els programes s'executen des de la RAM, instrucció a instrucció.

## 9. Components del portàtil
### Què hi ha dins d'un portàtil
- ⭐ **Processador (CPU)**: és el **cervell de l'ordinador**. Va **sota el dissipador**.
- ⭐ **Memòria RAM**: permet **treballar amb diversos programes alhora**. És la **memòria temporal**.
- ⭐ **SSD** (memòria d'**emmagatzematge**): guarda el **sistema operatiu**, els **programes** i els teus **fitxers**. L'SSD **no és la RAM**.
- **Dissipador de calor**: evita que el processador **s'escalfi massa** (tub i aletes de coure).
- **Ventilador**: **refreda** el processador i el dissipador.
- **Targeta gràfica (GPU)**: processa els **gràfics i el vídeo**. En el model de la làmina és una targeta **dedicada**, sota el dissipador, al costat del processador.
- **Bateria principal**: **subministra energia** a tot l'ordinador.
- **Bateria de la CMOS**: **manté l'hora i la configuració de la BIOS**, encara que l'ordinador estigui apagat (és una moneda blava).
- **Mòdul Wi-Fi/Bluetooth**: permet la **connexió a internet** i a altres dispositius **sense fils**.
- **Altaveus**: permeten escoltar el so.
- **Cables i connectors**: uneixen tots els components de la **placa base**.

> 🧠 **Recorda:** l'SSD és la memòria d'emmagatzematge (no és la RAM). La RAM és la memòria temporal. El processador va sota el dissipador. La GPU processa els gràfics i el vídeo. La bateria principal alimenta tot l'ordinador. La bateria CMOS manté la configuració.

## Seqüència d'arrencada
| Pas | Què passa |
|---|---|
| 1 | S'activa la font d'alimentació |
| 2 | S'executa la ROM (BIOS) i es revisen els elements instal·lats |
| 3 | S'executen instruccions del sistema operatiu |
| 4 | Es posa en marxa l'intèrpret de comandes (p. ex. l'escriptori) |
| 5 | Obrim un programa: es carrega a la RAM i la CPU l'executa |

## Glossari
| Concepte | Definició |
|---|---|
| Hardware | Parts físiques de l'ordinador («les que es poden partir amb una destral») |
| Software | Programes, procediments, regles, documentació i dades d'un sistema informàtic |
| CPU | Unitat central de procés: unitat de control + unitat aritmètica-lògica |
| Unitat de control | Obté les instruccions, les descodifica i les executa |
| ALU | Unitat aritmètica-lògica: fa les operacions lògiques i matemàtiques |
| RAM | Memòria de lectura i escriptura; es perd en apagar |
| ROM | Memòria només de lectura amb els programes d'arrencada (BIOS) |
| Bus | Línies per on circula la informació entre CPU, memòria i E/S |
| Perifèric | Dispositiu d'entrada, de sortida, d'entrada i sortida o d'emmagatzematge |
| Actuador | Dispositiu que executa ordres amb una acció motriu (p. ex. un motor) |
| Sensor | Dispositiu que capta senyals de l'entorn (llum, so, distància...) |
| Sistema operatiu | Programari bàsic que controla l'ordinador |
| Compilador | Tradueix codi d'alt nivell a llenguatge màquina |
| Programa | Conjunt d'instruccions per donar ordres a l'ordinador |
| SSD | Memòria d'emmagatzematge del portàtil (sistema operatiu, programes i fitxers) |
| GPU | Targeta gràfica: processa els gràfics i el vídeo |
| Bateria CMOS | Manté l'hora i la configuració de la BIOS amb l'ordinador apagat |
