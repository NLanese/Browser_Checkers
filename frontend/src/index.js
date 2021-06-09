const domain = 'http://localhost:3000'

document.addEventListener("DOMContentLoaded", () => {
    fetch(domain + "/boards/new")
        .then(resp => console.log(resp))
})