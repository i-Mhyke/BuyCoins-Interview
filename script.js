import API_KEY from "./config.js";

const base_url = "https://api.github.com/graphql";
const search_form = document.querySelector("#search-form");

//DOM ELEMENTS
const user_avatar_small = document.querySelector("#user-avatar-small");
const user_avatar = document.querySelectorAll(".user-avatar");
const user_name = document.querySelectorAll(".user-name");
const user_login = document.querySelectorAll(".user-login");
const user_bio = document.querySelectorAll(".user-bio");
const user_repository_count = document.querySelector("#repo-count");
const repository_container = document.querySelector("#repo-container");
const error_section = document.querySelector("#error-section");
const main_section = document.querySelector("#main-section");

// Initialize website with my login name
async function init() {
  const initialData = await getUserData("i-Mhyke");
  generateComponents(initialData);
}

// Initialize query connection to the api
const fetchClient = async (query, variables) => {
  return fetch(base_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  }).then((response) => response.json());
};

// Set query parameters handle request to server
const getUserData = async (userName) => {
  return fetchClient(
    `
    query getUser($login: String!) {
        repositoryOwner(login: $login) {
            ... on User {
                id
                email
                name
                bio
                login
                avatarUrl
                repositories(first: 20) {
                    edges {
                        node {
                            id
                            forkCount
                            name
                            updatedAt
                            url
                            primaryLanguage {
                                name
                                color
                            }
                            stargazerCount
                            description
                        }
                    }
                    totalCount
                }
            }
        }
    }
    `,
    { login: userName }
  )
    .then((data) => data.data.repositoryOwner)
    .catch((error) => {
      console.log(error);
    });
};

// Handle form events.
search_form.addEventListener("submit", async (event) => {
  event.preventDefault();
  let search_input = document.querySelector("#search-input").value.trim();
  const userData = await getUserData(search_input);

  if (userData === null) {
    error_section.style.display = "block";
    main_section.style.display = "none";
    user_avatar_small.src =
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg";
  } else {
    main_section.style.display = "block";
    error_section.style.display = "none";
    generateComponents(userData);
    search_form.reset();
  }
});

// Populate components with dynamic data retrieved from the user's request
const generateComponents = (data) => {
  user_avatar_small.src = data.avatarUrl;
  user_avatar.forEach((user) => (user.src = data.avatarUrl));
  user_name.forEach((user) => (user.innerHTML = data.name));
  user_login.forEach((user) => (user.innerHTML = data.login));
  user_bio.forEach((user) => (user.innerHTML = data.bio));
  user_repository_count.innerHTML = data.repositories.totalCount;

  if (data.repositories.totalCount > 0) {
    let template = "";
    data.repositories.edges.map((repository) => {
      const { node } = repository;

      template += `
              <div class="repository flex-row">
                <div class="col-8">
                  <h3 class="repository-name">
                    <a href=${node.url} target='_blank'
                  rel='noopener noreferrer'>${
                    node.name !== null ? node.name : ""
                  }</a>
                  </h3>
                  <p class="repository-desc">
                    ${node.description !== null ? node.description : ""}
                  </p>
                  <div class="repository-details flex-row">
                    <p>
                      ${
                        node.primaryLanguage !== null
                          ? `
                      <span class="language-color" 
                        style="background-color: ${node.primaryLanguage.color}">
                        </span>`
                          : ""
                      }
                      <span class="language-text">${
                        node.primaryLanguage !== null
                          ? node.primaryLanguage.name
                          : ""
                      }</span>
                    </p>
                    <p class="flex-row items-center">
                      <span
                        class="iconify dark-icon"
                        data-inline="false"
                        data-icon="ant-design:star-outlined"
                        data-flip="horizontal"
                      ></span>
                      <span>${
                        node.stargazerCount !== null ? node.stargazerCount : ""
                      }</span>
                    </p>
                    <p class="flex-row items-center">
                      <span
                        class="iconify dark-icon"
                        data-inline="false"
                        data-icon="ph:git-fork"
                        data-flip="horizontal"
                      ></span>
                      <span>${node.forkCount}</span>
                    </p>
                    <p class="update-date">Updated on ${
                      node.updatedAt !== null
                        ? convertDateToString(node.updatedAt)
                        : ""
                    }</p>
                  </div>
                </div>
                <div class="col-2">
                  <button class="repo-button flex-row items-center">
                    <span
                      class="iconify dark-icon"
                      data-inline="false"
                      data-icon="ant-design:star-outlined"
                      data-flip="horizontal"
                    ></span>
                    <span>Star</span>
                  </button>
                </div>
              </div>
      `;
      repository_container.innerHTML = "";
      repository_container.insertAdjacentHTML("afterbegin", template);
    });
  } else {
    let template = "";

    template += `
      <div>
        <h3>${data.login} does not have any public repository</h3>
      </div>
    `;
    repository_container.innerHTML = "";
    repository_container.insertAdjacentHTML("afterbegin", template);
  }
};

// Util function that converts github date to readable string string
const convertDateToString = (date) => {
  let newDate = new Date(date);
  let dateArray = newDate.toDateString().split(" ");
  let dateFormat = dateArray[2] + " " + dateArray[1] + " " + dateArray[3];
  return dateFormat;
};

init();
