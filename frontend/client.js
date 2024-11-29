// ვიღებ მონაცემთა ბაზიდან ინფორმაციას.
async function getTodo() {
    try {
        const response = await fetch('/api/todos');
        if (!response.ok) {
            throw `Status code: ${response.status}`;
        }
        const todo = await response.json();
        return todo;
    } catch (error) {
        // When the user could not be found
        console.error('Error :', error);
    }
};

// ვაგზავნი ინფორმაციას სერვერზე მონაცემთა ბაზაში ჩასაწერად
async function postDB(forDB){
    try{
     const response = await fetch('/', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(forDB)
       });
       //ვამოწმებ სტატუს სერერიდან გამოგზავნილ სტატუს კოდს 200 დან 299 დადებითია თუარადა გაისროლოს შეცდომა.
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }

       const content = await response.json();
       console.log(content);
     
     
    } catch (error){
       console.error('Error in postDB:', error);
    }
   
};

//    async function updateDB(id, activeCompleted){
//         const putDB = {
//             active_completed: activeCompleted
//         }
//         try{
//         const response = await fetch(`/${id}`, {
//             method: 'PUT',
//             headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(putDB)
//         });
//         //ვამოწმებ სტატუს სერერიდან გამოგზავნილ სტატუს კოდს 200 დან 299 დადებითია თუარადა გაისროლოს შეცდომა.
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const content = await response.json();
//         console.log(content);
//         } catch (error){
//         console.error('Error in postDB:', error);
//         }
//    };
   
async function updateDB(data, type) {
    try {
        let body = {};

        if (type === 'update-single') {
            // თუ update-single არის, მარტო ერთი ჩანაწერი განახლდება
            body = {
                type: "update-single",
                data: data
            };
        } else if (type === 'update-bulk') {
            // თუ bulk-update, მაშინ ბულკ განახლება
            body = {
                type: "update-bulk",
                data: data
            };
        } else {
            throw new Error("Unsupported update type");
        }

        const response = await fetch('/', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        //ვამოწმებ სტატუს სერერიდან გამოგზავნილ სტატუს კოდს 200 დან 299 დადებითია თუარადა გაისროლოს შეცდომა.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.json();
        console.log(content); // პასუხი

    } catch (error) {
        console.error('Error in updateDB:', error);
    }
};


async function deleteDB(data, type){
    try{
        let body = {};

        if (type === 'delete-single') {
            // თუ delete-single არის, მარტო ერთი ჩანაწერი განახლდება
            body = {
                type: "delete-single",
                data: data
            };
        } else if (type === 'delete-bulk') {
            // თუ bulk-delete, მაშინ ბულკ განახლება
            body = {
                type: "delete-bulk",
                data: data
            };
        } else {
            throw new Error("Unsupported delete type");
        }

    const response = await fetch(`/`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    //ვამოწმებ სტატუს სერერიდან გამოგზავნილ სტატუს კოდს 200 დან 299 დადებითია თუარადა გაისროლოს შეცდომა.
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.json();
    console.log("Response from server:", content);

    } catch (error){
    console.error('Error in deltetDB:', error);
    }
};

// async function deleteDB(id){
//     try{
//     const response = await fetch(`/${id}`, {
//         method: 'DELETE'
      
//     });
//     //ვამოწმებ სტატუს სერერიდან გამოგზავნილ სტატუს კოდს 200 დან 299 დადებითია თუარადა გაისროლოს შეცდომა.
//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const content = await response.json();
//     console.log("Response from server:", content);
//     } catch (error){
//     console.error('Error in deltetDB:', error);
//     }
// };
