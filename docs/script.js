let color = "YELLOW"

document.addEventListener("DOMContentLoaded", function() {
    const g = document.getElementsByClassName('grid')[0];
    // there should only be one
    let col;
    let element;
    for (let i = 0; i < 7; ++i){
        col = document.createElement('div');
        col.className = 'col';
        for (let j = 0; j < 6; ++j){
            element = document.createElement("button");
            element.className = "whiteCircle";
            col.appendChild(element);
        }
        col.addEventListener("click", f(col));
        g.appendChild(col);
    }

    function f(element) {
        return function() {
            children = element.children;
            n = children.length;
            for (let i = n-1; i > -1; --i){
                if (children[i].className == 'whiteCircle'){
                    children[i].className = color == "RED" ? 'redCircle' : 'yellowCircle';
                    color = color == "RED" ? "YELLOW" : "RED";
                    break;
                }
            }
        };
    }
});