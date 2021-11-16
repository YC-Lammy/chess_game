let cells = [[],[],[],[],[],[],[],[]];
let whites = [];
let blacks = [];

let clickedChessId;
let clickedChessSide;

let pawn = document.getElementById("pawn")
let rook = document.getElementById("rook")
let knight = document.getElementById("knight")
let bishop = document.getElementById("bishop")
let king = document.getElementById("king")
let queen = document.getElementById("queen")

let dummyEvent = {
    dataTransfer:{
        setData:function(){},
        getData:function(a){
            if (a == "id"){
                return clickedChessId
            }
            if (a == "side"){
                return clickedChessSide
            }
        }},
    preventDefault: function(){}}

class Cell{
    element
    chess
    canDrop
    row
    column
    hintCircle
    chessCircle

    chessClickFn
    onDragOver(event){
        if (this.canDrop){
            event.preventDefault()
        }
    }
    onDrop(event){
        
        if (this.canDrop){
            event.preventDefault()
            var id = event.dataTransfer.getData("id");
            var side = event.dataTransfer.getData("side");

            if (this.chess){
                this.element.firstElementChild.removeChild(this.chess.element)
            }
            var chess = null;
            if (side === "white"){
                chess = whites[id]
            }
            if (side === "black"){
                chess = blacks[id]
            }
            this.element.firstElementChild.appendChild(chess.element)
            cells[chess.row][chess.column].chess = undefined;
            chess.row = this.row;
            chess.column = this.column;
            chess.firstMoved = true;
            chess.onDragEnd()
            this.chess = chess
            if ((this.row == 0 || this.row == 7) && this.chess.type == "pawn"){
                this.chess.type = "queen"
                let elem = queen.content.cloneNode(true).firstElementChild
                elem.draggable = "true";
                elem.onclick = function(ev) {
                    chess.clicked = !chess.clicked
                    if (chess.clicked){
                        chess.onDragEnd(ev)
                    } else{
                        clickedChessId = chess.id
                        clickedChessSide = chess.side
                        chess.onDragStart(dummyEvent)
                    }
                }
                elem.ondragstart = function(ev) {chess.onDragStart(ev)}
                elem.ondragend = function(ev) {chess.onDragEnd(ev)}
                elem.style.height = cellHeight
                elem.style.width = cellHeight
                elem.style.fill = this.chess.side
                this.element.firstElementChild.removeChild(this.chess.element)
                this.chess.element = elem
                this.element.firstElementChild.appendChild(this.chess.element)
            }
            for (let i in blacks){
                blacks[i].toggleDraggable()
            }
            for (let i in whites){
                whites[i].toggleDraggable()
            }
        }
        this.canDrop = false;
    }
    toggleDroppable(){
        this.canDrop = !this.canDrop
        if (!this.hintCircle){
            this.hintCircle = document.getElementById("grid_cell_hint").content.cloneNode(true).firstElementChild
            this.hintCircle.style.position= "relative"
            this.hintCircle.style.top = "0px"
            this.hintCircle.style.zIndex = "10"
            //this.hintCircle.width = cellHeight
        }
        if (this.canDrop){

            let self = this
            if (this.chess){
                this.chessCircle = document.createElementNS("http://www.w3.org/2000/svg","circle")
                this.chessCircle.setAttribute("r","20")
                this.chessCircle.setAttribute("cx","50")
                this.chessCircle.setAttribute("cy","50")
                this.chessCircle.setAttribute("fill","grey")
                this.chess.element.firstElementChild.appendChild(this.chessCircle)
                this.chessClickFn =this.chess.element.onclick
                this.chess.element.onclick = function(){
                    self.onDrop(dummyEvent)
                }
                return this
            }
            this.element.onclick = function(){
                self.onDrop(dummyEvent)
            }
            this.element.firstElementChild.appendChild(this.hintCircle)
        } else{
            if (this.chess){
                this.chess.element.onclick = this.chessClickFn
                this.chess.element.firstElementChild.removeChild(this.chessCircle)
                return this
            }
            this.element.onclick = undefined;
            this.element.firstElementChild.removeChild(this.hintCircle)
        }
        return this
    }
}

function ToggleCell(chessSide, row, column){
    let r = cells[row]
    if (r){
        let cell = r[column]
        if (cell){
            if (!cell.chess){
                return [cell.toggleDroppable(), false]
            } else if (cell.chess.side !== chessSide){
                return [cell.toggleDroppable(), true]
            }
        }
    }
    return []
}

class Chess{
    type = "pawn"
    firstMoved
    side
    direction
    id
    row
    column
    element
    canDropCells
    clicked
    onDragStart(event){
        event.dataTransfer.setData("id",this.id);
        event.dataTransfer.setData("side",this.side);

        // see if what cell could be drop
        

        switch (this.type){
        case "pawn":
                if (this.direction == "top"){
                    let r = cells[this.row+1]
                    let br = false;
                    if (r){
                        let cell = r[this.column]
                        if (cell){
                            if (!cell.chess){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            } else{
                                br = true
                            }
                        }
                        cell = r[this.column+1]
                        if (cell){
                            if (cell.chess && cell.chess.side !== this.side){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            }
                        }
                        cell = r[this.column-1]
                        if (cell){
                            if (cell.chess && cell.chess.side !== this.side){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            }
                        }
                    }
                    if (!br){
                        if (!this.firstMoved){
                            let a = ToggleCell(this.side, this.row+2, this.column)
                            let cell = a[0]
                            if (cell){
                                this.canDropCells.push(cell)
                            }
                        }
                    }
                     
                } else{
                    let br = false
                    
                    let r = cells[this.row-1]
                    if (r){
                        let cell = r[this.column]
                        if (cell){
                            if (!cell.chess){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            } else{
                                br = true
                            }
                        }
                        cell = r[this.column+1]
                        if (cell){
                            if (cell.chess && cell.chess.side !== this.side){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            }
                        }
                        cell = r[this.column-1]
                        if (cell){
                            if (cell.chess && cell.chess.side !== this.side){
                                cell.toggleDroppable()
                                this.canDropCells.push(cell)
                            }
                        }
                    }
                    if (!br){
                        if (!this.firstMoved){
                            let a = ToggleCell(this.side, this.row-2, this.column)
                            let cell = a[0]
                            if (cell){
                                this.canDropCells.push(cell)
                            }
                        }
                    }
                     
                }
                
            break;
        case "rook":
            let i = 1
            while (i<8-(8-this.column-1)){
                let a= ToggleCell(this.side, this.row, this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                } else{
                    break
                }
                i++
            }
            i = 1
            while (i<8-this.column){
                let a = ToggleCell(this.side, this.row, this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                }else if (br){
                    this.canDropCells.push(cell)
                    break
                } else{
                    break
                }
                i++
            }
            i = 1
            while(i<(8-this.row)){
                let a = ToggleCell(this.side, this.row+i, this.column)
                let cell = a[0]
                let br = a[1]
                if (cell  && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
                i++
            }
            i = 1
            while(i<(8-(8-this.row-1))){
                let a = ToggleCell(this.side, this.row-i, this.column)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
                i++
            }
            
            break;
        case "knight":
            {let a = ToggleCell(this.side,this.row+1,this.column+2)
            let cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-1,this.column+2)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row+1,this.column-2)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-1,this.column-2)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row+2,this.column+1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-2,this.column+1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row+2,this.column-1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-2,this.column-1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
        }
            break;
        case "bishop":
            for (let i=1;i<8-this.row;i++){
                let a = ToggleCell(this.side,this.row+i,this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-this.row;i++){
                let a = ToggleCell(this.side,this.row+i,this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-(8-this.row-1);i++){
                let a = ToggleCell(this.side,this.row-i,this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-(8-this.row-1);i++){
                let a = ToggleCell(this.side,this.row-i,this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            break;
        case "queen":
            for (let i =1;i<8-(8-this.column-1);i++){
                let a= ToggleCell(this.side, this.row, this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                } else{
                    break
                }
            }
            for (let i=1;i<8-this.column;i++){
                let a = ToggleCell(this.side, this.row, this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                }else if (br){
                    this.canDropCells.push(cell)
                    break
                } else{
                    break
                }
            }
            for(let i=1;i<(8-this.row);i++){
                let a = ToggleCell(this.side, this.row+i, this.column)
                let cell = a[0]
                let br = a[1]
                if (cell  && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for(let i=1;i<(8-(8-this.row-1));i++){
                let a = ToggleCell(this.side, this.row-i, this.column)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-this.row;i++){
                let a = ToggleCell(this.side,this.row+i,this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-this.row;i++){
                let a = ToggleCell(this.side,this.row+i,this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-(8-this.row-1);i++){
                let a = ToggleCell(this.side,this.row-i,this.column-i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            for (let i=1;i<8-(8-this.row-1);i++){
                let a = ToggleCell(this.side,this.row-i,this.column+i)
                let cell = a[0]
                let br = a[1]
                if (cell && !br){
                    this.canDropCells.push(cell)
                } else if (br){
                    this.canDropCells.push(cell)
                    break
                }else{
                    break
                }
            }
            break;
        case "king":
            {let a = ToggleCell(this.side,this.row+1,this.column)
            let cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-1,this.column)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row,this.column+1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row,this.column-1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row+1,this.column+1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-1,this.column+1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row+1,this.column-1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }
            a = ToggleCell(this.side,this.row-1,this.column-1)
            cell = a[0]
            if (cell){
                this.canDropCells.push(cell)
            }}
            break;
        }

    }
    onDragEnd(event){
        for (i=0;i<this.canDropCells.length;i++){
            this.canDropCells[i].toggleDroppable()
        }
        this.canDropCells = [];
    }
    toggleDraggable(){
        console.log(typeof this.element.draggable)
        if (this.element.draggable){
            this.element.draggable = false
            this.onClickFn = this.element.onclick
            this.element.onclick = undefined
        } else{
            this.element.draggable = "true"
            this.element.onclick = this.onClickFn
        }
    }
}

let board = document.getElementById("board")
boardHeight = String(board.clientHeight-10)+"px"
cellHeight = String(board.clientHeight/8-10)+"px"
board.style.width = boardHeight
board.style.height = boardHeight

let cellelement = document.getElementById("grid_cell")

for (let row=0;row<8;row++){
    let rowelement = document.getElementById("row"+String(row))
    for (let i=0;i<8; i++){

        let cell = new Cell();
        let cellnode = cellelement.content.cloneNode(true);

        cells[row][i] = cell;

        let element = cellnode.firstElementChild;
        cell.element = element;
        cell.row = row
        cell.column = i

        element.id = String(row) +","+ String(i);
        element.draggable = undefined
        element.ondrop = function(ev){cell.onDrop(ev)}
        element.ondragover = function(ev){cell.onDragOver(ev)}
        element.style.width = cellHeight
        element.style.height = cellHeight

        if (((i+1+row))%2 !=0 ){
            element.firstElementChild.style.backgroundColor = "lightgoldenrodyellow"
        }

        rowelement.appendChild(cellnode);
    }
}


for (i=0;i<8;i++){
    let chess = new Chess();
    let node = pawn.content.cloneNode(true);
    let elem = node.firstElementChild

    chess.element = elem;
    chess.id = blacks.length;
    chess.row = 1;
    chess.column = i;
    chess.side = "black";
    chess.direction = "top"
    chess.type = "pawn"
    chess.canDropCells = [];

    elem.draggable = "true";
    elem.onclick = function(ev) {
        chess.clicked = !chess.clicked
        if (chess.clicked){
            chess.onDragEnd(ev)
        } else{
            clickedChessId = chess.id
            clickedChessSide = chess.side
            chess.onDragStart(dummyEvent)
        }
    }
    elem.ondragstart = function(ev) {chess.onDragStart(ev)}
    elem.ondragend = function(ev) {chess.onDragEnd( ev)}
    elem.style.height = cellHeight
    elem.style.width = cellHeight

    blacks[blacks.length] = chess

    cells[1][i].chess = chess
    cells[1][i].element.firstElementChild.appendChild(node)
}

for (i=0;i<8;i++){
    let chess = new Chess();
    let node = pawn.content.cloneNode(true);
    let elem = node.firstElementChild

    chess.element = elem;
    chess.id = whites.length;
    chess.row = 6;
    chess.column = i;
    chess.side = "white";
    chess.direction = "bottom"
    chess.type = "pawn"
    chess.canDropCells = [];

    elem.draggable = "true";
    elem.onclick = function(ev) {
        chess.clicked = !chess.clicked
        if (chess.clicked){
            chess.onDragEnd(ev)
        } else{
            clickedChessId = chess.id
            clickedChessSide = chess.side
            chess.onDragStart(dummyEvent)
        }
    }
    elem.ondragstart = function(ev) {chess.onDragStart(ev)}
    elem.ondragend = function(ev) {chess.onDragEnd( ev)}
    elem.style.height = cellHeight
    elem.style.width = cellHeight
    elem.style.fill = "white"

    whites[whites.length] = chess

    cells[6][i].chess = chess
    cells[6][i].element.firstElementChild.appendChild(node)
}

for (i=0;i<8;i++){
    let chess = new Chess();
    var node;
    chess.direction = "top"
    if (i==0 || i == 7){
        node = rook.content.cloneNode(true);
        chess.type = "rook"
    } else if (i == 1 || i == 6){
        node = knight.content.cloneNode(true)
        chess.type = "knight"
    } else if (i == 2 || i == 5){
        node = bishop.content.cloneNode(true)
        chess.type = "bishop"
    } else if (i == 3){
        if (chess.direction == "bottom"){
            node = queen.content.cloneNode(true)
            chess.type = "queen"
        } else{
            node = king.content.cloneNode(true)
            chess.type = "king"
        }
    } else{
        if (chess.direction == "bottom"){
            node = king.content.cloneNode(true)
            chess.type = "king"
        } else{
            node = queen.content.cloneNode(true)
            chess.type = "queen"
        }
    }
    let elem = node.firstElementChild
    chess.element = elem;
    chess.id = blacks.length;
    chess.row = 0;
    chess.column = i;
    chess.side = "black";
    
    chess.canDropCells = [];
    

    elem.draggable = "true";
    elem.onclick = function(ev) {
        chess.clicked = !chess.clicked
        if (chess.clicked){
            chess.onDragEnd(ev)
        } else{
            clickedChessId = chess.id
            clickedChessSide = chess.side
            chess.onDragStart(dummyEvent)
        }
    }
    elem.ondragstart = function(ev) {chess.onDragStart(ev)}
    elem.ondragend = function(ev) {chess.onDragEnd(ev)}
    elem.style.height = cellHeight
    elem.style.width = cellHeight

    blacks[blacks.length] = chess

    cells[0][i].chess = chess
    cells[0][i].element.firstElementChild.appendChild(node)
}

for (i=0;i<8;i++){
        let chess = new Chess();
        var node;
        chess.direction = "bottom"
        if (i==0 || i == 7){
            node = rook.content.cloneNode(true);
            chess.type = "rook"
        } else if (i == 1 || i == 6){
            node = knight.content.cloneNode(true)
            chess.type = "knight"
        } else if (i == 2 || i == 5){
            node = bishop.content.cloneNode(true)
            chess.type = "bishop"
        } else if (i == 3){
            if (chess.direction == "bottom"){
                node = queen.content.cloneNode(true)
                chess.type = "queen"
            } else{
                node = king.content.cloneNode(true)
                chess.type = "king"
            }
        } else{
            if (chess.direction == "bottom"){
                node = king.content.cloneNode(true)
                chess.type = "king"
            } else{
                node = queen.content.cloneNode(true)
                chess.type = "queen"
            }
        }
        let elem = node.firstElementChild
        chess.element = elem;
        chess.id = whites.length;
        chess.row = 7;
        chess.column = i;
        chess.side = "white";
        
        chess.canDropCells = [];
        
    
        elem.draggable = "true";
        elem.onclick = function(ev) {
            chess.clicked = !chess.clicked
            if (chess.clicked){
                chess.onDragEnd(ev)
            } else{
                clickedChessId = chess.id
                clickedChessSide = chess.side
                chess.onDragStart(dummyEvent)
            }
        }
        elem.ondragstart = function(ev) {chess.onDragStart(ev)}
        elem.ondragend = function(ev) {chess.onDragEnd(ev)}
        elem.style.height = cellHeight
        elem.style.width = cellHeight
        elem.style.fill = "white"
    
        whites[whites.length] = chess
    
        cells[7][i].chess = chess
        cells[7][i].element.firstElementChild.appendChild(node)
}

for (let i in blacks){
    blacks[i].toggleDraggable()
}