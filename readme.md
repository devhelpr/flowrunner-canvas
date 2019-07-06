#TODO's

- gulpfile : .watch reageert niet op ts EN tsx

- voorbereiden canvas lijst

	- afhankelijk van types de start en eindpunten berekenen
	- berekening voorbereiden en niet uitvoeren in render

- onDragEnd etc.. :

	- x/y positie bijwerken in lijst
	- connections automatisch herberekenen

	makeUpdates.js:42 ReactKonva: You have a Konva node with draggable = true and position defined but no onDragMove or onDragEnd events are handled.
Position of a node will be changed during drag&drop, so you should update state of the react app as well.
Consider to add onDragMove or onDragEnd events.
For more info see: https://github.com/konvajs/react-konva/issues/256
