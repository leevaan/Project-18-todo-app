"use strict"
const changeLightTheme = document.querySelector("#link-light-theme");
const changeDarkTheme = document.querySelector("#link-dark-theme");
const btnTheme = document.querySelector(".btn-theme");
const bannerDark = document.querySelector(".banner-dark");

var activeButton = "all";
var enter = "";

// ========= DARK, LIGHT MODE LOGIC START===========>
//* When loading a document, it first checks local storages to see if the theme is selected.
//* Then it checks whether dark or light is selected in the browser settings.
//* Enables the light theme by pointer.

// Color scheme media reading check
const prefersScheme = window.matchMedia("(prefers-color-scheme: dark)");
// If the user changes the theme from the browser settings, it will automatically change on the web as well.
prefersScheme.addEventListener("change", (event) => {
    themeModeTemplate(event.matches ? 'dark': 'light');
});

// template of dark, light mode.
const themeModeTemplate = (scheme) => {
    if (scheme === 'dark') {
        changeLightTheme.disabled = true;
        changeDarkTheme.disabled = false;
        btnTheme.src = "images/icon-sun.svg";
    } else {
        changeLightTheme.disabled = false;
        changeDarkTheme.disabled = true
        btnTheme.src = "images/icon-moon.svg";
    }
}

//  Event listener for the button
btnTheme.addEventListener("click", () => {
    // Function to toggle the theme
    if (changeLightTheme.disabled) {
        themeModeTemplate('light');
        localStorage.setItem('theme', 'light');
        bannerDark.style.opacity = "0";
    } else {
        themeModeTemplate('dark');
        localStorage.setItem('theme', 'dark');
        bannerDark.style.opacity = "1";
    }
})

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    themeModeTemplate('dark');
    bannerDark.style.opacity = "1";
} else if(savedTheme === 'light'){
    themeModeTemplate('light');
    bannerDark.style.opacity = "0";
} else if(savedTheme == null){ // როდესაც იტვირთება გვერდი თუ localStorage ში არ გვაქვს ინფორმაცია შენახული მასინ ნახოს ბრაზერში რომელ თემას იყენებს მომხმარებელი და ის დააყენოს.
    themeModeTemplate(prefersScheme.matches ? 'dark' : 'light');
}
// =========> DARK, LIGHT MODE LOGIC end ===========

// =========>Draggable script START ===========
const todoUl = document.querySelector(".ul-todo-list");

const attachDragStartEnd = () => {
    const todoLi = document.querySelectorAll(".todo-list-li");
   
    todoLi.forEach((li) => {
        // ვამატებთ კლას "draggin" გადათრევის დაწყებისას. ( ვატარებთ ნებისმიერ მანიპულაციას ამ კლასისი გამოყენებით CSS დახმარებით)
        li.addEventListener("dragstart", () => {
            li.classList.add("dragging");
        }) 
        // ვშლით "draggin" კლასს გადათრევის დასრლებისას.
        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            // const updatedLiList = document.querySelectorAll(".todo-list-li");
            const checkBox = document.querySelectorAll(".inp-cbx");
            // ვამატებ მასივში ობიექტებად ასწყობილ, ახლიდან გადანომრლი თუდო სიას, რადგან თამიმდევრულად წამოვიღო ბაზიდან თუდუები დრაგდროპის შემდეგ.
            positonPut()
        })
    })
}

todoUl.addEventListener("dragover",(event) => {
    event.preventDefault();

    const draggingItem = document.querySelector(".dragging");
    // ვქმნი ელემნტების მასივს სადაც არაა გადასათრევი ელემენტი.
    let notDragging = [...todoUl.querySelectorAll(".todo-list-li:not(.dragging)")];
    // ვიგებ ელემნტის კორდინატებს რის მიხედვითაც ვადგენ რომელი ელემენტის წინ უნდა ჩავსვა გადათრეული ელემენტი.
    let nextItem = notDragging.find( item => {
        return event.clientY <= item.offsetTop + item.offsetHeight / 2;
    });
    
    todoUl.insertBefore(draggingItem, nextItem);
})

// =========>Draggable script END ===========

// =========> Add todo START ===========
// ვაგენერირებ უნიკალურ აიდის
let counter = 0;  // ინიციალიზაცია
function generateUniqueId() {
    const now = new Date();
    
    const year = now.getFullYear(); // 2024
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 08 
    const day = String(now.getDate()).padStart(2, '0');         // 29
    const hours = String(now.getHours()).padStart(2, '0');      // 10
    const minutes = String(now.getMinutes()).padStart(2, '0');  // 52
    const seconds = String(now.getSeconds()).padStart(2, '0');  // 21
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); // 001-999 // 1
  
    const uniqueId = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${counter}`;
    counter = (counter + 1) % 10;
    return uniqueId;
}
// მონაცემთა ბაზაში თუდუ პოზიციების განახლება
function positonPut(){
    const checkBox = document.querySelectorAll(".inp-cbx");
    let data = [];
    checkBox.forEach((li,index) => {
        data.push({todo_id: li.id, todo_position: index + 1});
    })
    updateDB(data, 'update-bulk');
    data = [];
}

const textTodo = document.querySelector("#text-todo")
let todoValue = "";

textTodo.addEventListener("keydown", (event) => {
    if (event.key === 'Enter'){
        event.preventDefault(); // Prevent default Enter key action
        
        todoValue = textTodo.value.trim();
       
        // todo დაემატოს იმ შემთვევაში როცა ცარიელი არაა პუტ ველიუ
        if(todoValue) {
            enter = "enter";
            checkEmptyChildren();

           

            const uniqueId = generateUniqueId();
            textTodo.value = "";
            // ვქმნით ახალ <li> ელემენტს
            const newLi = document.createElement("li");
            newLi.classList.add("todo-list-li");
            newLi.setAttribute("draggable", "true");
            //თუ კომპლითიდ ღილაკზე იქნება დაწერილი და მაგ დროს დაემატება თუ დუდო არ გამოჩდეს კომპლითიდ ცხრილში.
            if(activeButton == "completed"){
                newLi.style.display = "none"
            }
            newLi.innerHTML = `
            <div class="checkbox-cont">
                <input class="inp-cbx" id="${uniqueId}" type="checkbox"/>
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
            <img class="remove-todo-icone" data-todo-id="${uniqueId}" src="./images/icon-cross.svg" alt="remove to do button">`;
            // ვამატებთ ახალ <li> ელემენტს სიის თავში
            const firstLi = document.querySelector(".ul-todo-list li");
            document.querySelector(".ul-todo-list").insertBefore(newLi, firstLi);
            enter = "";
          
            // ვამზადებთ ობიექტს ბაზაში ჩასაწერად.
            const forDB = {
                users_todo: todoValue,
                todo_id: uniqueId,
            }
            // ვაგზავნი ინფორმაციას სერვერზე მონაცემთა ბაზაში ჩასაწერად
            postDB(forDB);
            // ვანახლებ მონაცემთა ბაზაში თუდუების პოზიციებს.
            positonPut()
            attachDragStartEnd();
            // დათვალე მხოლოდ აქტიური ჩეკბოქსი
            itemsLeftCount();
        }
    }
})
// =========> Add todo ENd ===========

// =========> Remove, All, active, clear completed buttons START ===========
const appBody = document.querySelector(".app-body");
const activeAll = document.querySelector(".active-all");
const active = document.querySelector(".active");
const completed = document.querySelector(".completed");
const liElements = document.querySelectorAll('.last-uls-ul li');
const emptyTodo = document.querySelector(".empty-todo");

// blue color changer
const activeColor = (blue) => {
    liElements.forEach((li) => {
        if(li.className == blue){
            li.style.color = "#3A7CFD";
            // აუქმებს ყველა მაუსის ივენთს
            li.style.pointerEvents = 'none';
            li.style.cursor = 'pointer'; 
        }else{
            li.style.pointerEvents = 'auto';
            li.style.color = "#5B5E7E";
        }
    })
}
const activeAllBTN = () => {
    activeButton = "all"
    localStorage.setItem('bottomButtons', 'active-all');

    const checkBox = document.querySelectorAll(".inp-cbx");
    checkBox.forEach((item) => {
        if(item.parentNode.parentNode.className == "todo-list-li" && item.parentNode.parentNode.style.display == "none"){
            item.parentNode.parentNode.style.display = "flex";
        }
    })
    checkEmptyChildren();
    activeColor("active-all");
}
// გავამზადე აქტივ ღილაკი ლოკალსთორიჯისთვის.
const activeBTN = () => {
    activeButton = "active";
    localStorage.setItem('bottomButtons', 'active');
    const checkBox = document.querySelectorAll(".inp-cbx");

    checkBox.forEach((item) => {
        if(item.checked){
            item.parentNode.parentNode.style.display = "none";
        }else if(!item.checked && item.parentNode.parentNode.style.display == "none"){
            item.parentNode.parentNode.style.display = "flex";
        }
    })
    checkEmptyChildren();
    activeColor("active");
}
// გავამზადე ქომფლითიდ ღილაკი ლოკალსთორიჯისთვის.
const completedBTN = () => {
    activeButton = "completed";
    localStorage.setItem('bottomButtons', 'completed');
    
    const checkBox = document.querySelectorAll(".inp-cbx");
    checkBox.forEach((item) => {
        if(!item.checked){
            item.parentNode.parentNode.style.display = "none";
        }else if(item.checked && item.parentNode.parentNode.style.display == "none"){
            item.parentNode.parentNode.style.display = "flex";
        }
    })
    checkEmptyChildren();
    activeColor("completed");
    
}
// ვუსმენ ბოდის კლიკზე.
appBody.addEventListener("click", (event) =>{
    if(event.target.className == "remove-todo-icone"){ //when press Remove button
        event.target.parentNode.remove();
        // dataset მხარს უჭერს კოსთომ ატრიბუტებს რომელთა სახელი რეკომედირებულია იწყებოდეს data-.
        let deleteData = {todo_id: event.target.dataset.todoId};
        deleteDB(deleteData, 'delete-single');
        deleteData = [];
        // დათვალე მხოლოდ აქტიური ჩეკბოქსი
        itemsLeftCount();
        checkEmptyChildren();
    }else if(event.target.className == "Clear-Completed"){ //when press Clear Completed button
        const checkBox = document.querySelectorAll(".inp-cbx");
        
        let deleteData = [];
        checkBox.forEach((item) => {
            if(item.checked){
                deleteData.push({todo_id: item.id})
                item.parentNode.parentNode.remove();
            }
        })

        deleteDB(deleteData, 'delete-bulk')
        deleteData = [];
        // დათვალე მხოლოდ აქტიური ჩეკბოქსი
        itemsLeftCount();
        checkEmptyChildren(checkBox);
    }else if(event.target.className == "active"){ //when press avtive button
        activeBTN();
    }else if(event.target.className == "completed"){ //when press completed button
        completedBTN();
    }else if(event.target.className == "active-all"){ //when press ALL button
        activeAllBTN();
    }else if(event.target.className == "inp-cbx"){

            if(event.target.checked){
                // updateDB(event.target.id, "checked")
                updateDB({todo_id: event.target.id, active_completed: "checked"}, 'update-single')

            } else {
                // updateDB(event.target.id, "")
                updateDB({todo_id: event.target.id, active_completed: ""}, 'update-single')

            }    
        }
    // როდესაც active ან completed ღილაკზე უკვე დაჭერილია და მას მერე მოხდება მონიშვნა ჩეკ ბოქსის
    if(event.target.className == "inp-cbx" && (activeButton == "active" || activeButton == "completed")){
        setTimeout(() => {
            event.target.parentNode.parentNode.style.display = "none";
            checkEmptyChildren();
        }, 400)
    }
    if(event.target.className == "inp-cbx"){
        setTimeout(() => {
            // დათვალე მხოლოდ აქტიური ჩეკბოქსი
            itemsLeftCount();
        }, 400)
       
    }
})
// =========> Remove button END ===========

// =========> Empty Todo On Off START ===========
const checkEmptyChildren = () => {
     const ulChildrens = document.querySelectorAll('.ul-todo-list li');
     
     //  რპდესაც არ არსებობოს არცერთი თუდ გამოვტანოთ თოდო ალერტი.
     if((activeButton == "all" || activeButton == "active") && enter != "enter"){
            if(ulChildrens.length == 0){
                emptyTodo.style.display = "flex";
            }else{
                emptyTodo.style.display = "none";
            }
        }
        if(enter == "enter"){
            if(activeButton != "completed" && ulChildrens.length == 0 && emptyTodo.style.display == "flex"){
                emptyTodo.style.display = "none";
            }
            // თუ აქცტივ ან კომპლითიდ ღილაკზე იქნებ დაჭერილი და მაგ დროს დაემატება თუდო გაქრეს ფოტო ცარიელი თუდუთი.
            if(activeButton == "active"  &&  emptyTodo.style.display == "flex"){
                 emptyTodo.style.display = "none"
            }
      
        }
        if(ulChildrens.length > 0 && enter != "enter" && (activeButton == "active" || activeButton == "completed")){
            const checkboxes = document.querySelectorAll('.ul-todo-list .inp-cbx');
            const allChecked = Array.from(document.querySelectorAll(".inp-cbx")).every(checkbox => checkbox.checked);
            const noneChecked = Array.from(checkboxes).every(checkbox => !checkbox.checked);

            if(activeButton == "active" && noneChecked) {
                emptyTodo.style.display = "none";
            }else if(activeButton == "active" && allChecked){
                emptyTodo.style.display = "flex";
            }

            if(activeButton == "completed" && noneChecked){
                emptyTodo.style.display = "flex";
            }else if(activeButton == "completed" && allChecked){
                emptyTodo.style.display = "none";
            }
        }
}    
checkEmptyChildren();
// // =========> Empty Todo On Off END ===========
function itemsLeftCount() {
    let itemsLefNumber = 0;
    const itemsLeft = document.querySelectorAll(".items-left");
    const checkBoxes = document.querySelectorAll(".inp-cbx");
    
    checkBoxes.forEach((item) => {
        if (!item.checked) {
            itemsLefNumber++;
        }
    });
    itemsLeft.forEach((leftItem) => {
        leftItem.innerHTML = itemsLefNumber;
    });
}
// itemsLeftCount();   
