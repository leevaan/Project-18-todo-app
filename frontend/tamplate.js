function tamplateTodo(uniqueId, todoValue, checked){
    return`  <div class="checkbox-cont">
                <input class="inp-cbx" id="${uniqueId}" type="checkbox"${checked}/>
                <label class="cbx-lbl" for="${uniqueId}">
                <div class="gradinet-cont">
                    <span class="gray-bck"></span>
                    <span class="checkd">
                    <svg width="12px" height="9px" viewbox="0 0 12 9">
                        <polyline points="1 5 4 8 11 1"></polyline>
                    </svg>
                    </span>
                </div>
                <span class="todo-txt">${todoValue}</span>
                </label>
            </div>
            <img class="remove-todo-icone" data-todo-id="${uniqueId}" src="./images/icon-cross.svg" alt="remove to do button">
        `;
}
