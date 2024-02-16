const searchBar = document.getElementById('student-search');
const searchResults = document.getElementById('searchResults');
 
searchBar.addEventListener('keyup', typeAhead);
 
function typeAhead(event) {
  searchResults.innerHTML = "";
  fetch(`/api/search?q=${event.target.value}`)
  .then(response => response.json())
  .then(data => {
    // Do something with the data...
    let r = `<ul class="list-group">`
    for (let i = 0; i < data.length; i++) {
      r += `<li class="list-group-item"><a href="/student/${data[i]._id}">${data[i].name} - ${data[i].grade} (${data[i].advisor})</a></li>`
    }
    r += '</ul>'
    searchResults.innerHTML = r;
    //console.log(data[0].name);
    return;
  })
  .catch(error => {
    console.error('Error:', error);
  });
}