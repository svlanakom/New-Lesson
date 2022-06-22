import { pageContent, phone } from "../config/constants.js";
import { app } from "../index.js";

const homeController = async () => {
    let token = localStorage.getItem("token");
    if (!token) return;

    let listOfUsersContainer = pageContent.querySelector(".list-container");
    if (!listOfUsersContainer) return;

    let users;
    try {
        users = await app.Users.getAll();
    } catch (error) {
        localStorage.removeItem('token');
        console.log(error.message);
        app.userButtons();
        return;
    }

    if (Object.keys(users).length === 0) {
        listOfUsersContainer.innerHTML = "<h2>List is empty</h2>";
        return;
    }

    listOfUsersContainer.innerHTML = "<h2>List of users</h2>";
    for (const email in users) {
        listOfUsersContainer.innerHTML += `<div class="m-2"><div class="m-3">${email}</div>
            <a href="#delete"><button class="button-delete" id="delete-${email}">delete</button></a>
            <a href="#edit"><button class="button-edit" id="edit-${email}">edit</button></div></a>`;
    }

    const deleteUsersBtns = document.querySelectorAll(".button-delete");
    for (const btn of deleteUsersBtns) {
        btn.addEventListener("click", (event) => app.handleDelete(event));
    }

    const editeUsers = document.querySelectorAll(".button-edit");
    for (const btn of editeUsers) {
        btn.addEventListener("click", (event) => app.handleEdit(event));
    }
}

const aboutController = () => {

}

const contactController = () => {
    document.querySelector("#phone").innerHTML += phone;
}

const addPostController = async () => {
    const postsContainer = document.getElementById("postContainer");
    const sendPostForm = document.getElementById("sendPost");
    const token = localStorage.getItem('token');
    
    sendPostForm.addEventListener("submit", async function (event) {
        event.stopPropagation();
       
        const formData = new FormData(event.target);
        const response = await fetch("http://localhost:3000/createpost", {
            method: "post",
            body: formData,
            headers: {
                "Authorization": token
            }
        });
        let post;
        try {
            if (response.status === 401)
                throw new Error('User unauthorized!');
            post = await response.json();
        }
        catch (error) {
            localStorage.removeItem('token');
            console.log(error.message);
            app.userButtons();
            postsContainer.innerHTML = '';
        }
        if (post) postsContainer.innerHTML +=
            `<div style="width: 250px; height: 275px;">
                <h4>${post.title}</h4>
                <img src="http://localhost:3000/${post.imagePath}" style = "height: 130px; width: 200px;"></br>
                <p>${post.description}</p>
                <button class="postDelete" data-post-id="${post._id}">del</button>
            </div>`;
        bindDelButtons();
    });

    try {
        await loadPosts();
    } catch (error) {
        localStorage.removeItem('token');
        console.log(error.message);
        app.userButtons();
    }

    async function loadPosts() {
        let response = await fetch('http://localhost:3000/posts', {
            headers: {
                "Authorization": token
            }
        });
        postsContainer.innerHTML = '';
        if (response.status === 401)
            throw new Error('User unauthorized!');
        const posts = await response.json();
        posts.forEach(post => {
            postsContainer.innerHTML +=
                `<div style="width: 250px; height: 275px;">
                    <h4>${post.title}</h4>
                    <img src="http://localhost:3000/${post.imagePath}" style = "height: 130px; width: 200px;"></br>
                    <p>${post.description}</p>
                   <button class="postDelete" data-post-id="${post._id}">del</button>
                </div>`;
        });
        bindDelButtons();
    }

    function bindDelButtons() {
        const btns = document.getElementsByClassName("postDelete");
        Array.from(btns).forEach(btn => {
            btn.addEventListener('click', (event) => {
                const id = event.target.dataset.postId;
                fetch(`http://localhost:3000/deletepost/${id}`, {
                    method: "delete",
                    headers: {
                        "Authorization": token
                    }
                })
                    .then(response => response.text())
                    .then(async () => await loadPosts());
            });
        });
    }
}

export { homeController, aboutController, contactController, addPostController };